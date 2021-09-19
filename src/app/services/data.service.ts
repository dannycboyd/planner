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
  private _selectedItem: PlanItem;
  selectedItem: BehaviorSubject<PlanItem>;
  selectedParent: BehaviorSubject<PlanItem>;
  selectedChildren: BehaviorSubject<Array<PlanItem>>;

  constructor(private apiService: ApiService) {
    this.items = new BehaviorSubject([]);
    this.contextItems = new BehaviorSubject([]); // should be usable now for the reminders tab + calendar type things
    this.selectedItem = new BehaviorSubject(null);
    this.selectedParent = new BehaviorSubject(null);
    this.selectedChildren = new BehaviorSubject([]);
    this.drawTree$ = new BehaviorSubject([]);

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
        console.log('items get')
        items = items.map(PlanItem);
        this.updateItemArray(items);
        this.updateDrawTree(items);
      })
  }

  createNewItem(item: PlanItem) {
    const refs = item.references;
    // const tags = item.tags.map(tag => ({ tag: tag }));
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
    this.apiService.upsertItem(toSave, refs, tags)
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
    if (this._selectedItem) {
      this.selectItem(this._selectedItem.id);
    }
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

      this._selectedItem = item;
      this.selectedParent.next(parent);
      this.selectedChildren.next(children);
      this.selectedItem.next(this._selectedItem);
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


  // Model controller for the draw tree
  private drawTree: Array<ItemTree>;
  drawTree$: BehaviorSubject<Array<ItemTree>>;

  updateDrawTree(items: Array<PlanItem>) {
    let newDrawTree: Array<ItemTree> = [];
    items.filter(i => !i.parent_id).forEach(item => {
      newDrawTree.push({
        itemId: item.id,
        item: item,
        children: [] // start with empty list of children. Ask for it later.
      });
    }); // end items.filter

    this.drawTree = newDrawTree;
    this.drawTree$.next(this.drawTree);
  }



  // Adds a node to the drawTree when a parent asks to list its children
  // This should allow you to open anything, recusively going up the chain (maybe?)
  addDrawTreeNode(parentId: number) {
    // dfs through the tree
    let search = (toFindId: number, node: ItemTree) => {
      if (node.itemId === toFindId) {
        // right id
        return node;
      } else if (node.children.length < 1) {
        // wrong id, no children
        return null;
      } else {
        // wrong id, has children
        for (let i = 0; i < node.children.length; i++) {
          const result = search(toFindId, node.children[i]);
          if (result) {
            return result;
          }
          // return node.children.find(c => search(toFindId, c))
        }
      }
    }

    let entryPoint;
    for (let i = 0; i < this.drawTree.length; i++) { // JS [].find doesn't return right >:|
      const result = search(parentId, this.drawTree[i]);
      if (result) {
        entryPoint = result;
        break;
      }
    }

    if (entryPoint) {
      // look up parent children
      let parent = this._items.find(item => item.id === parentId);
      if (parent) {
        let treeChildren: Array<ItemTree> = [];
        parent.references.forEach(reference => {
          let childItem = this._items.find(item => item.id === reference.child_id)
          treeChildren.push({
            itemId: reference.child_id,
            item: childItem,
            children: []
          })
        });
        entryPoint.children = treeChildren;
        this.drawTree$.next(this.drawTree);
      } else {
        // something went wrong, that item doesn't exist. Look it up and try again?
        // for now do nothing, assume it actually doesn't exist for some reason.
      }
    }
  }

  removeDrawTreeNode(idToClose) {
    // trimming out a node via item ID.
    // for each child:
    // * is it me?
    // * is it my children?
    // * otherwise return false;
    let search = (itemId, node) => {
      if (itemId === node.itemId) {
        return node;
      } else {
        for (let i = 0; i < node.children.length; i++) {
          const result = search(itemId, node.children[i]);
          if (result) {
            return result;
          }
        }
        return null;
      }
    }

    // trim the children out of the selected node;
    let itemToClose: ItemTree;
    this.drawTree.every(node => {
      const result = search(idToClose, node);
      if (result) {
        itemToClose = result;
        return false;
      }
      return true;
    });

    if (itemToClose) {

      itemToClose.children = [];
    } else {
      // Hmmmm, do nothing? it's fine?
    }
  }

  testError() {
    this.apiService.testError()
      .subscribe(res => {
        console.log(res);
      })
  }
}

export interface ItemTree {
  itemId: number,
  item: PlanItem,
  children: Array<ItemTree>
}