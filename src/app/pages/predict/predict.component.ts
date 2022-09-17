import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Season } from 'src/app/shared/interfaces/season';
import { Location } from 'src/app/shared/interfaces/location';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Tractor } from 'src/app/shared/interfaces/tractor';

@Component({
  selector: 'app-predict',
  templateUrl: './predict.component.html',
  providers: [HttpService],
  styleUrls: ['./predict.component.css'],
})
export class PredictComponent implements OnInit {
  loading: boolean = true;

  seasons: { [id: string]: Season } = {};
  locations: { [id: string]: Location } = {};
  pullers: { [id: string]: Puller } = {};
  tractors: { [id: string]: Tractor } = {};
  categories: { [id: string]: null } = {
    'Farm Stock': null,
    'Farm Plus': null,
    'Antique Modified': null,
  };
  weights: { [id: number]: null } = {
    3500: null,
    3750: null,
    4000: null,
    4300: null,
    4350: null,
    4500: null,
    5000: null,
    5500: null,
    6000: null,
    6150: null,
    6500: null,
    7000: null,
    7500: null,
    8000: null,
    8500: null,
    9000: null,
    9500: null,
    10000: null,
  };
  hook_counts: { [id: number]: null } = {
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: null,
    16: null,
    17: null,
    18: null,
    19: null,
    20: null,
  };

  defaultRow: any = {
    season: '',
    location: '',
    puller: '',
    tractor: '',
    category: '',
    weight: 0,
    hook_count: 0,

    calculated: false,
    score: 0,
    chance: 0,
  };

  rows: any[] = [JSON.parse(JSON.stringify(this.defaultRow))];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getLocations();
  }

  getPercentageClass(val: number): string {
    val = val * 100;
    if (val < 1) return 'red-bg';
    if (val < 25) return 'orange-bg';
    if (val < 50) return 'yellow-bg';
    return 'green-bg';
  }

  getPercentageStr(val: number): string {
    val = val * 100;
    if (val < 1) return '< 1%';
    return val.toFixed(0) + '%';
  }

  selectField(obj: any): void {
    const idx = parseInt(obj.id);
    this.rows[idx][obj.column] = obj.value;
    this.rows[idx].calculated = false;
  }

  calculate(idx: number): void {
    const row = this.rows[idx];
    for (let col of [
      'season',
      'location',
      'puller',
      'tractor',
      'category',
      'weight',
      'hook_count',
    ]) {
      if (!row[col]) {
        alert('Need to provide a ' + col);
        return;
      }
    }

    row.weight = parseInt(row.weight);
    row.hook_count = parseInt(row.hook_count);

    this.loading = true;

    this.httpService.post('/api/predict/winning', row).subscribe({
      next: (data: any) => {
        this.rows[idx].calculated = true;
        this.rows[idx].score = data.score;
        this.rows[idx].chance = data.chance;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to predict model!');
      },
    });
  }

  duplicateRow(idx: number): void {
    this.rows.push(JSON.parse(JSON.stringify(this.rows[idx])));
  }

  deleteRow(idx: number): void {
    this.rows.splice(idx, 1);
  }

  addRow(): void {
    this.rows.push(JSON.parse(JSON.stringify(this.defaultRow)));
  }

  getTractors(): void {
    this.tractors = {};

    this.httpService.get('/api/pulling/tractors').subscribe((data: any) => {
      for (let i in data) {
        this.tractors[data[i].id] = data[i];
      }
      this.loading = false;
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

  getSeasons(): void {
    this.seasons = {};

    this.httpService.get('/api/pulling/seasons').subscribe((data: any) => {
      for (let i in data) {
        this.seasons[data[i].id] = data[i];
      }
      this.getPullers();
    });
  }

  getLocations(): void {
    this.locations = {};

    this.httpService.get('/api/pulling/locations').subscribe((data: any) => {
      for (let i in data) {
        this.locations[data[i].id] = data[i];
      }
      this.getSeasons();
    });
  }
}
