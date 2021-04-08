import { Component } from "@angular/core";
import { ContextService, DataService } from 'src/app/services';
import { combineLatest } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { CalView } from 'src/app/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cal-column',
  templateUrl: 'cal-column.component.html'
})
export class CalColumnComponent {
  title = '';
  private datePipe: DatePipe;
  private currentDate: Date;
  private currentSegment: CalView;

  constructor(private contextService: ContextService,
    private dataService: DataService) {
    this.datePipe = new DatePipe('en-US');
  }

  ngOnInit() {
    // this.contextService.setCurrentSegment(CalView.month);
    // this.contextService.setCurrentDate(new Date());
    combineLatest([this.contextService.currentDate$, this.contextService.currentSegment$])
      .subscribe(([date, segment]) => {
        this.dataService.updateItemSegment(date, segment);
        this.currentDate = date;
        this.currentSegment = segment;
        let format;
        switch (segment) {
          case CalView.week:
            format = 'MMMM dd, yyyy'
            this.setTitle('Week of ' + this.formatDate(date, format));
            break;
          case CalView.month:
            format = 'MMMM yyyy'
            this.setTitle(this.formatDate(date, format));
            break;
          case CalView.year:
            format = 'yyyy';
            this.setTitle(this.formatDate(date, format));
            break;

        }
      })
  }

  setTitle(newTitle: string) {
    this.title = newTitle;
  }

  private formatDate(date: Date, format: string): string {
    return this.datePipe.transform(date, format);
  }

  setYear() {
    // console.log('setYear');
    this.contextService.setCurrentSegment(CalView.year);
  }

  setMonth() {
    // console.log('setmo');
    this.contextService.setCurrentSegment(CalView.month);
  }

  setWeek() {
    // console.log('setwe');
    this.contextService.setCurrentSegment(CalView.week)
  }

  goBack() {
    let offset;
    switch (this.currentSegment) {
      case CalView.week:
        offset = this.currentDate.getDate();
        this.currentDate.setDate(offset - 7);
        break;
      case CalView.month:
        offset = this.currentDate.getMonth();
        this.currentDate.setMonth(offset - 1);
        break;
      case CalView.year:
        offset = this.currentDate.getFullYear();
        this.currentDate.setFullYear(offset - 1);
        break;

    }
    this.contextService.setCurrentDate(this.currentDate);
  }

  goForward() {
    let offset;
    switch (this.currentSegment) {
      case CalView.week:
        offset = this.currentDate.getDate();
        this.currentDate.setDate(offset + 7);
        break;
      case CalView.month:
        offset = this.currentDate.getMonth();
        this.currentDate.setMonth(offset + 1);
        break;
      case CalView.year:
        offset = this.currentDate.getFullYear();
        this.currentDate.setFullYear(offset + 1);
        break;

    }
    this.contextService.setCurrentDate(this.currentDate);
  }
}