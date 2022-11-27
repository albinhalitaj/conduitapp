import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true,
})
export class SanitizerPipe implements PipeTransform {
  private domSanitizer: DomSanitizer = inject(DomSanitizer);
  transform(value: any, ...args: any[]): any {
    return this.domSanitizer.bypassSecurityTrustHtml(value);
  }
}
