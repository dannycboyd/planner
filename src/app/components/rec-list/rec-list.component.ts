import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { DataService, ItemTree } from "src/app/services";

@Component({
  selector: 'rec-list',
  templateUrl: './rec-list.component.html'
})
export class RecListComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any>;
  tree: Array<ItemTree>;

  constructor(private dataService: DataService) {
    this.destroy$ = new Subject();
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