import { Component, Input } from '@angular/core';
import { PlanItem } from 'src/app/models';

@Component({
  selector: 'item-li',
  templateUrl: './item-listitem.component.html'
})
export class ItemListitemComponent {
  @Input() item: PlanItem;s
}