import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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
    switch (this.column) {
      case 'puller':
        const puller = this.objects[id];
        if (!puller) return '';
        return puller.last_name + ', ' + puller.first_name;

      default:
        return '';
    }
  }
}
