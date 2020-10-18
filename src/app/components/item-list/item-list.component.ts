import { Component, Input } from '@angular/core';
import { PlanItem } from 'src/app/models';

@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent {
  @Input() items: Array<PlanItem> = [];
}