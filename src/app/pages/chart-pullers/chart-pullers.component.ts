import { Component, OnInit } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Season } from 'src/app/shared/interfaces/season';
import { Pull } from 'src/app/shared/interfaces/pull';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Tractor } from 'src/app/shared/interfaces/tractor';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

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
  category_options: string[] = [
    'All',
    'Farm Stock',
    'Farm Plus',
    'Antique Modified',
  ];

  metric: string = 'Wins';
  metric_options: string[] = [
    'Wins',
    'Hooks',
    'Average Distance',
    'Position Percentile',
  ];

  chart_labels: any[] = [];
  chart_data: ChartDataset[] = [];
  chart_options = { scales: { y: { beginAtZero: true } } };

  tractors: { [id: string]: Tractor } = {};
  pulls: { [id: string]: Pull } = {};
  classes: { [id: string]: Class } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];
  seasons: { [id: string]: Season } = {};

  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getTractors();
  }

  getTractorStr(id: string): string {
    return stringify.getTractorStr(this.tractors[id]);
  }

  getPullerStr(p: Puller): string {
    return stringify.getPullerStr(p, false);
  }

  getData(): void {
    let data: {
      [tractor_id: string]: {
        [time_id: string]: { hooks: number; value: number };
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
        time_id = stringify.getDateStr(time_id);
      } else {
        const season = this.seasons[pull.season];
        time_id = season.year;
      }

      if (!data[hook.tractor][time_id]) {
        data[hook.tractor][time_id] = { hooks: 0, value: 0 };
      }

      data[hook.tractor][time_id].hooks += 1;

      switch (this.metric) {
        case 'Wins':
          if (hook.position === 1) {
            data[hook.tractor][time_id].value += 1;
          }
          break;

        case 'Hooks':
          data[hook.tractor][time_id].value += 1;
          break;

        case 'Average Distance':
          data[hook.tractor][time_id].value += hook.distance;
          break;

        case 'Position Percentile':
          data[hook.tractor][time_id].value += hook.position_percentile;
          break;

        default:
          break;
      }
    }

    if (this.metric.includes('Average') || this.metric.includes('Percentile')) {
      for (let tractor_id in data) {
        for (let time_id in data[tractor_id]) {
          data[tractor_id][time_id].value =
            data[tractor_id][time_id].value / data[tractor_id][time_id].hooks;
        }
      }
    }

    let times = new Set();
    for (let tractor_id in data) {
      for (let time_id in data[tractor_id]) {
        times.add(time_id);
      }
    }
    this.chart_labels = [...times].sort(sort.time);

    let tractor_data: { [id: string]: any[] } = {};
    for (let id in data) {
      tractor_data[id] = [];
      for (let i in this.chart_labels) {
        const time_id = this.chart_labels[i];
        if (data[id][time_id] && data[id][time_id].value) {
          tractor_data[id].push(data[id][time_id].value);
        } else {
          tractor_data[id].push(null);
        }
      }
    }

    this.chart_data = [];
    for (let id in tractor_data) {
      this.chart_data.push({
        data: tractor_data[id],
        label: this.getTractorStr(id),
        pointRadius: 8,
        pointBorderColor: 'black',
        pointBorderWidth: 1,
        spanGaps: true,
        tension: 0.2,
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
      this.pullers.sort(sort.puller);
      this.getPulls();
    });
  }

  getSeasons(): void {
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      for (let i in data) {
        this.seasons[data[i].id] = data[i];
      }
      this.season_options = data;
      this.season_options.sort(sort.season);
      if (this.season_options.length) {
        const select_season = this.season_options[0];
        this.season_id = select_season.id;
        this.season_name = select_season.year;
      }
      this.season_options.unshift({ id: '', year: 'All' });
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
    this.season_name = option.year;
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
