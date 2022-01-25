import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HttpService } from '../../shared/services/http/http.service';
import { Season } from '../../shared/interfaces/season';
import { Pull } from '../../shared/interfaces/pull';
import { Class } from '../../shared/interfaces/class';
import { Hook } from '../../shared/interfaces/hook';
import { Location } from '../../shared/interfaces/location';
import { Puller } from '../../shared/interfaces/puller';
import { Tractor } from '../../shared/interfaces/tractor';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  providers: [HttpService],
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  authorized: boolean = false;
  loading: boolean = true;

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};
  seasons: { [id: string]: Season } = {};
  pulls: { [id: string]: Pull } = {};
  classes: { [id: string]: Class } = {};
  hooks: { [id: string]: Hook } = {};

  table: string = '';
  table_options: string[] = [
    'locations',
    'pullers',
    'tractors',
    'seasons',
    'pulls',
    'classes',
    'hooks',
  ];

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pull_options: Pull[] = [];

  class_id: string = '';
  class_name: string = '';
  class_options: Class[] = [];

  location_id: string = '';
  location_name: string = '';
  location_options: Location[] = [];

  puller_id: string = '';
  puller_name: string = '';
  puller_options: Puller[] = [];

  tractor_id: string = '';
  tractor_name: string = '';
  tractor_options: Tractor[] = [];

  data: { [id: string]: any } = {};
  columns: string[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    // redirect to https if not localhost
    if (!window.origin.includes('local')) {
      if (location.protocol !== 'https:') {
        location.replace(
          'https:' + location.href.substring(location.protocol.length)
        );
      }
    }

    this.httpService.get('/api/authenticated').subscribe({
      next: () => this.authorize(),
      error: () => (this.authorized = false),
    });
  }

  fieldChange(id: string): void {
    this.httpService
      .put('/api/pulling/' + this.table, this.data[id])
      .subscribe({
        next: () => this.authorize(),
        error: () => alert('Failed to save changes!'),
      });
  }

  selectField(obj: any): void {
    if (!obj.id) return;
    if (!this.data[obj.id]) return;
    if (!obj.column) return;
    this.data[obj.id][obj.column] = obj.value;
    this.fieldChange(obj.id);
  }

  addNew(): void {
    const body = {
      season: this.season_id,
      pull: this.pull_id,
      class: this.class_id,
      location: this.location_id,
      puller: this.puller_id,
      tractor: this.tractor_id,
    };
    this.httpService.post('/api/pulling/' + this.table, body).subscribe({
      next: () => this.authorize(),
      error: () => alert('Failed to create new!'),
    });
  }

  showAddNew(): boolean {
    switch (this.table) {
      case '':
        return false;

      case 'pulls':
        if (!this.season_id) return false;
        return true;

      case 'classes':
        if (!this.pull_id) return false;
        return true;

      case 'hooks':
        if (!this.class_id) return false;
        return true;

      default:
        return true;
    }
  }

  getTractorStr(tractor: Tractor): string {
    return tractor.brand + ' ' + tractor.model;
  }

  getPullerStr(puller: Puller): string {
    return puller.last_name + ', ' + puller.first_name;
  }

  getLocationStr(location: Location): string {
    return location.town + ', ' + location.state;
  }

  getClassStr(c: Class): string {
    if (!c.id) return 'All';
    let str = c.weight + ' ' + c.category;
    if (c.speed != 3) str += ' (' + c.speed + ')';
    return str;
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

  getPullStr(p: Pull): string {
    if (!p.id) return 'All';
    let str = this.getDateStr(p.date);
    const loc = this.locations[p.location];
    if (loc) {
      str += ' - ' + loc.town + ', ' + loc.state;
    }
    return str;
  }

  getRowStr(obj: any): string {
    if (!obj) return '';
    switch (this.table) {
      case 'pullers':
        return this.getPullerStr(obj);

      case 'tractors':
        return this.getTractorStr(obj);

      case 'locations':
        return this.getLocationStr(obj);

      case 'seasons':
        return obj.year;

      case 'pulls':
        return this.getPullStr(obj);

      case 'classes':
        return this.getClassStr(obj);

      case 'hooks':
        return obj.position;

      default:
        return '';
    }
  }

  sortByTractor(a: any, b: any): number {
    const a_name = a.brand + ' ' + a.model;
    const b_name = b.brand + ' ' + b.model;
    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
    return 0;
  }

  sortByPuller(a: any, b: any): number {
    const a_name = a.last_name + ', ' + a.first_name;
    const b_name = b.last_name + ', ' + b.first_name;
    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
    return 0;
  }

  sortByLocation(a: any, b: any): number {
    const a_name = a.town + ', ' + a.state;
    const b_name = b.town + ', ' + b.state;
    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
    return 0;
  }

  sortByWeight(a: any, b: any): number {
    const a_weight = parseInt(a.weight);
    const b_weight = parseInt(b.weight);
    if (a_weight < b_weight) return -1;
    if (a_weight > b_weight) return 1;
    const a_category = a.category;
    const b_category = b.category;
    if (a_category < b_category) return 1;
    if (a_category > b_category) return -1;
    return 0;
  }

  sortByDate(a: any, b: any): number {
    const a_date = a.date;
    const b_date = b.date;
    if (a_date < b_date) return 1;
    if (a_date > b_date) return -1;
    return 0;
  }

  sortByYear(a: any, b: any): number {
    const a_year = parseInt(a.year);
    const b_year = parseInt(b.year);
    if (a_year < b_year) return 1;
    if (a_year > b_year) return -1;
    return 0;
  }

  sortMethod = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    const a_val = this.getRowStr(a.value);
    const b_val = this.getRowStr(b.value);
    if (a_val < b_val) return -1;
    if (a_val > b_val) return 1;
    return 0;
  };

  getData(): void {
    switch (this.table) {
      case 'locations':
        this.data = this.locations;
        this.columns = ['town', 'state'];
        break;

      case 'pullers':
        this.data = this.pullers;
        this.columns = ['first_name', 'last_name'];
        break;

      case 'tractors':
        this.data = this.tractors;
        this.columns = ['brand', 'model'];
        break;

      case 'seasons':
        this.data = this.seasons;
        this.columns = ['year'];
        break;

      case 'pulls':
        this.data = this.pulls;
        this.columns = ['season', 'location', 'date', 'youtube'];
        break;

      case 'classes':
        this.data = this.classes;
        this.columns = ['pull', 'category', 'weight', 'speed'];
        break;

      case 'hooks':
        this.data = this.hooks;
        this.columns = ['class', 'puller', 'tractor', 'distance'];
        break;

      default:
        break;
    }
    this.loading = false;
  }

  getTractors(): void {
    this.tractors = {};
    this.tractor_id = '';
    this.tractor_name = 'Pick a Tractor';
    this.tractor_options = [];

    let api = '/api/pulling/tractors';
    if (this.table !== 'hooks') {
      if (this.class_id) {
        api += '/class/' + this.class_id;
      } else if (this.pull_id) {
        api += '/pull/' + this.pull_id;
      } else if (this.season_id) {
        api += '/season/' + this.season_id;
      }
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.tractors[data[i].id] = data[i];
      }
      this.tractor_options = data;
      this.tractor_options.sort(this.sortByTractor);
      this.getData();
    });
  }

  getPullers(): void {
    this.pullers = {};
    this.puller_id = '';
    this.puller_name = 'Pick a Puller';
    this.puller_options = [];

    let api = '/api/pulling/pullers';
    if (this.table !== 'hooks') {
      if (this.class_id) {
        api += '/class/' + this.class_id;
      } else if (this.pull_id) {
        api += '/pull/' + this.pull_id;
      } else if (this.season_id) {
        api += '/season/' + this.season_id;
      }
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.pullers[data[i].id] = data[i];
      }
      this.puller_options = data;
      this.puller_options.sort(this.sortByPuller);
      this.getTractors();
    });
  }

  getHooks(): void {
    this.hooks = {};

    let api = '/api/pulling/hooks';
    if (this.class_id) {
      api += '/class/' + this.class_id;
    } else if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.hooks[data[i].id] = data[i];
      }
      this.getPullers();
    });
  }

  getClasses(): void {
    const prev_id = this.class_id;
    const prev_name = this.class_name;
    this.classes = {};
    this.class_id = '';
    this.class_name = 'All';
    this.class_options = [];

    let api = '/api/pulling/classes';
    if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        if (this.pull_id) {
          if (data[i].id === prev_id) {
            this.class_id = prev_id;
            this.class_name = prev_name;
          }
        }
        this.classes[data[i].id] = data[i];
      }

      if (this.pull_id) {
        this.class_options = data;
        this.class_options.sort(this.sortByWeight);
        if (this.class_options.length && !this.class_id) {
          const last_class = this.class_options[0];
          this.class_id = last_class.id;
          this.class_name = this.getClassStr(last_class);
        }
        this.class_options.unshift({
          id: '',
          pull: '',
          category: '',
          weight: 0,
          speed: 0,
        });
      }

      this.getHooks();
    });
  }

  getPulls(): void {
    const prev_id = this.pull_id;
    const prev_name = this.pull_name;
    this.pulls = {};
    this.pull_id = '';
    this.pull_name = 'All';
    this.pull_options = [];

    let api = '/api/pulling/pulls';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        if (this.season_id) {
          if (data[i].id === prev_id) {
            this.pull_id = prev_id;
            this.pull_name = prev_name;
          }
        }
        data[i].date = this.getDateStr(data[i].date);
        this.pulls[data[i].id] = data[i];
      }

      if (this.season_id) {
        this.pull_options = data;
        this.pull_options.sort(this.sortByDate);
        if (this.pull_options.length && !this.pull_id) {
          const select_pull = this.pull_options[0];
          this.pull_id = select_pull.id;
          this.pull_name = this.getPullStr(select_pull);
        }
        this.pull_options.unshift({
          id: '',
          season: '',
          location: '',
          date: '',
          youtube: '',
        });
      }

      this.getClasses();
    });
  }

  getSeasons(): void {
    const prev_id = this.season_id;
    const prev_name = this.season_name;
    this.seasons = {};
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      for (let i in data) {
        if (data[i].id === prev_id) {
          this.season_id = prev_id;
          this.season_name = prev_name;
        }
        this.seasons[data[i].id] = data[i];
      }

      this.season_options = data;
      this.season_options.sort(this.sortByYear);
      if (this.season_options.length && !this.season_id) {
        const select_season = this.season_options[0];
        this.season_id = select_season.id;
        this.season_name = select_season.year;
      }
      this.season_options.unshift({ id: '', year: 'All' });

      this.getPulls();
    });
  }

  getLocations(): void {
    this.locations = {};
    this.location_id = '';
    this.location_name = 'Pick a Location';
    this.location_options = [];

    this.httpService.get('/api/pulling/locations').subscribe((data: any) => {
      for (let i in data) {
        this.locations[data[i].id] = data[i];
      }
      this.location_options = data;
      this.location_options.sort(this.sortByLocation);
      this.getSeasons();
    });
  }

  authorize(): void {
    this.authorized = true;
    this.getLocations();
  }

  setTractor(option: any): void {
    this.tractor_id = option.id;
    this.tractor_name = this.getTractorStr(option);
  }

  setPuller(option: any): void {
    this.puller_id = option.id;
    this.puller_name = this.getPullerStr(option);
  }

  setLocation(option: any): void {
    this.location_id = option.id;
    this.location_name = this.getLocationStr(option);
  }

  setClass(option: any): void {
    this.loading = true;
    this.class_id = option.id;
    this.class_name = this.getClassStr(option);
    this.getHooks();
  }

  setPull(option: any): void {
    this.loading = true;
    this.pull_id = option.id;
    this.pull_name = this.getPullStr(option);
    this.getClasses();
  }

  setSeason(option: any): void {
    this.loading = true;
    this.season_id = option.id;
    this.season_name = option.year;
    this.getPulls();
  }

  setTable(option: any): void {
    this.loading = true;
    this.table = option;
    if (this.table === 'pullers' || this.table === 'hooks') {
      this.getPullers();
    } else if (this.table === 'tractors') {
      this.getTractors();
    } else {
      this.getData();
    }
  }
}
