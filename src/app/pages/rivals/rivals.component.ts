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
  selector: 'app-rivals',
  templateUrl: './rivals.component.html',
  providers: [HttpService],
  styleUrls: ['./rivals.component.css'],
})
export class RivalsComponent implements OnInit {
  loading: boolean = true;

  subject: string = 'Puller';
  subject_options: string[] = ['Puller', 'Puller/Tractor', 'Tractor', 'Brand'];

  category: string = 'All';
  category_options: string[] = ['All', 'Farm Stock', 'Antique Modified'];

  data_rows: {
    winsA: number;
    subjectA: string;
    subjectB: string;
    winsB: number;
  }[] = [];

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};
  classes: { [id: string]: Class } = {};
  hooks: { [id: string]: Hook } = {};
  class_hooks: { [id: string]: string[] } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pull_options: Pull[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  getColorClass(wins: number, other_wins: number): string {
    const gap = (wins - other_wins) / (wins + other_wins);
    if (gap >= 0.5) return 'green-bg';
    if (gap > 0.0) return 'yellow-bg';
    if (gap === 0) return '';
    if (gap > -0.5) return 'orange-bg';
    return 'red-bg';
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

  sortByWins(a: any, b: any): number {
    const a_wins = a.winsA + a.winsB;
    const b_wins = b.winsA + b.winsB;
    if (a_wins < b_wins) return 1;
    if (a_wins > b_wins) return -1;
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
    if (isNaN(a_year)) return -1;
    if (isNaN(b_year)) return 1;
    if (a_year < b_year) return 1;
    if (a_year > b_year) return -1;
    return 0;
  }

  getRivals(): void {
    let data: { [key: string]: { winsA: number; winsB: number } } = {};
    for (let cl_id in this.classes) {
      if (this.category !== 'All') {
        if (this.category !== this.classes[cl_id].category) {
          continue;
        }
      }

      let classSubjects: string[] = [];
      let classPositions: { [id: string]: any } = {};
      for (let h in this.class_hooks[cl_id]) {
        const h_id = this.class_hooks[cl_id][h];
        const hook = this.hooks[h_id];

        let subject_str = '';
        switch (this.subject) {
          case 'Puller':
            subject_str = this.getPullerStr(hook);
            break;

          case 'Puller/Tractor':
            subject_str =
              this.getPullerStr(hook) + ' - ' + this.getTractorStr(hook);
            break;

          case 'Tractor':
            subject_str = this.getTractorStr(hook);
            break;

          case 'Brand':
            const tractor = this.tractors[hook.tractor];
            subject_str = tractor.brand;
            break;

          default:
            break;
        }
        classSubjects.push(subject_str);
        classPositions[subject_str] = hook.position;
      }

      for (let i = 0; i < classSubjects.length - 1; i++) {
        for (let j = i + 1; j < classSubjects.length; j++) {
          const subjectA = classSubjects[i];
          const subjectB = classSubjects[j];
          if (subjectA === subjectB) continue;

          let key = '';
          if (subjectA > subjectB) {
            key = subjectB + '.' + subjectA;
          } else {
            key = subjectA + '.' + subjectB;
          }

          if (!data[key]) {
            data[key] = { winsA: 0, winsB: 0 };
          }

          if (subjectA > subjectB) {
            if (classPositions[subjectA] > classPositions[subjectB]) {
              data[key].winsA++;
            } else {
              data[key].winsB++;
            }
          } else {
            if (classPositions[subjectB] > classPositions[subjectA]) {
              data[key].winsA++;
            } else {
              data[key].winsB++;
            }
          }
        }
      }
    }

    this.data_rows = [];
    for (let ids in data) {
      const split = ids.split('.');
      let subjectA = split[0];
      let subjectB = split[1];
      if (data[ids].winsA < data[ids].winsB) {
        subjectA = split[1];
        subjectB = split[0];

        const temp = data[ids].winsA;
        data[ids].winsA = data[ids].winsB;
        data[ids].winsB = temp;
      }
      this.data_rows.push({
        winsA: data[ids].winsA,
        subjectA: subjectA,
        subjectB: subjectB,
        winsB: data[ids].winsB,
      });
    }
    this.data_rows.sort(this.sortByWins);
    this.loading = false;
  }

  getHooks(): void {
    this.hooks = {};
    this.class_hooks = {};

    let api = '/api/pulling/hooks';
    if (this.pull_id) {
      api += '/pull/' + this.pull_id;
    } else if (this.season_id) {
      api += '/season/' + this.season_id;
    }
    this.httpService.get(api).subscribe((data: any) => {
      for (let i in data) {
        if (!this.class_hooks[data[i].class]) {
          this.class_hooks[data[i].class] = [];
        }
        this.class_hooks[data[i].class].push(data[i].id);
        this.hooks[data[i].id] = data[i];
      }
      this.getRivals();
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
    this.pull_options = [];

    if (!this.season_id) {
      this.getClasses();
      return;
    }
    this.httpService
      .get('/api/pulling/pulls/season/' + this.season_id)
      .subscribe((data: any) => {
        this.pull_options = data;
        this.pull_options.push({
          id: '',
          season: '',
          location: '',
          date: '',
          youtube: '',
        });
        this.pull_options.sort(this.sortByDate);
        if (this.pull_options.length) {
          const last_pull = this.pull_options[this.pull_options.length - 1];
          this.pull_id = last_pull.id;
          this.pull_name = this.getPullStr(last_pull);
        }
        this.getClasses();
      });
  }

  getSeasons(): void {
    this.season_id = '';
    this.season_name = '';
    this.season_options = [];

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      this.season_options = data;
      this.season_options.push({ id: '', year: 'All' });
      this.season_options.sort(this.sortByYear);
      if (this.season_options.length) {
        const last_season = this.season_options[0];
        this.season_id = last_season.id;
        this.season_name = last_season.year;
      }
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
    this.getRivals();
  }

  setSubject(option: string): void {
    this.loading = true;
    this.subject = option;
    this.getRivals();
  }
}
