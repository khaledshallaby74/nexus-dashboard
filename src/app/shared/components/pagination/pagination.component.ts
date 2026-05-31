import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

/**
 * Enterprise Pagination Control Component
 * -----------------------------------------------------------------------------------
 * Orchestrates tabular data pagination layouts using reactive Angular Signals.
 * Integrates an advanced sliding window truncation algorithm to comfortably render
 * complex page sets while safeguarding DOM performance boundaries.
 * Fully supports real-time bidirectional layout swapping (LTR/RTL).
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  /** Core translation utility engine injected to intercept global language mutations */
  private translate = inject(TranslateService);

  /** The global count of total available resource elements across the server context */
  totalItems = input.required<number>();
  
  /** The absolute size constraint limiting maximum records displayed per layout row context */
  pageSize = input<number>(10);
  
  /** The explicit 1-indexed active page state marking the current user viewing frame */
  currentPage = input<number>(1);

  /** Emits the target numeric page state back to parent orchestrators when valid changes occur */
  pageChange = output<number>();

  /** Computes the total aggregate page count ceilings required to drain the full data response pool */
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  
  /** Boolean state checking if a backward pagination step is valid */
  hasPrevious = computed(() => this.currentPage() > 1);
  
  /** Boolean state checking if a forward pagination step is valid */
  hasNext = computed(() => this.currentPage() < this.totalPages());

  /** * Diamond Tactic: Transforms the asynchronous multi-cast language emission stream 
   * into a synchronous, read-only reactive state value using Angular's RxJS Interop layer.
   */
  private currentLangSignal = toSignal(
    this.translate.onLangChange.pipe(map(event => event.lang)),
    { initialValue: this.translate.currentLang || 'en' }
  );

  /** * Diamond Tactic: Derived state machine determining if the active presentation view 
   * requires Right-to-Left (RTL) directional mapping configurations.
   */
  protected isRtl = computed(() => {
    const lang = this.currentLangSignal();
    return lang === 'ar'; // Expand with alternative RTL language keys as corporate scope scales
  });

  /** * Diamond Tactic: Resolves structural boundary icon designations for the preceding control trigger.
   * Alternates automatically to match mirrored spatial flow patterns when the viewport layout flips.
   */
  protected prevIconClass = computed(() => {
    return this.isRtl() ? 'ic-angle-right' : 'ic-angle-left';
  });

  /** * Diamond Tactic: Resolves structural boundary icon designations for the succeeding control trigger.
   * Alternates automatically to match mirrored spatial flow patterns when the viewport layout flips.
   */
  protected nextIconClass = computed(() => {
    return this.isRtl() ? 'ic-angle-left' : 'ic-angle-right';
  });

  /**
   * Senior Sliding Window Presentation Algorithm
   * ---------------------------------------------------------------------------------
   * Dynamically tracks active index regions to emit a balanced layout sequence array 
   * containing literal numeric indexes alongside structural separation ellipses markers ('...').
   * Prevents standard layout breakdown thresholds across expansive corporate datasets.
   */
  pagesArray = computed<(number | string)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    
    // Boundary config padding: Determines contiguous numeric sibling slots adjacent to the active page
    const siblings = 1; 

    // Frame Condition 0: Render linear sequence immediately if global page bounds reside beneath layout caps
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Isolate cross-sectional indexes wrapping the current runtime pointer coordinates
    const leftSiblingIndex = Math.max(current - siblings, 1);
    const rightSiblingIndex = Math.min(current + siblings, total);

    // Assert boolean flags determining left/right structural boundary truncation needs
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < total - 1;

    const firstPageIndex = 1;
    const lastPageIndex = total;

    // Layout Variation 1: Truncation boundary required exclusively on the trailing right flank
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblings;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', lastPageIndex];
    }

    // Layout Variation 2: Truncation boundary required exclusively on the leading left flank
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblings;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
      return [firstPageIndex, '...', ...rightRange];
    }
    
    // Layout Variation 3: Dual-flank truncation active; anchoring isolated floating window blocks centrally
    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return Array.from({ length: total }, (_, i) => i + 1);
  });

  /**
   * Evaluates input triggers and cleanly propagates valid numeric page adjustments up the chain.
   * Includes strong safety walls guarding inert structural components.
   * @param page Target element node value emitted via interactive markup elements
   */
  onPageSelect(page: number | string): void {
    // Defensive UX Guard: Intercept structural ellipses placeholder '...' hits to reject processing overhead
    if (typeof page === 'string') return;

    // Safety constraint: Validate mathematical bounds to guarantee payload integrity
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}