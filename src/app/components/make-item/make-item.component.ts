import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ɵNgNoValidate } from '@angular/forms';
import { Subject } from 'rxjs';
import { PlanItem } from 'src/app/models';
import { DataService } from 'src/app/services';

@Component({
    selector: 'make-item',
    templateUrl: './make-item.component.html'
})
export class MakeItemComponent implements OnInit, OnDestroy {
    itemForm: FormGroup;
    private $destroy = new Subject();
    constructor(private _fb: FormBuilder, private dataService: DataService) {

    }

    ngOnInit() {
        this.itemForm = this._fb.group({
            start_d: [],
            end_d: [],
            repeats: [],
            title: [],
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
        const item = PlanItem(this.itemForm.value);
        const refs = [];
        item.references = refs;

        console.log("saveing: ", item);

        this.dataService.createNewItem(item);
    }
    
}