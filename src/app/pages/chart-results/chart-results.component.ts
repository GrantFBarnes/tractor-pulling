import { Component, OnInit } from '@angular/core';
import { ChartDataset } from 'chart.js';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Season } from 'src/app/shared/interfaces/season';
import { Pull } from 'src/app/shared/interfaces/pull';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';
import { Location } from 'src/app/shared/interfaces/location';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Tractor } from 'src/app/shared/interfaces/tractor';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-chart-results',
  templateUrl: './chart-results.component.html',
  providers: [HttpService],
  styleUrls: ['./chart-results.component.css'],
})
export class ChartResultsComponent implements OnInit {
  loading: boolean = true;

  subject: string = 'Puller';
  subject_options: string[] = ['Puller', 'Puller/Tractor', 'Tractor', 'Brand'];

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

  bar_chart_labels: string[] = [];
  bar_chart_data: ChartDataset[] = [];
  pie_chart_labels: string[] = [];
  pie_chart_data: ChartDataset[] = [];

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};
  classes: { [id: string]: Class } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pull_youtube: string = '';
  pull_options: Pull[] = [];

  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  getTractorStr(h: Hook): string {
    return stringify.getTractorStr(this.tractors[h.tractor]);
  }

  getPullerStr(h: Hook): string {
    return stringify.getPullerStr(this.pullers[h.puller], false);
  }

  getPullStr(p: Pull): string {
    return stringify.getPullStr(p, this.locations);
  }

  getData(): void {
    let data: {
      [id: string]: { subject: string; hooks: number; value: number };
    } = {};
    for (let h in this.hooks) {
      const hook = this.hooks[h];
      if (this.category !== 'All') {
        if (this.category !== this.classes[hook.class].category) {
          continue;
        }
      }

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

      if (!data[id]) {
        data[id] = { subject: subject_str, hooks: 0, value: 0 };
      }

      data[id].hooks += 1;

      switch (this.metric) {
        case 'Wins':
          if (hook.position === 1) {
            data[id].value += 1;
          }
          break;

        case 'Hooks':
          data[id].value += 1;
          break;

        case 'Average Distance':
          data[id].value += hook.distance;
          break;

        case 'Position Percentile':
          data[id].value += hook.position_percentile;
          break;

        default:
          break;
      }
    }

    if (this.metric.includes('Average') || this.metric.includes('Percentile')) {
      for (let id in data) {
        data[id].value = data[id].value / data[id].hooks;
      }
    }

    let sorted_data_rows: any[] = [];
    for (let id in data) {
      sorted_data_rows.push([id, data[id].value]);
    }
    sorted_data_rows.sort((a, b) => b[1] - a[1]);

    let col_count = 0;
    let remaining = 0;
    let bar_chart_data = [];
    let pie_chart_data = [];
    this.bar_chart_labels = [];
    this.pie_chart_labels = [];
    for (let i in sorted_data_rows) {
      const subject = data[sorted_data_rows[i][0]];

      col_count += 1;
      if (col_count >= 10) {
        remaining += subject.value;
      } else {
        bar_chart_data.push(subject.value);
        pie_chart_data.push(subject.value);
        this.bar_chart_labels.push(subject.subject);
        this.pie_chart_labels.push(subject.subject);
      }
    }

    this.bar_chart_data = [{ data: bar_chart_data, label: this.metric }];

    if (remaining) {
      pie_chart_data.push(remaining);
      this.pie_chart_labels.push('Other');
    }
    this.pie_chart_data = [{ data: pie_chart_data, label: this.metric }];

    this.loading = false;
  }

  getHooks(): void {
    this.hooks = [];

    let api = '/api/pulling/hooks';
    if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
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
    if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
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
    this.pull_id = '';
    this.pull_name = 'All';
    this.pull_youtube = '';
    this.pull_options = [];

    if (!this.season_id) {
      this.getClasses();
      return;
    }
    this.httpService
      .get('/api/pulling/pulls/season/' + this.season_id)
      .subscribe((data: any) => {
        this.pull_options = data;
        this.pull_options.sort(sort.pull);
        if (this.pull_options.length) {
          const select_pull = this.pull_options[0];
          this.pull_id = select_pull.id;
          this.pull_name = this.getPullStr(select_pull);
          this.pull_youtube = select_pull.youtube;
        }
        this.pull_options.unshift({
          id: '',
          season: '',
          location: '',
          date: '',
          youtube: '',
        });
        this.getClasses();
      });
  }

  getSeasons(): void {
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.season_options = data;
      this.season_options.sort(sort.season);
      if (this.season_options.length) {
        const select_season = this.season_options[0];
        this.season_id = select_season.id;
        this.season_name = select_season.year;
      }
      this.season_options.unshift({ id: '', year: 'All' });
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
    this.pull_youtube = option.youtube;
    this.getClasses();
  }

  setSeason(option: any): void {
    this.loading = true;
    this.season_id = option.id;
    this.season_name = option.year;
    this.getPulls();
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

  setSubject(option: string): void {
    this.loading = true;
    this.subject = option;
    this.getData();
  }
}
