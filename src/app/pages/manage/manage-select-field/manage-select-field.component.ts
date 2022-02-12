import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { KeyValue } from '@angular/common';

import * as stringify from 'src/app/shared/methods/stringify';

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

  getOptionStr(id: any): string {
    if (!id) return '';

    let str = '';
    switch (this.column) {
      case 'puller':
        return stringify.getPullerStr(this.objects[id], false);

      case 'tractor':
        return stringify.getTractorStr(this.objects[id]);

      case 'location':
        return stringify.getLocationStr(this.objects[id]);

      case 'season':
        return stringify.getSeasonStr(this.objects[id]);

      case 'pull':
        return stringify.getPullStr(this.objects[id], {});

      case 'class':
        return stringify.getClassStr(this.objects[id]);

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
