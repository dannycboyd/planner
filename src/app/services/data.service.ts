import { Injectable } from '@angular/core';
import { notStrictEqual } from 'assert';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { CalView } from '../core';
import { ServiceItem, ClientItem } from '../models';
import { ApiService } from './api-service/api.service';

@Injectable()
export class DataService {
  items: BehaviorSubject<Array<ClientItem>>;
  contextItems: BehaviorSubject<Array<ClientItem>>;
  private _items: Array<ClientItem>;
  private _selectedItem: ClientItem;
  selectedItem: BehaviorSubject<ClientItem>;
  selectedParent: BehaviorSubject<ClientItem>;
  selectedChildren: BehaviorSubject<Array<ClientItem>>;

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

  // Draw up a diagram for how this flows. I have two models, how will I use them?
  getAllItems(params = {}) {
    let baseParams = {
      with_related: 'true'
    }
    this.apiService.getAllItems({ ...baseParams, ...params })
      .subscribe(items => {
        console.log('items get');
        this.updateItemArray(items);
        this.updateDrawTree(items);
      })
  }

  upsertItem(item: ServiceItem) {
    this.apiService.upsertItem(item)
      .subscribe(res => {
        const items = this.items.value;
        let index = items.findIndex((i: ClientItem) => i.id && i.id === res.id)

        if (index >= 0) { // this is the reducer part of the redux store, which we might still want to make
          items[index] = res;
        } else {
          items.push(res);
        }

        this.updateItemArray(items);
      })

  }

  updateItemArray(items: Array<ClientItem>) {
    // sorted by creation date to facilitate positional location
    this._items = items.sort((a, b) => a.created_at > b.created_at ? 1 : -1);
    this.items.next(this._items);
    if (this._selectedItem) {
      this.selectItem(this._selectedItem.id);
    }
  }

  deleteItem(item: ClientItem) {
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

  itemOnDay(item: ClientItem, check: Date) {
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

  updateDrawTree(items: Array<ClientItem>) {
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

  private getChildren(parentId: number) {
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
      return treeChildren;
    } else {
      // something went wrong, that item doesn't exist. Look it up and try again?
      // for now do nothing, assume it actually doesn't exist for some reason.
    }
  }

  /**
   * Adds a node to the drawTree when a parent asks to list its children
   */
  // This should allow you to open anything, recusively going up the chain (maybe?)
  addDrawTreeNode(parentId: number) {
    // depth-first search through the drawTree
    let search = (nodes: ItemTree[]) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].itemId === parentId) {
          return nodes[i];
        } else {
          const result = search(nodes[i].children);
          if (result) { return result; }
        }
      }
      return null; // nothing on this branch, return
    }
    const entryPoint = search(this.drawTree);
    if (entryPoint) {
      // look up parent children

      entryPoint.children = this.getChildren(parentId);
      this.drawTree$.next(this.drawTree);
    }
  }

  /**
   * Empties out the `children` array of the corresponding node in the drawTree.
   * @param idToClose the item ID of the drawtree node that is being closed.
   */
  removeDrawTreeNode(idToClose: number) {
    // depth-first search to find the node to close
    let search = (nodes: ItemTree[]) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].itemId === idToClose) {
          return nodes[i];
        } else {
          const result = search(nodes[i].children);
          if (result) { return result; }
        }
      }
      return null; // nothing on this branch, return
    }

    const itemToClose = search(this.drawTree);
    if (itemToClose) {
      itemToClose.children = [];
    } else {
      // Hmmmm, do nothing? it's fine?
    }
  }

  /**
   * indentSelected searches for the current item (`this._selectedItem`) and tries to set its immediate preceding sibling to its parent.
   * It will do nothing if there is no sibling immediately before it in its parent's `children` array.
   */
  // Can I trim this to use only one loop? 
  indentSelected() {
    const selectedId = this._selectedItem ? this._selectedItem.id : null;
    if (!selectedId) {
      return;
    }

    // use a DFS to find the neighbor of the selected item
    let search = (toIndentId: number, nodes: ItemTree[]) => {
      let previous;
      if (nodes.length < 2) {
        return null;
      }

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].itemId === toIndentId) {
          if (previous) {
            return previous; // found the neighbor, that's it
          } else {
            return null; // nothing to indent this under
          }
        } else {
          previous = nodes[i];
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        previous = null;
        let result = search(toIndentId, nodes[i].children);
        if (result) {
          return result;
        }
      }
    }

    let neighbor = search(selectedId, this.drawTree);
    console.log(neighbor);
  }

  /**
   * unindentSelected searches for the current item (`this._selectedItem`) and tries to change its grandparent to its parent.
   * If it is in the root (`this.drawTree`) then nothing will happen.
   */
  unindentSelected() {
    console.error("unindentSelected: this keybind is unimplemented!");
  }

  /**
   * Swap two elements of an array. Used in `reorderUp()` and `reorderDown()`
   * @param nodes `Array<any>` the source array to modify
   * @param index the starting index to swap
   * @param difference the offset of the index with which to swap
   */
  private swapNodes(nodes: Array<any>, index: number, difference: number) {
    const a = nodes[index];
    nodes[index] = nodes[index + difference];
    nodes[index + difference] = a;
  }

  /**
   * Searches for the current item (`this._selectedItem`) and tries to swap it with the item above it without changing parents in the tree.
   * Nothing will happen if there's no item preceding it in the parent node's array of children.
   * See also `reorderDown()`
   */
  // the if (index && index > 0) parts need to call out to the api service to do something to reorder. 
  // currently no way to order items in the service. There should be a good way to do this? Something with semi-random numbers that you can swap around for ordering.
  reorderUp() {
    let searchId = this._selectedItem ? this._selectedItem.id : null;
    if (!searchId) {
      return;
    }

    let findIndex = (node: ItemTree) => node.itemId === searchId;

    let search = (nodes: ItemTree[]) => {
      const index = nodes.findIndex(findIndex);
      if (index !== -1) {
        return [nodes, index];
      } else {
        for (let i = 0; i < nodes.length; i++) {
          const result = search(nodes[i].children);
          if (result) { return result }
        }
        return null;
      }
    }

    let result = search(this.drawTree);
    if (result) {
      const [nodes, index] = result;
      console.error("Unimplemented reorder API call goes here");
      if (index > 0) {
        this.swapNodes(nodes, index, -1);
      }
    }
  }

  /**
   * reorderDown() searches for the current item (this._selectedItem) and tries to swap it witht he item below it without changing parents in the tree. See also reorderUp()
   * @returns null
   */
  reorderDown() {
    let searchId = this._selectedItem ? this._selectedItem.id : null;
    if (!searchId) {
      return;
    }

    const findIndex = (node: ItemTree) => node.itemId === searchId;

    let search = (nodes: ItemTree[]) => {
      const index = nodes.findIndex(findIndex);
      if (index !== -1) {
        return [nodes, index];
      } else {
        for (let i = 0; i < nodes.length; i++) {
          const result = search(nodes[i].children);
          if (result) { return result }
        }
        return null;
      }
    }

    let result: [ItemTree[], number] = search(this.drawTree);
    if (result) {
      const [nodes, index] = result;
      // This should be a side-effect of making an API call:
      // this.apiService.upsert([ { id: a, order: orderA }, { id: b, order: orderB }])
      console.error("Unimplemented reorder API call goes here");
      if (index < nodes.length) {
        this.swapNodes(nodes, index, 1);
      }

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
  item: ClientItem,
  children: Array<ItemTree>
}