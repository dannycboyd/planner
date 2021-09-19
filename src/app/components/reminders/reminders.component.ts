import { Component } from "@angular/core";
import { ɵangular_packages_platform_browser_dynamic_platform_browser_dynamic_a } from "@angular/platform-browser-dynamic";
import { combineLatest } from "rxjs";
import { CalView } from "src/app/core";
import { PlanItem } from "src/app/models";
import { ContextService, DataService } from "src/app/services";

@Component({
  selector: 'reminders',
  templateUrl: './reminders.component.html'
})
export class RemindersComponent {

  items: Array<PlanItem> = [];
  todoItems: Array<PlanItem> = [];
  doneItems: Array<PlanItem> = [];
  contextItems: Array<PlanItem> = [];
  viewTypes = CalView;

  currentDate: Date;
  dateFormat: string;
  currentSegment: string;
  constructor(private dataService: DataService, private contextService: ContextService) {

  }

  ngOnInit() {
    combineLatest([
      this.dataService.items,
      this.dataService.contextItems,
      this.contextService.currentDate$,
      this.contextService.currentSegment$
    ])
      .subscribe(([items, contextItems, date, segment]) => {
        this.items = items.filter(i => i.todo);
        this.contextItems = contextItems.filter(i => i.todo);
        this.currentSegment = segment;
        this.currentDate = date;
        switch (segment) {
          case CalView.week:
            // this.currentSegment = 'Week of ';
            this.dateFormat = 'longDate';
            break;
          case CalView.month:
            // this.currentSegment = '';
            this.dateFormat = 'MMMM, y';
            break;
          case CalView.year:
            // this.currentSegment = '';
            this.dateFormat = 'y';
        }
        console.log(items, contextItems, date, segment);
      })
  }

  getTodoItems() {
    return this.items.filter(i => !i.marked_done)
  }

  getDoneTodoItems() {
    return this.items.filter(i => i.marked_done);
  }

  toggleItem(item: PlanItem) {
    console.log('blah');
    this.dataService.createNewItem({ id: item.id, title: item.title, marked_done: !item.marked_done });
    // only send the required base attributes
  }
}