import { Component, OnInit } from '@angular/core';
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
  selector: 'app-winnings',
  templateUrl: './winnings.component.html',
  providers: [HttpService],
  styleUrls: ['./winnings.component.css'],
})
export class WinningsComponent implements OnInit {
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

  searchText: string = '';

  data: {
    [id: string]: {
      subject: string;
      spent: number;
      won: number;
      net: number;
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

  searchTextInRow(row: any): boolean {
    const searchText = this.searchText.trim().toLocaleLowerCase();
    if (!searchText) return true;

    if (row.subject.toLocaleLowerCase().includes(searchText)) return true;

    return false;
  }

  getMoneyClass(money: number): string {
    if (money > 0) return 'green-bg';
    if (money < 0) return 'red-bg';
    return '';
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

  getWinAmount(position: number, hook_count: number): number {
    if (hook_count < 2) return 0;
    if (position > 4) return 0;

    switch (hook_count) {
      case 2:
        switch (position) {
          case 1:
            return 20;
          default:
            return 0;
        }
      case 3:
        switch (position) {
          case 1:
            return 18;
          case 2:
            return 12;
          default:
            return 0;
        }
      case 4:
        switch (position) {
          case 1:
            return 20;
          case 2:
            return 12;
          case 3:
            return 8;
          default:
            return 0;
        }
      default:
        return (5 - position) * hook_count;
    }
  }

  getWinnings(): void {
    this.data = {};
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
          spent: 0,
          won: 0,
          net: 0,
        };
      }
      this.data[id].spent += 15;
      this.data[id].won += this.getWinAmount(
        hook.position,
        this.classes[hook.class].hook_count
      );
      this.data[id].net = this.data[id].won - this.data[id].spent;
    }

    let sorted_data_rows: any[] = [];
    for (let id in this.data) {
      sorted_data_rows.push([id, this.data[id].net]);
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
      this.getWinnings();
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
    this.getWinnings();
  }

  setSubject(option: string): void {
    this.loading = true;
    this.subject = option;
    this.getWinnings();
  }
}
