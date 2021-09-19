import { AfterViewInit, Component, Input } from "@angular/core";
import { DataService, ItemTree } from "src/app/services";

@Component({
  selector: 'rec-list-item',
  templateUrl: './rec-list-item.component.html'
})
export class RecListItemComponent implements AfterViewInit {
  @Input('treeNode') treeNode: ItemTree;
  opened: boolean = false;
  // how does the draw message get displayed?

  // i guess we see if the updates propagate right? hhhh

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // console.log();
  }

  ngAfterViewInit() {
    console.log(this.treeNode);
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