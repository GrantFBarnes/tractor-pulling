import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http/http.service';
import { Season } from '../../shared/interfaces/season';
import { Pull } from '../../shared/interfaces/pull';
import { Class } from '../../shared/interfaces/class';
import { Hook } from '../../shared/interfaces/hook';
import { Location } from '../../shared/interfaces/location';
import { Puller } from '../../shared/interfaces/puller';
import { Tractor } from '../../shared/interfaces/tractor';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-percentiles',
  templateUrl: './percentiles.component.html',
  providers: [HttpService],
  styleUrls: ['./percentiles.component.css'],
})
export class PercentilesComponent implements OnInit {
  loading: boolean = true;

  subject: string = 'Puller';
  subject_options: string[] = ['Puller', 'Puller/Tractor', 'Tractor', 'Brand'];

  category: string = 'All';
  category_options: string[] = ['All', 'Farm Stock', 'Antique Modified'];

  data: {
    [id: string]: {
      subject: string;
      classes: string[];
      positions: number[];
      distances: number[];
      position_percentile: number;
      distance_percentile: number;
      total_hooks: number;
    };
  } = {};

  data_rows: any[] = [];

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

  getPercentageClass(percent: number): string {
    if (percent >= 75) return 'green-bg';
    if (percent >= 50) return 'yellow-bg';
    if (percent >= 25) return 'orange-bg';
    return 'red-bg';
  }

  getPercentageStr(percent: number): string {
    return percent.toFixed(0) + '%';
  }

  getTractorStr(h: Hook): string {
    return stringify.getTractorStr(this.tractors[h.tractor]);
  }

  getPullerStr(h: Hook): string {
    return stringify.getPullerStr(this.pullers[h.puller]);
  }

  getPullStr(p: Pull): string {
    return stringify.getPullStr(p, this.locations);
  }

  getPercentiles(): void {
    this.data = {};
    let classDetails: {
      [id: string]: { max_distance: number; total_hooks: number };
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

      if (!this.data[id]) {
        this.data[id] = {
          subject: subject_str,
          classes: [],
          positions: [],
          distances: [],
          position_percentile: 0,
          distance_percentile: 0,
          total_hooks: 0,
        };
      }

      this.data[id].classes.push(hook.class);
      this.data[id].positions.push(hook.position);
      this.data[id].distances.push(hook.distance);
      this.data[id].total_hooks += 1;

      if (!classDetails[hook.class]) {
        classDetails[hook.class] = { max_distance: 0, total_hooks: 0 };
      }
      if (hook.distance > classDetails[hook.class].max_distance) {
        classDetails[hook.class].max_distance = hook.distance;
      }
      classDetails[hook.class].total_hooks += 1;
    }

    for (let id in this.data) {
      for (let i in this.data[id].classes) {
        const hookCount = classDetails[this.data[id].classes[i]].total_hooks;

        this.data[id].position_percentile =
          this.data[id].position_percentile +
          (hookCount - this.data[id].positions[i]) / hookCount;

        this.data[id].distance_percentile =
          this.data[id].distance_percentile +
          this.data[id].distances[i] /
            classDetails[this.data[id].classes[i]].max_distance;
      }
    }

    for (let id in this.data) {
      this.data[id].position_percentile =
        (this.data[id].position_percentile / this.data[id].total_hooks) * 100;
      this.data[id].distance_percentile =
        (this.data[id].distance_percentile / this.data[id].total_hooks) * 100;
    }

    let sorted_data_rows: any[] = [];
    for (let id in this.data) {
      sorted_data_rows.push([id, this.data[id].position_percentile]);
    }

    this.data_rows = [];
    sorted_data_rows.sort((a, b) => b[1] - a[1]);
    for (let i in sorted_data_rows) {
      this.data_rows.push(sorted_data_rows[i][0]);
    }
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
      this.getPercentiles();
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
    this.getPercentiles();
  }

  setSubject(option: string): void {
    this.loading = true;
    this.subject = option;
    this.getPercentiles();
  }
}
