import { Injectable } from '@angular/core';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ItemsResponse, PlanItem } from '../models';
import { ApiService } from './api-service/api.service';

@Injectable()
export class DataService {
    items: BehaviorSubject<Array<PlanItem>>;

    constructor(private apiService: ApiService) {
        this.items = new BehaviorSubject([]);
    }

    getAllItems() {
        this.apiService.getAllItems()
            .subscribe(res => {
                // what do I need to do with the references here? Can I store them in the items safely?
                const items = [];
                for (let i = 0; i < res.items.length; i++) {
                    res.items[i].references = res.refs[i];
                    items.push(res.items[i]);
                }
                this.items.next(items);
            })
    }

    createNewItem(item: PlanItem) {
        const refs = item.references;
        delete item.references;
        this.apiService.createNewItem(item, refs)
            .subscribe(res => {
                const items = this.items.value;
                let index = items.findIndex((i: PlanItem) => {
                    i.id && i.id === res.id;
                })

                if (index >= 0) {
                    items[index] = res;
                } else {
                    items.push(res);
                }

                this.items.next(items);
            })

    }

    deleteItem(item: PlanItem) {
        this.apiService.deleteItem(item.id)
            .subscribe(res => {
                console.log(res);
                const items = this.items.value.filter(i => i.id !== item.id)
                this.items.next(items);
            })
    }
}