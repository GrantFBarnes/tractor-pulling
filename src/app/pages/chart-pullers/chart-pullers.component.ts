import { Component, OnInit } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { HttpService } from '../../shared/services/http/http.service';
import { Season } from '../../shared/interfaces/season';
import { Pull } from '../../shared/interfaces/pull';
import { Class } from '../../shared/interfaces/class';
import { Hook } from '../../shared/interfaces/hook';
import { Puller } from '../../shared/interfaces/puller';
import { Tractor } from '../../shared/interfaces/tractor';

@Component({
  selector: 'app-chart-pullers',
  templateUrl: './chart-pullers.component.html',
  providers: [HttpService],
  styleUrls: ['./chart-pullers.component.css'],
})
export class ChartPullersComponent implements OnInit {
  loading: boolean = true;

  puller_id: string = '';
  puller_name: string = 'Pick a Puller';
  pullers: Puller[] = [];

  category: string = 'All';
  category_options: string[] = ['All', 'Farm Stock', 'Antique Modified'];

  metric: string = 'Wins';
  metric_options: string[] = ['Wins', 'Hooks', 'Distance'];

  chart_labels: any[] = [];
  chart_data: ChartDataset[] = [];

  tractors: { [id: string]: Tractor } = {};
  pulls: { [id: string]: Pull } = {};
  classes: { [id: string]: Class } = {};

  season_id: string = '';
  season_year: string = '';
  seasons: Season[] = [];
  seasons_map: { [id: string]: Season } = {};

  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getTractors();
  }

  getTractorStr(id: string): string {
    const tractor = this.tractors[id];
    if (tractor) {
      return tractor.brand + ' ' + tractor.model;
    }
    return '(Unknown)';
  }

  getPullerStr(p: Puller): string {
    if (!p.id) return '';
    return p.last_name + ', ' + p.first_name;
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

  sortByTime(a: any, b: any): number {
    const a_time = new Date(a);
    const b_time = new Date(b);
    if (a_time < b_time) return -1;
    if (a_time > b_time) return 1;
    return 0;
  }

  sortByName(a: any, b: any): number {
    const a_name = a.last_name + ', ' + a.first_name;
    const b_name = b.last_name + ', ' + b.first_name;
    if (a_name < b_name) return -1;
    if (a_name > b_name) return 1;
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
    let data: {
      [tractor_id: string]: {
        [time_id: string]: number;
      };
    } = {};
    for (let h in this.hooks) {
      const hook = this.hooks[h];

      if (hook.puller !== this.puller_id) {
        continue;
      }

      if (this.category !== 'All') {
        if (this.category !== this.classes[hook.class].category) {
          continue;
        }
      }

      if (!data[hook.tractor]) {
        data[hook.tractor] = {};
      }

      const cl = this.classes[hook.class];
      const pull = this.pulls[cl.pull];
      let time_id: string = '';
      if (this.season_id) {
        time_id = pull.date;
        time_id = this.getDateStr(time_id);
      } else {
        const season = this.seasons_map[pull.season];
        time_id = season.year;
      }

      if (!data[hook.tractor][time_id]) {
        data[hook.tractor][time_id] = 0;
      }

      switch (this.metric) {
        case 'Wins':
          if (hook.position === 1) {
            data[hook.tractor][time_id] += 1;
          }
          break;

        case 'Hooks':
          data[hook.tractor][time_id] += 1;
          break;

        case 'Distance':
          data[hook.tractor][time_id] += hook.distance;
          break;

        default:
          break;
      }
    }

    let times = new Set();
    for (let tractor_id in data) {
      for (let time_id in data[tractor_id]) {
        times.add(time_id);
      }
    }
    this.chart_labels = [...times].sort(this.sortByTime);

    let tractor_data: { [id: string]: number[] } = {};
    for (let id in data) {
      tractor_data[id] = [];
      for (let i in this.chart_labels) {
        const time_id = this.chart_labels[i];
        if (data[id][time_id]) {
          tractor_data[id].push(data[id][time_id]);
        } else {
          tractor_data[id].push(0);
        }
      }
    }

    this.chart_data = [];
    for (let id in tractor_data) {
      this.chart_data.push({
        data: tractor_data[id],
        label: this.getTractorStr(id),
      });
    }

    this.loading = false;
  }

  getHooks(): void {
    this.hooks = [];

    let api = '/api/pulling/hooks';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      this.hooks = data;
      this.getData();
    });
  }

  getClasses(): void {
    this.classes = {};

    let api = '/api/pulling/classes';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.classes[data[i].id] = data[i];
      }
      this.getHooks();
    });
  }

  getPulls(): void {
    this.pulls = {};

    let api = '/api/pulling/pulls';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.pulls[data[i].id] = data[i];
      }
      this.getClasses();
    });
  }

  getPullers(): void {
    this.pullers = [];

    let api = '/api/pulling/pullers';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      this.pullers = data;
      this.pullers.sort(this.sortByName);
      this.getPulls();
    });
  }

  getSeasons(): void {
    this.seasons = [];
    this.season_id = '';
    this.season_year = '';

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      for (let i in data) {
        this.seasons_map[data[i].id] = data[i];
      }
      this.seasons = data;
      this.seasons.push({ id: '', year: 'All' });
      this.seasons.sort(this.sortByYear);
      if (this.seasons.length) {
        const last_season = this.seasons[0];
        this.season_id = last_season.id;
        this.season_year = last_season.year;
      }
      this.getPullers();
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

  setSeason(option: any): void {
    this.loading = true;
    this.season_id = option.id;
    this.season_year = option.year;
    this.getPullers();
  }

  setCategory(option: string): void {
    this.loading = true;
    this.category = option;
    this.getData();
  }

  setMetric(option: string): void {
    this.loading = true;
    this.metric = option;
    this.getData();
  }

  setPuller(option: any): void {
    this.loading = true;
    this.puller_id = option.id;
    this.puller_name = this.getPullerStr(option);
    this.getData();
  }
}
