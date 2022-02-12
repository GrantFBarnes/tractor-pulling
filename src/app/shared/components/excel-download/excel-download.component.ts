import { Component, OnInit, Input } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http/http.service';
import { Class } from 'src/app/shared/interfaces/class';
import { Hook } from 'src/app/shared/interfaces/hook';
import { Puller } from 'src/app/shared/interfaces/puller';
import { Tractor } from 'src/app/shared/interfaces/tractor';

import * as sort from 'src/app/shared/methods/sort';
import * as stringify from 'src/app/shared/methods/stringify';

@Component({
  selector: 'app-excel-download',
  templateUrl: './excel-download.component.html',
  providers: [HttpService],
  styleUrls: ['./excel-download.component.css'],
})
export class ExcelDownloadComponent implements OnInit {
  @Input() pull_id: string = '';
  @Input() pull_name: string = '';
  @Input() pullers: { [id: string]: Puller } = {};
  @Input() tractors: { [id: string]: Tractor } = {};
  classes: Class[] = [];
  hooks: Hook[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {}

  downloadFile(type: string, name: string, content: any): void {
    let typeKey = '';
    switch (type) {
      case 'excel':
        typeKey =
          'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
        break;

      case 'csv':
        typeKey = 'data:text/csv;charset=utf-8,';
        break;

      case 'text':
        typeKey = 'data:text/json;charset=utf-8,';
        break;

      case 'pdf':
        typeKey = 'data:application/pdf;base64,';
        break;

      default:
        return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', typeKey + encodeURIComponent(content));
    element.setAttribute('download', name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  getExcel(json: { name: string; classes: any[] }): void {
    this.httpService
      .post('/api/pulling/excel/download', json)
      .subscribe((data: any) => {
        this.downloadFile('excel', this.pull_name + '.xlsx', data);
      });
  }

  getHookJSON(hook: Hook): {
    position: number;
    puller: string;
    tractor: string;
    distance: number;
  } {
    return {
      position: hook.position,
      puller: stringify.getPullerStr(this.pullers[hook.puller], false),
      tractor: stringify.getTractorStr(this.tractors[hook.tractor]),
      distance: hook.distance,
    };
  }

  getClassJSON(cl: Class): { name: string; hooks: any[] } {
    let json: { name: string; hooks: any[] } = {
      name: stringify.getClassStr(cl),
      hooks: [],
    };

    for (let i in this.hooks) {
      const hook = this.hooks[i];
      if (hook.class !== cl.id) continue;
      json.hooks.push(this.getHookJSON(hook));
    }
    json.hooks.sort(sort.hookExcel);

    return json;
  }

  getPullJSON(): { name: string; classes: any[] } {
    let json: { name: string; classes: any[] } = {
      name: this.pull_name,
      classes: [],
    };

    for (let i in this.classes) {
      const cl = this.classes[i];
      if (cl.pull !== this.pull_id) continue;
      json.classes.push(this.getClassJSON(cl));
    }
    json.classes.sort(sort.classExcel);

    return json;
  }

  getHooks(): void {
    this.hooks = [];
    this.httpService
      .get('/api/pulling/hooks/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.hooks = data;
        this.getExcel(this.getPullJSON());
      });
  }

  getClasses(): void {
    this.classes = [];
    this.httpService
      .get('/api/pulling/classes/pull/' + this.pull_id)
      .subscribe((data: any) => {
        this.classes = data;
        this.getHooks();
      });
  }

  startExcelRequest(): void {
    this.getClasses();
  }
}
