import { Component, OnInit } from '@angular/core';
import { ApiService } from './services';
import { PlanItem } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'planner';
  items: Array<PlanItem> = [];
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getAllItems().subscribe(items => {
      // console.log(items);
      this.items = items;
    });
  }
}
