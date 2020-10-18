import { Component, OnInit, Input, OnDestroy } from "@angular/core";

import { CalView } from '../../../core';
import { ContextService } from 'src/app/services/context.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'cal-table',
  templateUrl: './cal-table.component.html'
})
export class CalTableComponent implements OnInit, OnDestroy {
  state: CalView = CalView.month;
  currentDate: Date;
  calView = CalView;
  
  monthRows = [];
  weekDays = [];

  private destroy$ = new Subject<boolean>();
  
  constructor(private contextService: ContextService) {}

  ngOnInit() {
    this.contextService.currentDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentDate => {
        this.displayMonth(currentDate);
        this.displayWeek(currentDate);
      });

    this.contextService.currentSegment$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentSegment => {
        this.displaySegment(currentSegment);
      });

    // if (!this.currentDate) {
    //   this.contextService.setCurrentDate(new Date());
    // }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }
  
  // returns the length of the month
  private getMonthLength(date: Date): number {
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // next month
    return new Date(year, month, 0).getDate(); // day 0 is the last day of last month
  }

  // returns 0-6 the day of the week (0 is sunday);
  private getFirstDay(date: Date): number {
    let year = date.getFullYear();
    let month = date.getMonth();
    return new Date(year, month, 1).getDay();
  }

  displayMonth(date: Date) {
    this.currentDate = date;
    this.monthRows = [];

    let first = this.getFirstDay(date)
    let length = this.getMonthLength(date);

    // console.log(first, length);
    // console.log((first + length) / 7)

    // I want to get the number of rows.
    // I have the number of empty spaces before 1
    // so the number I have is first + length
    const numRows = (first + length) / 7;
    // let emptyDays = this.first;
    this.monthRows[0] = [];
    for(let i = 0; i < first; i++) {
      this.monthRows[0].push(undefined);
    }

    let day = 1;
    let currentRow = 0;
    while (day <= length) {
      // console.log(day, currentRow);
      if (this.monthRows[currentRow].length === 7) {
        currentRow++;
      }
      if (!this.monthRows[currentRow]) {
        this.monthRows[currentRow] = [day];
      } else {
        this.monthRows[currentRow].push(day);
      }
      day++;
    }
    while (this.monthRows[currentRow].length % 7) {
      this.monthRows[currentRow].push(undefined);
    }

    // console.log(this.monthRows);
  }

  displaySegment(segment: CalView) {
    // console.log('Segment changed');
    this.state = segment;
  }

  /**
   * @param day number||undefined
   */
  selectDay(day: number) {
    if (day) {
      this.currentDate.setDate(day);
      this.contextService.setCurrentDate(this.currentDate);
    }
  }

  selectDate(date: Date) {
    // this.currentDate = date;
    this.contextService.setCurrentDate(date)
  }

  displayWeek(date: Date) {
    this.currentDate = date;
    let weekdayOffset = date.getDay();
    let day = date.getDate();
    this.currentDate.setDate(day - weekdayOffset);
    // back up to the sunday

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      this.weekDays.push({ day: this.currentDate.getDate(), date: this.currentDate });
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate()+1);
    }
    // console.log(this.weekDays);
  }
}