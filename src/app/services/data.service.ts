import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { CalView } from '../core';
import { ItemsResponse, PlanItem } from '../models';
import { ApiService } from './api-service/api.service';

@Injectable()
export class DataService {
  items: BehaviorSubject<Array<PlanItem>>;
  contextItems: BehaviorSubject<Array<PlanItem>>;
  private _items: Array<PlanItem>;
  selectedItem: BehaviorSubject<PlanItem>;
  selectedParent: BehaviorSubject<PlanItem>;
  selectedChildren: BehaviorSubject<Array<PlanItem>>;

  constructor(private apiService: ApiService) {
    this.items = new BehaviorSubject([]);
    this.contextItems = new BehaviorSubject([]); // should be usable now for the reminders tab + calendar type things
    this.selectedItem = new BehaviorSubject(null);
    this.selectedParent = new BehaviorSubject(null);
    this.selectedChildren = new BehaviorSubject([]);

  }

  /* valid params:
  struct ItemFilter {
    item_id: Option<i32>,    // done
    creator_id: Option<i32>, // no users yet
    title: Option<String>,
    note: Option<String>,
    deleted: Option<bool>,  // done
    parent_id: Option<i32>, // done
    tags: Option<String>,   // works
    limit: Option<i64>,     // done
    // type
    journal: Option<bool>,
    todo: Option<bool>,
    cal: Option<bool>,
    // structural
    with_related: Option<bool>, // done
    // dates
    occurs_after: Option<UtcDateTime>, // 2012-03-29T10:05:45-06:00
    occurs_before: Option<UtcDateTime>,
    created_before: Option<UtcDateTime>,
    created_after: Option<UtcDateTime>,
    updated_before: Option<UtcDateTime>,
    updated_after: Option<UtcDateTime>,
    repeats: Option<String>
  }
*/
  getAllItems(params = {}) {
    let baseParams = {
      with_related: 'true'
    }
    this.apiService.getAllItems({ ...baseParams, ...params })
      .subscribe(items => {
        items = items.map(PlanItem);
        this.updateItemArray(items);
      })
  }

  createNewItem(item: PlanItem) {
    const refs = item.references;
    const tags = item.tags;

    const toSave = {
      ...item,
      created_at: undefined,
      updated_at: undefined,
      // ?. returns undefined if it breaks
      start_d: item.start_d?.toISOString(),
      end_d: item.end_d?.toISOString(),
    }
    delete item.references;
    delete item.tags;

    // really truly don't save these, the db will do it
    delete item.created_at;
    delete item.updated_at;
    this.apiService.createNewItem(toSave, refs, tags)
      .subscribe(res => {
        const items = this.items.value;
        let index = items.findIndex((i: PlanItem) => i.id && i.id === res.id)
        res = PlanItem(res);

        if (index >= 0) { // this is the reducer part of the redux store, which we might still want to make
          items[index] = res;
        } else {
          items.push(res);
        }

        this.updateItemArray(items);
      })

  }

  updateItemArray(items: Array<PlanItem>) {
    // sorted by creation date to facilitate positional location
    this._items = items.sort((a, b) => a.created_at > b.created_at ? 1 : -1);
    this.items.next(this._items);
  }

  deleteItem(item: PlanItem) {
    this.apiService.deleteItem(item.id)
      .subscribe(res => {
        console.log(res);
        const items = this.items.value.filter(i => i.id !== item.id)
        this.items.next(items);
      })
  }

  selectItem(itemId: number) {
    let item = this._items.find((i) => i.id === itemId)

    if (item && item.id) {
      let parent = null;
      if (item.parent_id) {
        parent = this._items.find(i => i.id === item.parent_id);
      }
      let children = this._items.filter(i => item.references.find(j => j.child_id === i.id));

      this.selectedParent.next(parent);
      this.selectedChildren.next(children);
      this.selectedItem.next(item);
    }
  }

  itemOnDay(item: PlanItem, check: Date) {
    const start = item.start_d;
    if (!item.start_d) {
      return false;
    } else {
      if (item.marked_done) {
        console.log('fix this check :)');
      }
      switch (item.repeats) {
        case 'n': return start <= check && start.getDate() == check.getDate() && start.getMonth() == check.getMonth() && start.getFullYear() == check.getFullYear();
        // check to see if ym are the same, check.date <= start.date,
        case 'y': return start <= check && start.getDate() == check.getDate() && start.getMonth() == check.getMonth();
        case 'm': return start <= check && start.getDate() == check.getDate();
        case 'w': return start <= check && start.getDay() == check.getDay();
        case 'd': return start <= check;
      }
    }
  }

  updateItemSegment(date: Date, segment: CalView) {
    this.items.pipe(take(1)).subscribe(items => {
      items = items.filter(i => i.start_d); // filter by start date after segment, end date before segment
      let offset;
      switch (segment) {
        case 'w':
          let weekday = date.getDay();
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekday);
          offset = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 - weekday);
          break;
        case 'm':
          date = new Date(date.getFullYear(), date.getMonth(), 1);
          offset = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
          break;
        case 'y':
          date = new Date(date.getFullYear(), 0, 1);
          offset = new Date(date.getFullYear() + 1, 0, 1);
          break;
      }
      let occurred = {};
      while (items.length && date < offset) {
        let i = 0;
        while (i < items.length) {
          if (this.itemOnDay(items[i], date)) {
            let key = date.getTime();
            if (!occurred[key]) {
              occurred[key] = [];
            }
            occurred[key].push(items[i].id);
          }
          i++;
        }
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      };
      console.log(items, occurred);
      this.contextItems.next([]); // this should have the days and the items
    });
  }
}