export interface PlanItem {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
  start_d?: Date;
  end_d?: Date;
  repeats?: string;
  title: string;
  note?: string;
  marked_done?: boolean;
  deleted?: boolean;
  parent_id?: number;
  journal?: boolean; /* journal type */
  todo?: boolean; /* reminder type */
  cal?: boolean; /* calendar type */
  user_id?: number;
  tags?: Array<string>;
  references?: Array<any>;
}

/**
 * Take a any and turn it into a Date, but NOT IF IT IS ALREADY A DATE :)
 * @param date could be a Date, a string, or (hopefully never) something else!!
 * @returns Date
 */
function dateFromStringOrDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date + 'Z');
  }
  return null;
}

function stripTags(tags: Array<any>): Array<String> {
  return tags.map(t => {
    if (t instanceof String) {
      return t
    } else {
      return t.tag
    }
  })
}

// do I get anything from making this a real class?
// this function is called in too many places
export function PlanItem(item: any): PlanItem {
  if (item instanceof PlanItem) {
    // maybe this is enough, but
    return item as PlanItem;
  }
  console.log(item.start_d);
  return {
    ...item,
    created_at: dateFromStringOrDate(item.created_at),
    updated_at: dateFromStringOrDate(item.updated_at),
    start_d: dateFromStringOrDate(item.start_d),
    end_d: dateFromStringOrDate(item.end_d),
    marked_done: item.marked_done || false,
    deleted: item.deleted || false,
    journal: item.journal || false,
    todo: item.todo || false,
    cal: item.cal || false,
    tags: stripTags(item.tags) || [],
    references: item.references || [],
  }
}

export interface ItemsResponse {
  items: Array<PlanItem>,
  refs: Array<any>
}