import { Pipe, PipeTransform } from '@angular/core';
import { InquiriesInterface } from './home.service';

@Pipe({
  name: 'filter_inquiry',
})
export class FilterInquiryPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(
    inputs: InquiriesInterface[] | null,
    searchString: string
  ): InquiriesInterface[] {
    if (inputs === null) {
      return [];
    }
    if (inputs.length === 0 || searchString === '') {
      return inputs.length === 0 ? [] : inputs;
    }
    searchString = searchString.toString().toLocaleLowerCase();
    const filteredInquiries: InquiriesInterface[] = [];
    for (const u of inputs) {
      if (u.uid.toLocaleLowerCase().includes(searchString)) {
        filteredInquiries.push(u);
      } else if (u.inquiry_type.toLocaleLowerCase().includes(searchString)) {
        filteredInquiries.push(u);
      } else if (u.status.toLocaleLowerCase().includes(searchString)) {
        filteredInquiries.push(u);
      } else if (u.description.toLocaleLowerCase().includes(searchString)) {
        filteredInquiries.push(u);
      } else if (u.subject.toLocaleLowerCase().includes(searchString)) {
        filteredInquiries.push(u);
      }
    }
    return filteredInquiries;
  }
}
