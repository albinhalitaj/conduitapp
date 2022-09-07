import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  pure: true,
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return marked(value);
  }
}
