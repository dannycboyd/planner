export interface PlanItem {
  id?: Number;
  created_at?: Date;
  updated_at?: Date;
  start_d?: Date;
  end_d?: Date;
  repeats?: string;
  title: string;
  note: string;
  marked_done: boolean;
  deleted: boolean;
  parent_id?: Number;
  journal: boolean;
  todo: boolean;
  cal: boolean;
  user_id?: Number;
  references: Array<any>;
}

export function PlanItem(item: any): PlanItem {
  return {
    ...item,
    marked_done: item.marked_done || false,
    deleted: item.deleted || false,
    journal: item.journal || false,
    todo: item.todo || false,
    cal: item.cal || false,
  }
}

export interface ItemsResponse {
  items: Array<PlanItem>,
  refs: Array<any>
}