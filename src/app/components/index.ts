export * from './test/test.component';
export * from './item-list/item-list.component';
export * from './item-list/item-listitem/item-listitem.component';

// * calendar tab *
export * from './calendar/cal-table/cal-table.component';
export * from './calendar/cal-column/cal-column.component'

import { TestComponent } from './test/test.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemListitemComponent } from './item-list/item-listitem/item-listitem.component';

// * calendar
import { CalColumnComponent } from './calendar/cal-column/cal-column.component';
import { CalTableComponent } from './calendar/cal-table/cal-table.component';

export const Components = [
  TestComponent,
  ItemListComponent,
  ItemListitemComponent,
  CalColumnComponent,
  CalTableComponent
]