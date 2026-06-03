import { ChangeDetectionStrategy, Component, inject, input, OnInit, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CategoriesService } from '../../services/categories.service';
import { DynamicFormPageComponent } from '../../../../shared/components/dynamic-form-dialog/dynamic-form-dialog.component';
import { DynamicDialogConfig, FormFieldConfig } from '../../../../shared/models/form.model';
import { Category } from '../../models/category.model';

/**
 * Enterprise Category Form Context Orchestrator
 * -----------------------------------------------------------------------------------
 * Acts as the Smart Container managing the lifecycle of taxonomy persistence.
 * 1. Mode Detection: Switches between Create/Edit modes based on route slug.
 * 2. Data Hydration: Maps category entities into normalized dynamic form schemas.
 * 3. Mutation Orchestration: Processes payload dispatching and routing resolutions.
 */
@Component({
  selector: 'app-category-form-context',
  standalone: true,
  imports: [CommonModule, DynamicFormPageComponent],
  templateUrl: './category-form-context.component.html',
  styleUrl: './category-form-context.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFormContextComponent implements OnInit {
  
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);
  /** Anchor for declarative stream cleanup to prevent memory leakage */
  private destroyRef = inject(DestroyRef); 

  /** Route-injected slug identifier: Null denotes creation mode, otherwise update mode */
  slug = input<string | null>(null);

  /** * Streamlined lookup for the target category instance 
   * derived from the centralized state signal. 
   */
  protected currentCategory = computed<Category | undefined>(() => {
      const categorySlug = this.slug();
      return this.categoriesService.getCategoryBySlug(categorySlug);
   });

  ngOnInit(): void {
    const categorySlug = this.slug();
    const hasNoData = this.categoriesService.isStateEmpty();

    // Hydrate state if missing (e.g., on direct URL access/refresh)
    if (categorySlug && hasNoData) {
      this.categoriesService.loadCategories()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  /**
   * Schema Definition Factory:
   * Maps taxonomy domain requirements to dynamic form field descriptors.
   */
  private categorySchema = computed<FormFieldConfig[]>(() => {
    return [
      { key: 'name', label: 'CATEGORY.FIELDS.NAME', type: 'text', colSpan: 'col-12', validators: [Validators.required] },
      { key: 'slug', label: 'CATEGORY.FIELDS.SLUG', type: 'text', colSpan: 'col-12', validators: [Validators.required] },
      { key: 'url', label: 'CATEGORY.FIELDS.URL', type: 'text', colSpan: 'col-12' }
    ];
  });

  /**
   * UI Configuration Generator:
   * Determines form presentation (Title, Buttons, Initial Data) based on context.
   */
  protected pageConfig = computed<DynamicDialogConfig | null>(() => {
    const categorySlug = this.slug();
    const schema = this.categorySchema();

    // Mode: Creation
    if (!categorySlug) {
      return {
        title: 'CATEGORY.PAGES.CREATE_TITLE',
        subtitle: 'CATEGORY.PAGES.SUBTITLE_CREATE_INFO',
        saveButtonText: 'CATEGORY.BUTTONS.CREATE',
        fields: schema
      };
    }

    // Mode: Update
    const category = this.currentCategory();
    if (!category) {
      return {
        title: 'COMMON.TABLE',
        subtitle: '',
        saveButtonText: 'CATEGORY.BUTTONS.UPDATE',
        fields: schema,
        initialData: {}
      };
    }

    return {
      title: 'CATEGORY.PAGES.EDIT_TITLE',
      subtitle: 'CATEGORY.PAGES.SUBTITLE_EDIT_INFO',
      saveButtonText: 'CATEGORY.BUTTONS.UPDATE',
      fields: schema,
      initialData: { ...category } // Direct pristine hydration mapping
    };
  });

  /**
   * Persistence Pipeline:
   * Evaluates operational mode and dispatches the mutation to the service layer.
   */
  protected onFormSubmit(formData: Record<string, any>): void {
    const categorySlug = this.slug();

    const operation$ = categorySlug 
      ? this.categoriesService.updateCategory(categorySlug, formData)
      : this.categoriesService.addCategory(formData);

    operation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/categories'])
      });
  }
}