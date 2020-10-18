export interface PlanItem {
  id: Number;
  start_d?: Date;
  end_d?: Date;
  created_at: Date;
  updated_at: Date;

  title: string;
  note: string;
  repeats?: string;

  parent_id?: Number;

  deleted: boolean;

  cal: boolean;
  journal: boolean;
  todo: boolean;
}