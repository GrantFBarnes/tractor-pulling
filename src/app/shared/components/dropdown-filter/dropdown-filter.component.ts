import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  padDate(i: number): string {
    return i < 10 ? '0' + i : '' + i;
  }

  getDateStr(ds: string): string {
    const d = new Date(ds);
    return (
      d.getUTCFullYear() +
      '-' +
      this.padDate(d.getMonth() + 1) +
      '-' +
      this.padDate(d.getDate())
    );
  }

  getOptionStr(option: any): string {
    let str = '';
    switch (this.filter) {
      case 'option':
        return option;

      case 'season':
        return option.year;

      case 'pull':
        if (!option.id) return 'All';
        str = this.getDateStr(option.date);
        const loc = this.locations[option.location];
        if (loc) {
          str += ' - ' + loc.town + ', ' + loc.state;
        }
        if (option.youtube) {
          str += ' - (video)';
        }
        return str;

      case 'class':
        if (!option.id) return 'All';
        str = option.weight + ' ' + option.category;
        if (option.speed != 3) str += ' (' + option.speed + ')';
        return str;

      case 'location':
        return option.town + ', ' + option.state;

      case 'puller':
        return option.last_name + ', ' + option.first_name;

      case 'tractor':
        return option.brand + ' ' + option.model;

      default:
        return '';
    }
  }
}
