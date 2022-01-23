import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-manage-select-field',
  templateUrl: './manage-select-field.component.html',
  styleUrls: ['./manage-select-field.component.css'],
})
export class ManageSelectFieldComponent implements OnInit {
  @Input() id: string = '';
  @Input() column: string = '';
  @Input() value: any = {};
  @Input() objects: any = {};
  @Output() selectFieldEvent = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  selectField(value: any): void {
    this.selectFieldEvent.emit({
      id: this.id,
      column: this.column,
      value: value,
    });
  }

  padDate(i: number): string {
    return i < 10 ? '0' + i : '' + i;
  }

  getDateStr(ds: string): string {
    const d = new Date(ds);
    return (
      d.getUTCFullYear() +
      '-' +
      this.padDate(d.getMonth()) +
      '-' +
      this.padDate(d.getDate())
    );
  }

  getOptionStr(id: any): string {
    if (!id) return '';

    let str = '';
    switch (this.column) {
      case 'puller':
        const puller = this.objects[id];
        if (!puller) return '';
        return puller.last_name + ', ' + puller.first_name;

      case 'tractor':
        const tractor = this.objects[id];
        if (!tractor) return '';
        return tractor.brand + ' ' + tractor.model;

      case 'location':
        const location = this.objects[id];
        if (!location) return '';
        return location.town + ', ' + location.state;

      case 'season':
        const season = this.objects[id];
        if (!season) return '';
        return season.year;

      case 'pull':
        const pull = this.objects[id];
        if (!pull) return '';
        return this.getDateStr(pull.date);

      case 'class':
        const cl = this.objects[id];
        if (!cl) return '';
        str = cl.weight + ' ' + cl.category;
        if (cl.speed != 3) str += ' (' + cl.speed + ')';
        return str;

      default:
        return '';
    }
  }

  sortMethod = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    const a_val = this.getOptionStr(a.key);
    const b_val = this.getOptionStr(b.key);
    if (a_val < b_val) return -1;
    if (a_val > b_val) return 1;
    return 0;
  };
}
