import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlanItem } from 'src/app/models';

@Component({
  selector: 'item-li', // change this, it's a flex list now
  templateUrl: './item-listitem.component.html'
})
export class ItemListitemComponent implements OnInit {
  @Input() item: PlanItem;
  @Output() itemDeleted = new EventEmitter();
  @Output() referenceDeleted = new EventEmitter();

  ngOnInit() {
    console.log(this.item);
  }

  deleteItem() {
    this.itemDeleted.emit(true);
  }

  deleteReference(ref) {
    this.referenceDeleted.emit(ref.id);
  }
}