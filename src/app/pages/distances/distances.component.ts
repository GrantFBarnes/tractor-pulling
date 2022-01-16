import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http/http.service';
import { Season } from '../../shared/interfaces/season';
import { Pull } from '../../shared/interfaces/pull';
import { Hook } from '../../shared/interfaces/hook';
import { Location } from '../../shared/interfaces/location';
import { Puller } from '../../shared/interfaces/puller';
import { Tractor } from '../../shared/interfaces/tractor';

@Component({
  selector: 'app-distances',
  templateUrl: './distances.component.html',
  providers: [HttpService],
  styleUrls: ['./distances.component.css'],
})
export class DistancesComponent implements OnInit {
  loading: boolean = true;

  subject: string = 'Puller';
  subject_options: string[] = ['Puller', 'Puller/Tractor', 'Tractor', 'Brand'];

  data: {
    [id: string]: {
      subject: string;
      average_distance: number;
      total_distance: number;
      total_hooks: number;
    };
  } = {};

  data_rows: any[] = [];

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};

  season_id: string = '';
  season_year: string = '';
  seasons: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pulls: Pull[] = [];

  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  getDistanceClass(distance: number): string {
    if (distance >= 300) return 'green-text';
    if (distance >= 200) return 'yellow-text';
    if (distance >= 100) return 'orange-text';
    return 'red-text';
  }

  getDistanceStr(distance: number): string {
    return distance.toFixed(2).padStart(6, '0');
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
    if (a_year < b_year) return 1;
    if (a_year > b_year) return -1;
    return 0;
  }

  getDistances(): void {
    this.data = {};
    for (let h in this.hooks) {
      const hook = this.hooks[h];

      let id = '';
      let subject_str = '';
      switch (this.subject) {
        case 'Puller':
          id = hook.puller;
          subject_str = this.getPullerStr(hook);
          break;

        case 'Puller/Tractor':
          id = hook.puller + '.' + hook.tractor;
          subject_str =
            this.getPullerStr(hook) + ' - ' + this.getTractorStr(hook);
          break;

        case 'Tractor':
          id = hook.tractor;
          subject_str = this.getTractorStr(hook);
          break;

        case 'Brand':
          const tractor = this.tractors[hook.tractor];
          id = tractor.brand;
          subject_str = tractor.brand;
          break;

        default:
          break;
      }

      if (!this.data[id]) {
        this.data[id] = {
          subject: subject_str,
          average_distance: 0,
          total_distance: 0,
          total_hooks: 0,
        };
      }
      this.data[id].total_distance += hook.distance;
      this.data[id].total_hooks += 1;
    }

    let sorted_data_rows: any[] = [];
    for (let id in this.data) {
      this.data[id].total_distance = Math.floor(this.data[id].total_distance);
      this.data[id].average_distance =
        this.data[id].total_distance / this.data[id].total_hooks;
      sorted_data_rows.push([id, this.data[id].average_distance]);
    }

    this.data_rows = [];
    sorted_data_rows.sort((a, b) => b[1] - a[1]);
    for (let i in sorted_data_rows) {
      this.data_rows.push(sorted_data_rows[i][0]);
    }
    this.loading = false;
  }

  getHooks(): void {
    let api = '/api/pulling/hooks';
    if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      this.hooks = data;
      this.getDistances();
    });
  }

  getPulls(): void {
    if (!this.season_id) {
      this.pulls = [];
      this.pull_id = '';
      this.pull_name = 'All';
      this.getHooks();
      return;
    }
    this.httpService
      .get('/api/pulling/pulls/season/' + this.season_id)
      .subscribe((data: any) => {
        this.pulls = data;
        this.pulls.push({
          id: '',
          season: '',
          location: '',
          date: '',
          youtube: '',
        });
        this.pulls.sort(this.sortByDate);
        if (this.pulls.length) {
          const last_pull = this.pulls[this.pulls.length - 1];
          this.pull_id = last_pull.id;
          this.pull_name = this.getPullStr(last_pull);
        }
        this.getHooks();
      });
  }

  getSeasons(): void {
    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.seasons = data;
      this.seasons.push({ id: '', year: 'All' });
      this.seasons.sort(this.sortByYear);
      if (this.seasons.length) {
        const last_season = this.seasons[0];
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

  setSubject(option: string): void {
    this.loading = true;
    this.subject = option;
    this.getDistances();
  }

  setPull(option: any): void {
    this.loading = true;
    this.pull_id = option.id;
    this.pull_name = this.getPullStr(option);
    this.getHooks();
  }

  setSeason(option: any): void {
    this.loading = true;
    this.season_id = option.id;
    this.season_year = option.year;
    this.getPulls();
  }
}
