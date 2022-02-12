import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.css'],
})
export class DropdownFilterComponent implements OnInit {
  @Input() filter: string = '';
  @Input() button: string = 'btn-ghost';
  @Input() selected_id: string = '';
  @Input() selected_name: string = '';
  @Input() options: any = {};
  @Input() locations: any = {};
  @Output() setOptionEvent = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  setOption(option: any): void {
    this.setOptionEvent.emit(option);
  }

  getOptionStr(option: any): string {
    let str = '';
    switch (this.filter) {
      case 'option':
        return option;

      case 'season':
        return stringify.getSeasonStr(option);

      case 'pull':
        return stringify.getPullStr(option, this.locations);

      case 'class':
        return stringify.getClassStr(option);

      case 'location':
        return stringify.getLocationStr(option);

      case 'puller':
        return stringify.getPullerStr(option, true);

      case 'tractor':
        return stringify.getTractorStr(option);

      default:
        return '';
    }
  }
}
