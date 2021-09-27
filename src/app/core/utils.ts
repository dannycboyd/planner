/**
 * Take a any and turn it into a Date, but NOT IF IT IS ALREADY A DATE :)
 * @param date could be a Date, a string, or (hopefully never) something else!!
 * @returns Date
 */
export function dateFromStringOrDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date + 'Z');
  }
  return null;
}

export function UTCToLocal(date: string): Date {
  return new Date(date);
}

export function LocalToUTC(date: Date): string {
  return date.toISOString();
}

export function LocalStringToUTC(date: string): string {
  return new Date(date).toISOString();
}