import { Component, Input } from '@angular/core';
import { ClientItem, ServiceItem } from 'src/app/models';
import { DataService } from 'src/app/services';

@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent {
  @Input() items: Array<ClientItem> = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.items.subscribe(i => {
      this.items = i;
    });
  }

  selectItem(item: ServiceItem) {
    console.log('send selectItem: ', item);
    this.dataService.selectItem(item.id);
  }

  deleteItem(item) {
    // this.itemDeleted.emit(item);
    console.log('implement delete item :)')
  }

  updateSearchFilter(values) {
    this.dataService.getAllItems(values);
  }
}