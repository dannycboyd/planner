import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanItem } from 'src/app/models';

@Component({
  selector: 'item-li', // change this, it's a flex list now
  templateUrl: './item-listitem.component.html'
})
export class ItemListitemComponent {
  @Input() item: PlanItem;
  @Output() itemDeleted = new EventEmitter();

  deleteItem() {
    this.itemDeleted.emit(true);
  }
}