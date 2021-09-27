import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ServiceItem } from 'src/app/models';
import { DataService } from 'src/app/services';

@Component({
  selector: 'make-item',
  templateUrl: './make-item.component.html'
})
export class MakeItemComponent implements OnInit, OnDestroy {
  itemForm: FormGroup;
  showCreate = false;
  private $destroy = new Subject();
  constructor(private _fb: FormBuilder, private dataService: DataService) {

  }

  ngOnInit() {
    this.itemForm = this._fb.group({
      start_d: [],
      end_d: [],
      repeats: [],
      title: ['', Validators.required],
      note: [],
      marked_done: [],
      deleted: [],
      parent_id: [],
      journal: [],
      todo: [],
      cal: []
    })
  }

  ngOnDestroy() {
    this.$destroy.next(true);
  }

  save_item() {
    const item = ServiceItem(this.itemForm.value);
    if (item && !item.title) {
      console.error("Item needs a title to save");
      return;
    }
    const refs = [];
    item.references = refs;

    console.log("saveing: ", item);

    this.dataService.upsertItem(item);
    this.showCreate = false;
    this.itemForm.reset();
  }

  parseDate(formField: string) {
    console.log(formField);
    let before = this.itemForm.get(formField).value;
    let date = new Date(before);
    console.log(date);
    this.itemForm.get(formField).setValue(date);
  }

}