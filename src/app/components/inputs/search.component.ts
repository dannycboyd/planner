import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent {
  filterForm: FormGroup;
  filterTypes = [
    { value: 'title', label: 'Title' },
    { value: 'note', label: 'Note' },
    { value: 'tag', label: 'Tag' },
  ];

  savedValues = {
    title: '', // one string
    note: [], // long strings
    tags: [], // short strings
  }

  @Output() filterChanges = new EventEmitter();
  constructor(private _fb: FormBuilder) {
  }

  ngOnInit() {
    this.filterForm = this._fb.group({
      type: [1, Validators.required],
      filterVal: [null, Validators.required]
    });
  }

  updateFilter() {
    let formValue = this.filterForm.value;

    switch (formValue.type) {
      case 'title':
        this.savedValues.title = formValue.filterVal;
        break;
      case 'note':
        this.savedValues.note.push(formValue.filterVal);
        break;
      case 'tag':
        this.savedValues.tags.push(formValue.filterVal);
        break;
    }
    this.filterForm.reset({ type: 1 });
    this.sendUpdates();
  }

  removeTitle() {
    this.savedValues.title = null;
    this.sendUpdates();
  }

  removeNote(index: number) {
    this.savedValues.note.splice(index, 1);
    this.sendUpdates();
  }

  removeTag(index: number) {
    this.savedValues.tags.splice(index, 1);
    this.sendUpdates();
  }

  sendUpdates() {
    this.filterChanges.emit(this.savedValues);
  }
}