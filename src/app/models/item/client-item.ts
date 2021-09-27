import { UTCToLocal } from "src/app/core"
// Models which come from the service go here :)
// This should be called ClientItem, because it goes to the client.

export interface ClientItem {
  id: number;
  created_at: Date;
  updated_at: Date;
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
  tags?: Array<ClientTag>;
  references?: Array<ClientRef>;
}

export interface ClientTag {
  id: number,
  created_at: Date,
  updated_at: Date,
  item_id: number,
  tag: string
}

export interface ClientRef {
  origin_id: number,
  child_id: number,
  created_at: Date,
  updated_at: Date
}

// call this function when you get an item back from the service :)
export function ClientItem(item: any): ClientItem {
  return {
    id: item.id,
    created_at: UTCToLocal(item.created_at),
    updated_at: UTCToLocal(item.updated_at),
    start_d: UTCToLocal(item.start_d),
    end_d: UTCToLocal(item.end_d),
    repeats: item.repeats,
    title: item.title,
    note: item.note,
    marked_done: item.marked_done,
    deleted: item.deleted,
    parent_id: item.parent_id,
    journal: item.journal,
    todo: item.todo,
    cal: item.cal,
    user_id: item.user_id,
    tags: item.tags.map(ClientTag),
    references: item.references.map(ClientRef)
  }
}

function ClientTag(tag: any): ClientTag {
  return {
    id: tag.id,
    created_at: UTCToLocal(tag.created_at),
    updated_at: UTCToLocal(tag.updated_at),
    item_id: tag.item_id,
    tag: tag.tag
  }
}

function ClientRef(ref: any): ClientRef {
  return {
    created_at: UTCToLocal(ref.created_at),
    updated_at: UTCToLocal(ref.updated_at),
    origin_id: ref.origin_id,
    child_id: ref.child_id
  }
}