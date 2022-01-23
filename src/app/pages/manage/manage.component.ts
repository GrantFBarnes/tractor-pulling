import { Component, OnInit } from '@angular/core';
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

  table: string = 'Table';
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
      this.padDate(d.getMonth()) +
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
      this.getData();
    });
  }

  getPullers(): void {
    this.pullers = {};

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
        this.classes[data[i].id] = data[i];
      }

      if (this.pull_id) {
        this.class_options = data;
        this.class_options.sort(this.sortByWeight);
        if (this.class_options.length) {
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
        data[i].date = this.getDateStr(data[i].date);
        this.pulls[data[i].id] = data[i];
      }

      if (this.season_id) {
        this.pull_options = data;
        this.pull_options.sort(this.sortByDate);
        if (this.pull_options.length) {
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
    this.seasons = {};
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      for (let i in data) {
        this.seasons[data[i].id] = data[i];
      }

      this.season_options = data;
      this.season_options.sort(this.sortByYear);
      if (this.season_options.length) {
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

    this.httpService.get('/api/pulling/locations').subscribe((data: any) => {
      for (let i in data) {
        this.locations[data[i].id] = data[i];
      }
      this.getSeasons();
    });
  }

  authorize(): void {
    this.authorized = true;
    this.getLocations();
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
