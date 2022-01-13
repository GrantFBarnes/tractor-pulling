import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {
  server_host: string = window.location.origin;

  constructor(private http: HttpClient) {
    if (this.server_host.indexOf('localhost') >= 0) {
      this.server_host = 'http://localhost:8080';
    }
  }

  get(url: string) {
    return this.http.get(this.server_host + url, {
      withCredentials: true,
    });
  }

  post(url: string, body: {}) {
    return this.http.post(this.server_host + url, body, {
      withCredentials: true,
    });
  }

  put(url: string, body: {}) {
    return this.http.put(this.server_host + url, body, {
      withCredentials: true,
    });
  }

  delete(url: string) {
    return this.http.delete(this.server_host + url, {
      withCredentials: true,
    });
  }
}
