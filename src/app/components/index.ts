export * from './test/test.component';
export * from './item-list/item-list.component';
export * from './item-list/item-listitem/item-listitem.component';
export * from './make-item/make-item.component';
export * from './pretty-date/pretty-date.component';
export * from './journal/journal.component';
export * from './reminders/reminders.component';
export * from './inputs/search.component';

// * general *
import { PrettyDateComponent } from './pretty-date/pretty-date.component';

// * Search
import { SearchComponent } from './inputs/search.component';

// * calendar tab *
export * from './calendar/cal-table/cal-table.component';
export * from './calendar/cal-column/cal-column.component'

import { TestComponent } from './test/test.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemListitemComponent } from './item-list/item-listitem/item-listitem.component';

// * calendar
import { CalColumnComponent } from './calendar/cal-column/cal-column.component';
import { CalTableComponent } from './calendar/cal-table/cal-table.component';

// * journal
import { MakeItemComponent } from './make-item/make-item.component';
import { JournalColumnComponent } from './journal/journal.component';

// * reminders
import { RemindersComponent } from './reminders/reminders.component';

export const Components = [
  PrettyDateComponent,
  TestComponent,
  ItemListComponent,
  ItemListitemComponent,
  CalColumnComponent,
  CalTableComponent,
  JournalColumnComponent,
  RemindersComponent,
  MakeItemComponent,
  SearchComponent
]