import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PlanItem } from 'src/app/models';

@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent {
  @Input() items: Array<PlanItem> = [];

  @Output() itemSelected = new EventEmitter<PlanItem>();
  @Output() itemDeleted = new EventEmitter<PlanItem>();

  selectItem(item) {
    this.itemSelected.emit(item);
  }

  deleteItem(item) {
    this.itemDeleted.emit(item);
  }
}