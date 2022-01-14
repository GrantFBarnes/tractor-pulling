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
  season_year: string = '';
  seasons: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pulls: Pull[] = [];

  class_id: string = '';
  class_name: string = '';
  classes: Class[] = [];

  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
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
      this.padDate(d.getMonth()) +
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
    if (a_date < b_date) return -1;
    if (a_date > b_date) return 1;
    return 0;
  }

  sortByYear(a: any, b: any): number {
    const a_year = parseInt(a.year);
    const b_year = parseInt(b.year);
    if (a_year < b_year) return -1;
    if (a_year > b_year) return 1;
    return 0;
  }

  getHooks(): void {
    this.httpService
      .get('/api/pulling/hooks/class/' + this.class_id)
      .subscribe((data: any) => {
        this.hooks = data;
        this.hooks.sort(this.sortByPos);
        this.loading = false;
      });
  }

  getClasses(): void {
    this.httpService
      .get('/api/pulling/classes/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.classes = data;
        this.classes.sort(this.sortByWeight);
        if (this.classes.length) {
          const first_class = this.classes[0];
          this.class_id = first_class.id;
          this.class_name = this.getClassStr(first_class);
        }
        this.getHooks();
      });
  }

  getPulls(): void {
    this.httpService
      .get('/api/pulling/pulls/season/' + this.season_id)
      .subscribe((data: any) => {
        this.pulls = data;
        this.pulls.sort(this.sortByDate);
        if (this.pulls.length) {
          const last_pull = this.pulls[this.pulls.length - 1];
          this.pull_id = last_pull.id;
          this.pull_name = this.getPullStr(last_pull);
        }
        this.getClasses();
      });
  }

  getSeasons(): void {
    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.seasons = data;
      this.seasons.sort(this.sortByYear);
      if (this.seasons.length) {
        const last_season = this.seasons[this.seasons.length - 1];
        this.season_id = last_season.id;
        this.season_year = last_season.year;
      }
      this.getPulls();
    });
  }

  getTractors(): void {
    this.httpService.get('/api/pulling/tractors').subscribe((data: any) => {
      for (let i in data) {
        this.tractors[data[i].id] = data[i];
      }
      this.getSeasons();
    });
  }

  getPullers(): void {
    this.httpService.get('/api/pulling/pullers').subscribe((data: any) => {
      for (let i in data) {
        this.pullers[data[i].id] = data[i];
      }
      this.getTractors();
    });
  }

  getLocations(): void {
    this.httpService.get('/api/pulling/locations').subscribe((data: any) => {
      for (let i in data) {
        this.locations[data[i].id] = data[i];
      }
      this.getPullers();
    });
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
    this.season_year = option.year;
    this.getPulls();
  }
}
