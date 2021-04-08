import { Component, Input } from "@angular/core";

@Component({ selector: 'pretty-date', templateUrl: './pretty-date.component.html' })
export class PrettyDateComponent {
  @Input() set date(d) {
    this.day = `${d.getDate()}`.padStart(2, '0');
    this.month = `${d.getMonth() + 1}`.padStart(2, '0');
    let year = d.getFullYear();
    this.shortyear = `${year}`.substring(2, 4);
  }
  day: string;
  month: string;
  shortyear: string;
}