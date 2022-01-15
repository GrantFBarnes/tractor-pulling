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

  wins: {
    [id: string]: {
      times_pulled: number;
      winners: any;
      winners_list: string[];
      winner_count: number;
      max_wins: number;
      leaders: any;
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

  getWinsClass(cl_n: string): string {
    if (!cl_n) return '';
    if (!this.wins[cl_n]) return '';
    const wins = this.wins[cl_n].max_wins;
    if (wins >= 7) return 'green-text';
    if (wins >= 5) return 'yellow-text';
    if (wins >= 3) return 'orange-text';
    return 'red-text';
  }

  getPercentageClass(cl_n: string): string {
    if (!cl_n) return '';
    if (!this.wins[cl_n]) return '';
    const percent = parseInt(this.wins[cl_n].percentage);
    if (percent >= 55) return 'green-text';
    if (percent >= 40) return 'yellow-text';
    if (percent >= 20) return 'orange-text';
    return 'red-text';
  }

  getPercentageStr(per: any, cl_n: string): string {
    return ((per / this.wins[cl_n].times_pulled) * 100).toFixed(0);
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
      const cl_s = this.class_names[i];
      this.wins[cl_s] = {
        times_pulled: 0,
        winners: {},
        winners_list: [],
        winner_count: 0,
        max_wins: 0,
        leaders: [],
        percentage: '',
      };

      for (let h in this.hooks[cl_s]) {
        const hook = this.hooks[cl_s][h];
        if (hook.position !== 1) continue;
        this.wins[cl_s].times_pulled += 1;
        if (!this.wins[cl_s].winners[hook.puller]) {
          this.wins[cl_s].winners[hook.puller] = 0;
          this.wins[cl_s].winner_count += 1;
        }
        this.wins[cl_s].winners[hook.puller] += 1;
      }
    }
    for (let c in this.wins) {
      let winners_inverse: any = {};
      for (let w in this.wins[c].winners) {
        const win_count = this.wins[c].winners[w];

        if (!winners_inverse[win_count]) {
          winners_inverse[win_count] = [];
        }
        winners_inverse[win_count].push(w);

        if (win_count > this.wins[c].max_wins) {
          this.wins[c].max_wins = win_count;
          this.wins[c].leaders = [];
        }
        if (win_count == this.wins[c].max_wins) {
          this.wins[c].leaders.push(w);
        }
      }
      const sorted_wins = Object.keys(winners_inverse).sort().reverse();
      for (let i in sorted_wins) {
        const win_count = sorted_wins[i];
        for (let p in winners_inverse[win_count]) {
          this.wins[c].winners_list.push(winners_inverse[win_count][p]);
        }
      }
      this.wins[c].percentage = this.getPercentageStr(this.wins[c].max_wins, c);
    }
    this.loading = false;
  }

  getHooks(): void {
    this.httpService
      .get('/api/pulling/hooks/season/' + this.season_id + '/winners')
      .subscribe((data: any) => {
        this.hooks = {};
        for (let i in data) {
          const cl = this.classes[data[i].class];
          const cl_s = this.getClassStr(cl);
          if (!this.hooks[cl_s]) {
            this.hooks[cl_s] = [];
          }
          this.hooks[cl_s].push(data[i]);
        }
        this.getWins();
      });
  }

  getClasses(): void {
    this.httpService
      .get('/api/pulling/classes/season/' + this.season_id)
      .subscribe((data: any) => {
        this.classes = {};
        this.class_names = [];
        this.pulls = new Set();
        for (let i in data) {
          this.pulls.add(data[i].pull);
          this.classes[data[i].id] = data[i];
          const cl_s = this.getClassStr(data[i]);
          if (this.class_names.indexOf(cl_s) < 0) {
            this.class_names.push(cl_s);
          }
          if (!this.row_show[cl_s]) {
            this.row_show[cl_s] = false;
          }
        }
        this.getHooks();
      });
  }

  getSeasons(): void {
    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.seasons = data;
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
