import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { CalView } from '../core';
import { PlanItem } from "../models";

@Injectable()
export class ContextService {
  currentDate$: BehaviorSubject<Date>;
  private currentDate: Date;
  currentSegment$: BehaviorSubject<CalView>;
  private currentSegment: CalView;

  constructor() {
    this.currentDate$ = new BehaviorSubject(new Date()); // may be worth to put the values in here
    this.currentSegment$ = new BehaviorSubject(CalView.month);
  }

  setCurrentDate(newDate: Date) {
    this.currentDate = newDate;
    this.currentDate$.next(this.currentDate);
  }

  setCurrentSegment(newSegment: CalView) {
    // console.log(newSegment);
    this.currentSegment = newSegment;
    this.currentSegment$.next(this.currentSegment);
  }
}