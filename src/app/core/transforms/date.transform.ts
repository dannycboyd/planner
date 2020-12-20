import { Directive, PipeTransform } from "@angular/core";

@Directive({
  selector: 'date-transform'
})
export class DateTransformer implements PipeTransform {
  transform(before: string): Date {
    return new Date(before)
  }
}