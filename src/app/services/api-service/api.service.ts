import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ItemsResponse, PlanItem } from 'src/app/models';

// options: {
//   headers?: HttpHeaders | {[header: string]: string | string[]},
//   observe?: 'body' | 'events' | 'response',
//   params?: HttpParams|{[param: string]: string | string[]},
//   reportProgress?: boolean,
//   responseType?: 'arraybuffer'|'blob'|'json'|'text',
//   withCredentials?: boolean,
// }

interface NewItem {
  id?: number;
  start_d?: string;
  end_d?: string;
  repeats?: string;
  title: string;
  note?: string;
  marked_done?: boolean;
  deleted?: boolean;
  parent_id?: number;
  /* journal type */
  journal?: boolean;
  /* reminder type */
  todo?: boolean;
  /* calendar type */
  cal?: boolean;
  user_id?: number;
  tags?: Array<string>;
  references?: Array<any>;
}


@Injectable()
export class ApiService {
  private url: string;
  constructor(private http: HttpClient) {
    this.url = 'http://localhost:8080'
    // this.url = 'localhost:8080';
  }

  // private assembleQuery(params: Array<{ param: String, value: String }>): String {
  //   if (params.length < 1) {
  //     return '';
  //   }
  //   let val = params.pop();
  //   let ret = `?${val.param}=${val.value}`;
  //   while (params.length) {
  //     val = params.pop();
  //     ret = ret + `&${val.param}=${val.value}`
  //   }
  //   return ret;
  // }

  private assembleQuery(params: Object): string {
    let keys = Object.keys(params);

    if (keys.length < 1) { return '' }

    let ret = '?';
    for (const [i, key] of keys.entries()) {
      if (params[key] && params[key].length > 0) { // WILL FAIL ON 0 >:|
        ret = ret + `${key}=${params[key]}`;
        if (i < keys.length - 1) { // check for last item
          ret = ret + '&';
        }
      }
    }
    return ret;
  }

  private assembleUrl(path): string {
    return this.url + '/' + path;
  }

  get(endpoint: string) {
    return this.http.get(this.assembleUrl(endpoint), { headers: { Accept: 'application/json' } });
  }

  getAllItems(params: any): Observable<Array<PlanItem>> {
    const reqUrl = this.assembleUrl('items') + this.assembleQuery(params);
    return this.http.get<Array<PlanItem>>(reqUrl)
  }

  upsertItem(newItem: NewItem, refs: Array<any> = [], tags: Array<any> = []): Observable<PlanItem> {
    const reqUrl = this.assembleUrl('items');
    return this.http.post<PlanItem>(reqUrl, { ...newItem, refs, tags });
  }

  deleteItem(itemId: Number): Observable<any> {
    const reqUrl = this.assembleUrl(`items/${itemId}`);
    return this.http.delete<any>(reqUrl);
  }

  testError(): Observable<any> {
    const reqUrl = this.assembleUrl('items/testError');
    return this.http.get<any>(reqUrl);
  }
}