import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { DataService, HotkeysService, ItemTree } from "src/app/services";

@Component({
  selector: 'rec-list',
  templateUrl: './rec-list.component.html'
})
export class RecListComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any>;
  tree: Array<ItemTree>;

  constructor(private dataService: DataService, private hotkeys: HotkeysService) {
    this.destroy$ = new Subject();

    this.hotkeys.addShortcut({ keys: 'tab', description: 'indent item' }).subscribe((e) => {
      this.dataService.indentSelected();
    })
    this.hotkeys.addShortcut({ keys: 'shift.tab', description: 'un-indent item' }).subscribe(e => {
      this.dataService.unindentSelected();
    })
    this.hotkeys.addShortcut({ keys: 'control.arrowup' }).subscribe(e => {
      this.dataService.reorderUp();
    })
    this.hotkeys.addShortcut({ keys: 'control.arrowdown' }).subscribe(e => {
      this.dataService.reorderDown();
    })
  }

  ngOnInit() {
    this.dataService.drawTree$.subscribe((tree: Array<any>) => {
      console.log('hi there', tree);
      this.tree = tree;
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }
}