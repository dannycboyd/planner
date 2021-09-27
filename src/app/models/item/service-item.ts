// import { ClientItem } from '..';
import { LocalStringToUTC } from '../../core/utils'
// These models will be used for Sending To The Service

export interface ServiceItem {
  id?: number;
  start_d?: string;
  end_d?: string;
  repeats?: string;
  title: string;
  note?: string;
  marked_done?: boolean;
  deleted?: boolean;
  parent_id?: number;
  journal?: boolean; /* journal type */
  todo?: boolean; /* reminder type */
  cal?: boolean; /* calendar type */
  // user_id?: number;
  tags?: Array<string>;
  references?: Array<number>;
}

// Call this ONCE when you have a form result you need to send to the service
export function ServiceItem(item: any): ServiceItem {
  if (item instanceof ServiceItem) {
    return item as ServiceItem;
  }
  return {
    id: item.id,
    start_d: LocalStringToUTC(item.start_d),
    end_d: LocalStringToUTC(item.end_d),
    repeats: item.repeats,
    title: item.title,
    note: item.note,
    marked_done: item.marked_done,
    deleted: item.deleted,
    journal: item.journal,
    todo: item.todo,
    cal: item.cal,
    tags: item.tags,
    references: item.references,
  }
}

export interface ItemsResponse {
  items: Array<ServiceItem>,
  refs: Array<any>
}
