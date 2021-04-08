import { Component, OnInit } from '@angular/core';
import { DataService } from './services';
import { PlanItem } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'planner';
  private _selected = "Selected Item";
  selectedTitle = this._selected;
  selectedItem: PlanItem;
  items: Array<PlanItem> = [];
  constructor(private dataService: DataService) { }

  ngOnInit() {

    this.dataService.getAllItems();
  }

  selectItem(item: PlanItem) {
    this.selectedTitle = item.title;
    this.selectedItem = item;
  }

  deselectItem() {
    this.selectedTitle = this._selected;
    this.selectedItem = null;
  }

  deleteItem(item) {
    this.dataService.deleteItem(item);
  }
}
