import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Season } from 'src/app/shared/interfaces/season';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';
import { Puller } from 'src/app/shared/interfaces/puller';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  providers: [HttpService],
  styleUrls: ['./points.component.css'],
})
export class PointsComponent implements OnInit {
  loading: boolean = true;

  data: {
    [cl_id: string]: {
      pullers: { [p_id: string]: number };
      puller_list: string[];
      max_points: number;
      leaders: string[];
    };
  } = {};

  pullers: { [id: string]: Puller } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  classes: { [id: string]: Class } = {};
  class_names: string[] = [];

  hooks: { [cl_n: string]: Hook[] } = {};

  row_show: { [cl_n: string]: boolean } = {};
  row_show_all: boolean = false;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getPullers();
  }

  toggleRowShowAll() {
    this.row_show_all = !this.row_show_all;
    for (let id in this.row_show) {
      this.row_show[id] = this.row_show_all;
    }
  }

  toggleRowShow(name: string) {
    this.row_show[name] = !this.row_show[name];
  }

  getPullerStr(id: any): string {
    return stringify.getPullerStr(this.pullers[id]);
  }

  getPullersStr(pullers: string[]): string {
    let val = [];
    for (let p in pullers) {
      const puller_str = this.getPullerStr(pullers[p]);
      if (puller_str) {
        val.push(puller_str);
      }
    }
    return val.toString();
  }

  getClassStr(c: Class): string {
    return stringify.getClassStr(c);
  }

  getPullerPoints(position: number): number {
    let points = 0;
    if (position <= 10) points = 11 - position;
    points += 5;
    return points;
  }

  getPoints(): void {
    this.class_names = this.class_names.sort(sort.className);
    for (let i in this.class_names) {
      const cl_n = this.class_names[i];
      this.data[cl_n] = {
        pullers: {},
        puller_list: [],
        max_points: 0,
        leaders: [],
      };

      for (let h in this.hooks[cl_n]) {
        const hook = this.hooks[cl_n][h];

        if (!this.data[cl_n].pullers[hook.puller]) {
          this.data[cl_n].pullers[hook.puller] = 0;
        }
        this.data[cl_n].pullers[hook.puller] += this.getPullerPoints(
          hook.position
        );
      }
    }
    for (let cl_n in this.data) {
      let sorted_puller_list: any[] = [];
      for (let i in this.data[cl_n].pullers) {
        const points = this.data[cl_n].pullers[i];

        sorted_puller_list.push([i, points]);

        if (points > this.data[cl_n].max_points) {
          this.data[cl_n].max_points = points;
          this.data[cl_n].leaders = [];
        }
        if (points == this.data[cl_n].max_points) {
          this.data[cl_n].leaders.push(i);
        }
      }
      this.data[cl_n].puller_list = [];
      sorted_puller_list.sort((a, b) => b[1] - a[1]);
      for (let i in sorted_puller_list) {
        this.data[cl_n].puller_list.push(sorted_puller_list[i][0]);
      }
    }
    this.loading = false;
  }

  getHooks(): void {
    this.hooks = {};

    let api = '/api/pulling/hooks';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        const cl = this.classes[data[i].class];
        const cl_n = this.getClassStr(cl);
        if (!this.hooks[cl_n]) {
          this.hooks[cl_n] = [];
        }
        this.hooks[cl_n].push(data[i]);
      }
      this.getPoints();
    });
  }

  getClasses(): void {
    this.classes = {};
    this.class_names = [];
    this.row_show = {};

    let api = '/api/pulling/classes';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.classes[data[i].id] = data[i];
        const cl_n = this.getClassStr(data[i]);
        if (this.class_names.indexOf(cl_n) < 0) {
          this.class_names.push(cl_n);
        }
        if (!this.row_show[cl_n]) {
          this.row_show[cl_n] = false;
        }
      }
      this.getHooks();
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
      this.getClasses();
    });
  }

  getPullers(): void {
    this.pullers = {};

    this.httpService.get('/api/pulling/pullers').subscribe((data: any) => {
      for (let i in data) {
        this.pullers[data[i].id] = data[i];
      }
      this.getSeasons();
    });
  }

  setSeason(option: any): void {
    this.loading = true;
    this.season_id = option.id;
    this.season_name = option.year;
    this.getClasses();
  }
}
