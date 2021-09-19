import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil, withLatestFrom } from "rxjs/operators";
import { PlanItem } from "src/app/models";
import { DataService } from "src/app/services";
import { ItemListComponent } from "../item-list/item-list.component";

@Component({
  selector: 'journal-column',
  templateUrl: './journal.component.html'
})
export class JournalColumnComponent implements OnInit {

  private destroy$ = new Subject();

  selected: PlanItem;
  selectedTitle: string = 'Select an Item';
  parentTitle: string;
  children: Array<string>;

  editing: boolean = false;
  itemForm: FormGroup;
  repetition_options = [
    { value: 'n', label: 'None' },
    { value: 'y', label: 'Yearly' },
    { value: 'm', label: 'Monthly' },
    { value: 'w', label: 'Weekly' },
    { value: 'd', label: 'Daily' },
  ]

  constructor(private dataService: DataService,
    private _fb: FormBuilder) {

  }

  ngOnInit() {
    this.dataService.selectedItem
      .pipe(withLatestFrom(
        this.dataService.selectedParent,
        this.dataService.selectedChildren
      ),
        takeUntil(this.destroy$))
      .subscribe(([item, parent, children]: [PlanItem, PlanItem, Array<PlanItem>]) => {
        console.log('journal recieved selected item: ', item);
        if (item) {
          this.selected = item;
          this.editing = false;
          this.selectedTitle = item.title;

          this.parentTitle = parent ? parent.title : null;
          this.children = children.map(c => c.title);
        }
      })
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  tagSelected(tag) {
    console.log('Search for like-tagged items: ', tag);
    this.dataService.getAllItems({ tags: [tag].toString() })
  }

  edit() {
    this.selectedTitle = 'Editing';
    this.itemForm = this._fb.group({
      title: [this.selected.title, Validators.required],
      start_d: [this.selected.start_d],
      end_d: [this.selected.end_d],
      repeats: [this.selected.repeats],
      note: [this.selected.note],
      parent_id: [this.selected.parent_id],
      tags: [this.selected.tags?.join() || ''],
      cal: [this.selected.cal],
      journal: [this.selected.journal],
      todo: [this.selected.todo],
      references: []
    })
    this.editing = true;
  }

  new() {
    this.selected = PlanItem({});
    this.selectedTitle = 'New Item';
    this.edit();
  }

  cancel() {
    this.selectedTitle = this.selected.title;
    this.editing = false;
    this.selected = undefined;
  }

  save_item() {
    let item = { id: this.selected.id || null, ...this.itemForm.value };
    if (item && !item.title) {
      console.error("Item needs a title to save");
      return;
    }

    if (item.tags) {
      item.tags = item.tags.split(',').map((t: string) => t.trim());
    } else {
      item.tags = [];
    }

    if (item.references) {
      item.references = item.references.split(',').map((t: string) => ({ origin_id: item.id, child_id: Number(t) }));
    } else {
      item.references = [];
    }

    item = PlanItem(item);

    console.log("saveing: ", item);

    this.dataService.createNewItem(item as PlanItem);
    // update view
    this.selected = { ...item, created_at: new Date() };
    this.selectedTitle = item.title;
    this.editing = false;
    this.itemForm.reset();
  }

  parseDate(formField: string) {
    console.log(formField);
    let before = this.itemForm.get(formField).value;
    if (before) {
      let date = new Date(before);
      console.log(date);
      this.itemForm.get(formField).setValue(date);
    }
  }
}