import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PlanItem } from 'src/app/models';

// options: {
//   headers?: HttpHeaders | {[header: string]: string | string[]},
//   observe?: 'body' | 'events' | 'response',
//   params?: HttpParams|{[param: string]: string | string[]},
//   reportProgress?: boolean,
//   responseType?: 'arraybuffer'|'blob'|'json'|'text',
//   withCredentials?: boolean,
// }

@Injectable()
export class ApiService {
  private url: string;
  constructor(private http: HttpClient) {
    this.url = 'http://localhost:8080'
    // this.url = 'localhost:8080';
  }

  private assembleUrl(path): string {
    return this.url + '/' + path;
  }

  get(endpoint: string) {
    return this.http.get(this.assembleUrl(endpoint), { headers: { Accept: 'application/json' }});
  }

  getAllItems(): Observable<Array<PlanItem>> {
    const reqUrl = this.assembleUrl('item/all')
    return this.http.get<Array<PlanItem>>(reqUrl)
  }
}