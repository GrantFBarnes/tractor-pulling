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
  selector: 'app-results',
  templateUrl: './results.component.html',
  providers: [HttpService],
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  loading: boolean = true;

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pull_options: Pull[] = [];

  classes: Class[] = [];
  hooks: { [cl_id: string]: Hook[] } = {};

  row_show: { [cl_id: string]: boolean } = {};
  row_show_all: boolean = false;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  toggleRowShowAll() {
    this.row_show_all = !this.row_show_all;
    for (let id in this.row_show) {
      this.row_show[id] = this.row_show_all;
    }
  }

  toggleRowShow(id: string) {
    this.row_show[id] = !this.row_show[id];
  }

  getDistanceStr(h: Hook): string {
    return h.distance.toFixed(2).padStart(6, '0');
  }

  getTractorStr(h: Hook): string {
    const tractor = this.tractors[h.tractor];
    if (tractor) {
      return tractor.brand + ' ' + tractor.model;
    }
    return '(Unknown)';
  }

  getPullerStr(h: Hook): string {
    const puller = this.pullers[h.puller];
    if (puller) {
      return puller.first_name + ' ' + puller.last_name;
    }
    return '(Unknown)';
  }

  getClassStr(c: Class): string {
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
    let str = this.getDateStr(p.date);
    const loc = this.locations[p.location];
    if (loc) {
      str += ' - ' + loc.town + ', ' + loc.state;
    }
    return str;
  }

  sortByPos(a: any, b: any): number {
    const a_position = a.position;
    const b_position = b.position;
    if (a_position < b_position) return -1;
    if (a_position > b_position) return 1;
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

  getHooks(): void {
    this.hooks = {};

    this.httpService
      .get('/api/pulling/hooks/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.hooks = {};
        for (let i in data) {
          const cl = data[i].class;
          if (!this.hooks[cl]) {
            this.hooks[cl] = [];
          }
          this.hooks[cl].push(data[i]);
        }
        for (let cl in this.hooks) {
          this.hooks[cl].sort(this.sortByPos);
        }
        this.loading = false;
      });
  }

  getClasses(): void {
    this.classes = [];
    this.row_show = {};

    this.httpService
      .get('/api/pulling/classes/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.classes = data;
        this.classes.sort(this.sortByWeight);
        for (let i in this.classes) {
          if (!this.row_show[this.classes[i].id]) {
            this.row_show[this.classes[i].id] = false;
          }
        }
        this.getHooks();
      });
  }

  getPulls(): void {
    this.pull_id = '';
    this.pull_name = 'All';
    this.pull_options = [];

    this.httpService
      .get('/api/pulling/pulls/season/' + this.season_id)
      .subscribe((data: any) => {
        this.pull_options = data;
        this.pull_options.sort(this.sortByDate);
        if (this.pull_options.length) {
          const select_pull = this.pull_options[0];
          this.pull_id = select_pull.id;
          this.pull_name = this.getPullStr(select_pull);
        }
        this.getClasses();
      });
  }

  getSeasons(): void {
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.season_options = data;
      this.season_options.sort(this.sortByYear);
      if (this.season_options.length) {
        const select_season = this.season_options[0];
        this.season_id = select_season.id;
        this.season_name = select_season.year;
      }
      this.getPulls();
    });
  }

  getTractors(): void {
    this.tractors = {};

    this.httpService.get('/api/pulling/tractors').subscribe((data: any) => {
      for (let i in data) {
        this.tractors[data[i].id] = data[i];
      }
      this.getSeasons();
    });
  }

  getPullers(): void {
    this.pullers = {};

    this.httpService.get('/api/pulling/pullers').subscribe((data: any) => {
      for (let i in data) {
        this.pullers[data[i].id] = data[i];
      }
      this.getTractors();
    });
  }

  getLocations(): void {
    this.locations = {};

    this.httpService.get('/api/pulling/locations').subscribe((data: any) => {
      for (let i in data) {
        this.locations[data[i].id] = data[i];
      }
      this.getPullers();
    });
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
}
