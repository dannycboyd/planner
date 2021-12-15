import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { ClientItem } from "src/app/models";
import { DataService, ItemTree } from "src/app/services";

@Component({
  selector: 'rec-list-item',
  templateUrl: './rec-list-item.component.html'
})
export class RecListItemComponent implements OnInit, OnDestroy {
  @Input('treeNode') treeNode: ItemTree;
  opened: boolean = false;
  highlighted: boolean = false;
  destroy$ = new Subject();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // console.log();
    this.dataService.selectedItem.pipe(filter((i: ClientItem) => !!(i && i.id)), takeUntil(this.destroy$)).subscribe(item => {
      this.highlighted = item.id === this.treeNode.itemId;
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  selectMe() {
    this.dataService.selectItem(this.treeNode.itemId);
  }

  openMe() {
    this.dataService.addDrawTreeNode(this.treeNode.itemId);
    this.opened = true;
  }

  closeMe() {
    this.dataService.removeDrawTreeNode(this.treeNode.itemId);
    this.opened = false;
  }
}