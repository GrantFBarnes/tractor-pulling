import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/services/http/http.service';
import { Season } from '../../shared/interfaces/season';
import { Class } from '../../shared/interfaces/class';
import { Hook } from '../../shared/interfaces/hook';
import { Puller } from '../../shared/interfaces/puller';

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
  season_year: string = '';
  seasons: Season[] = [];

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
    if (wins >= 7) return 'green-text';
    if (wins >= 5) return 'yellow-text';
    if (wins >= 3) return 'orange-text';
    return 'red-text';
  }

  getPercentageClass(per: string): string {
    const percent = parseInt(per);
    if (percent >= 55) return 'green-text';
    if (percent >= 40) return 'yellow-text';
    if (percent >= 20) return 'orange-text';
    return 'red-text';
  }

  getPercentageStr(per: any, cl_n: string): string {
    return ((per / this.data[cl_n].times_pulled) * 100).toFixed(0) + '%';
  }

  getPullerStr(id: any): string {
    const puller = this.pullers[id];
    if (puller) {
      return puller.first_name + ' ' + puller.last_name;
    }
    return '';
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
    let str = c.weight + ' ' + c.category;
    if (c.speed != 3) str += ' (' + c.speed + ')';
    return str;
  }

  sortByHighestNum(a: any, b: any): number {
    const a_num = parseInt(a);
    const b_num = parseInt(b);
    if (a_num < b_num) return 1;
    if (a_num > b_num) return -1;
    return 0;
  }

  sortByClassName(a: any, b: any): number {
    const a_split = a.split(' ');
    const b_split = b.split(' ');
    const a_weight = parseInt(a_split[0]);
    const b_weight = parseInt(b_split[0]);
    if (a_weight < b_weight) return -1;
    if (a_weight > b_weight) return 1;
    const a_category = parseInt(a_split[1]);
    const b_category = parseInt(b_split[1]);
    if (a_category < b_category) return 1;
    if (a_category > b_category) return -1;
    return 0;
  }

  sortByYear(a: any, b: any): number {
    const a_year = parseInt(a.year);
    const b_year = parseInt(b.year);
    if (a_year < b_year) return 1;
    if (a_year > b_year) return -1;
    return 0;
  }

  getWins(): void {
    this.class_names = this.class_names.sort(this.sortByClassName);
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
    let api = '/api/pulling/hooks';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    api += '/winners';
    this.httpService.get(api).subscribe((data: any) => {
      this.hooks = {};
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
    let api = '/api/pulling/classes';
    if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      this.classes = {};
      this.class_names = [];
      this.pulls = new Set();
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
    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.seasons = data;
      this.seasons.push({ id: '', year: 'All' });
      this.seasons.sort(this.sortByYear);
      if (this.seasons.length) {
        const last_season = this.seasons[0];
        this.season_id = last_season.id;
        this.season_year = last_season.year;
      }
      this.getClasses();
    });
  }

  getPullers(): void {
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
    this.season_year = option.year;
    this.getClasses();
  }
}
