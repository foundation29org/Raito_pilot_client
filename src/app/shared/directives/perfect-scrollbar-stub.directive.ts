import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[perfectScrollbar]',
    standalone: false
})
export class PerfectScrollbarStubDirective {
  @Input() perfectScrollbar: unknown;
  @Input() disabled = false;
}
