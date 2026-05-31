import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutside {
  /** Reference to the host element where the directive is applied */
  private elementRef = inject(ElementRef);
  /** Event emitter that notifies the parent component when a click occurs outside the element */
  @Output() appClickOutside = new EventEmitter<void>();
  
  /**
   * Global listener for click events across the entire document.
   * Compares the click target with the host element to determine if the click was "outside".
  */
  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Safety check: exit if the target is null or undefined
    if (!target) return;
    /** Boolean flag: true if the clicked element is a child of the host element */
    const clickedInside = this.elementRef.nativeElement.contains(target);
    // If the click was outside the host element, trigger the output event
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
  constructor() {}
}
