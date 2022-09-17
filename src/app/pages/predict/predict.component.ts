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

  defaultRow: any = {
    season: '',
    location: '',
    puller: '',
    tractor: '',
    category: '',
    weight: 5000,
    hook_count: 5,

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

  fieldChange(idx: number, column: string): void {
    switch (column) {
      case 'weight':
        if (this.rows[idx][column] < 1500) {
          this.rows[idx][column] = 1500;
        } else if (this.rows[idx][column] > 12500) {
          this.rows[idx][column] = 12500;
        }
        break;

      case 'hook_count':
        if (this.rows[idx][column] < 2) {
          this.rows[idx][column] = 2;
        } else if (this.rows[idx][column] > 100) {
          this.rows[idx][column] = 100;
        }
        break;

      default:
        break;
    }
    this.rows[idx].calculated = false;
  }

  calculate(idx: number): void {
    const row = this.rows[idx];
    for (let col of ['season', 'location', 'puller', 'tractor', 'category']) {
      if (!row[col]) {
        alert('Need to provide a ' + col);
        return;
      }
    }

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
