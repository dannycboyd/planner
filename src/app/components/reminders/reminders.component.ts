import { Component } from "@angular/core";
import { ɵangular_packages_platform_browser_dynamic_platform_browser_dynamic_a } from "@angular/platform-browser-dynamic";
import { combineLatest } from "rxjs";
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
  constructor(private dataService: DataService, private contextService: ContextService) {

  }

  ngOnInit() {
    combineLatest([
      this.dataService.items,
      this.dataService.contextItems,
    ])
      .subscribe(([items, contextItems]) => {
        this.items = items.filter(i => i.todo);
        this.contextItems = contextItems.filter(i => i.todo);
        console.log(items, contextItems);
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