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
  items: Array<PlanItem> = [];
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.items.subscribe((items: Array<PlanItem>) => {
      this.items = items;
    })
    this.dataService.getAllItems();
  }
}
