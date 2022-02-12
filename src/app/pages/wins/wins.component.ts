import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Season } from 'src/app/shared/interfaces/season';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';
import { Puller } from 'src/app/shared/interfaces/puller';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-wins',
  templateUrl: './wins.component.html',
  providers: [HttpService],
  styleUrls: ['./wins.component.css'],
})
export class WinsComponent implements OnInit {
  loading: boolean = true;

  pulls: Set<string> = new Set();

  data: {
    [cl_id: string]: {
      times_pulled: number;
      winners: any;
      winner_list: string[];
      winner_count: number;
      max_wins: number;
      leaders: string[];
      percentage: string;
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

  getWinsClass(wins: number): string {
    if (wins >= 7) return 'green-bg';
    if (wins >= 5) return 'yellow-bg';
    if (wins >= 3) return 'orange-bg';
    return 'red-bg';
  }

  getPercentageClass(per: string): string {
    const percent = parseInt(per);
    if (percent >= 55) return 'green-bg';
    if (percent >= 40) return 'yellow-bg';
    if (percent >= 20) return 'orange-bg';
    return 'red-bg';
  }

  getPercentageStr(per: any, cl_n: string): string {
    return ((per / this.data[cl_n].times_pulled) * 100).toFixed(0) + '%';
  }

  getPullerStr(id: any): string {
    return stringify.getPullerStr(this.pullers[id], false);
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

  getWins(): void {
    this.class_names = this.class_names.sort(sort.className);
    for (let i in this.class_names) {
      const cl_n = this.class_names[i];
      this.data[cl_n] = {
        times_pulled: 0,
        winners: {},
        winner_list: [],
        winner_count: 0,
        max_wins: 0,
        leaders: [],
        percentage: '',
      };

      for (let h in this.hooks[cl_n]) {
        const hook = this.hooks[cl_n][h];
        if (hook.position !== 1) continue;
        this.data[cl_n].times_pulled += 1;
        if (!this.data[cl_n].winners[hook.puller]) {
          this.data[cl_n].winners[hook.puller] = 0;
          this.data[cl_n].winner_count += 1;
        }
        this.data[cl_n].winners[hook.puller] += 1;
      }
    }
    for (let cl_n in this.data) {
      let sorted_winner_list: any[] = [];
      for (let w in this.data[cl_n].winners) {
        const win_count = this.data[cl_n].winners[w];

        sorted_winner_list.push([w, win_count]);

        if (win_count > this.data[cl_n].max_wins) {
          this.data[cl_n].max_wins = win_count;
          this.data[cl_n].leaders = [];
        }
        if (win_count == this.data[cl_n].max_wins) {
          this.data[cl_n].leaders.push(w);
        }
      }
      this.data[cl_n].winner_list = [];
      sorted_winner_list.sort((a, b) => b[1] - a[1]);
      for (let i in sorted_winner_list) {
        this.data[cl_n].winner_list.push(sorted_winner_list[i][0]);
      }
      this.data[cl_n].percentage = this.getPercentageStr(
        this.data[cl_n].max_wins,
        cl_n
      );
    }
    this.loading = false;
  }

  getHooks(): void {
    this.hooks = {};

    let api = '/api/pulling/hooks';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    api += '/winners';
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        const cl = this.classes[data[i].class];
        const cl_n = this.getClassStr(cl);
        if (!this.hooks[cl_n]) {
          this.hooks[cl_n] = [];
        }
        this.hooks[cl_n].push(data[i]);
      }
      this.getWins();
    });
  }

  getClasses(): void {
    this.pulls = new Set();
    this.classes = {};
    this.class_names = [];
    this.row_show = {};

    let api = '/api/pulling/classes';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        this.pulls.add(data[i].pull);
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
