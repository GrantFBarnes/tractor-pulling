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
  selector: 'app-results',
  templateUrl: './results.component.html',
  providers: [HttpService],
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  loading: boolean = true;

  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};

  season_id: string = '';
  season_name: string = '';
  season_options: Season[] = [];

  pull_id: string = '';
  pull_name: string = '';
  pull_youtube: string = '';
  pull_options: Pull[] = [];

  classes: Class[] = [];
  hooks: { [cl_id: string]: Hook[] } = {};

  row_show: { [cl_id: string]: boolean } = {};
  row_show_all: boolean = false;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  toggleRowShowAll() {
    this.row_show_all = !this.row_show_all;
    for (let id in this.row_show) {
      this.row_show[id] = this.row_show_all;
    }
  }

  toggleRowShow(id: string) {
    this.row_show[id] = !this.row_show[id];
  }

  getDistanceStr(h: Hook): string {
    return h.distance.toFixed(2).padStart(6, '0');
  }

  getTractorStr(h: Hook): string {
    return stringify.getTractorStr(this.tractors[h.tractor]);
  }

  getPullerStr(h: Hook): string {
    return stringify.getPullerStr(this.pullers[h.puller], false);
  }

  getClassStr(c: Class): string {
    return stringify.getClassStr(c);
  }

  getPullStr(p: Pull): string {
    return stringify.getPullStr(p, this.locations);
  }

  getHooks(): void {
    this.hooks = {};

    this.httpService
      .get('/api/pulling/hooks/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.hooks = {};
        for (let i in data) {
          const cl = data[i].class;
          if (!this.hooks[cl]) {
            this.hooks[cl] = [];
          }
          this.hooks[cl].push(data[i]);
        }
        for (let cl in this.hooks) {
          this.hooks[cl].sort(sort.hookObj);
        }
        this.loading = false;
      });
  }

  getClasses(): void {
    this.classes = [];
    this.row_show = {};

    this.httpService
      .get('/api/pulling/classes/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.classes = data;
        this.classes.sort(sort.classObj);
        for (let i in this.classes) {
          if (!this.row_show[this.classes[i].id]) {
            this.row_show[this.classes[i].id] = false;
          }
        }
        this.getHooks();
      });
  }

  getPulls(): void {
    this.pull_id = '';
    this.pull_name = 'All';
    this.pull_youtube = '';
    this.pull_options = [];

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
}
