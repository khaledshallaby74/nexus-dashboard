import { ChangeDetectionStrategy, Component, inject, input, OnInit, computed, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductsService } from '../../services/products.service';
import { DynamicFormPageComponent } from '../../../../shared/components/dynamic-form-dialog/dynamic-form-dialog.component';
import { DynamicDialogConfig, FormFieldConfig } from '../../../../shared/models/form.model';
import { Product } from '../../models/product';

/**
 * Enterprise Product Form Context Orchestrator
 * -----------------------------------------------------------------------------------
 * Acts as the Smart Container managing the lifecycle of Product persistence.
 * 1. Mode Detection: Switches between Create/Edit modes based on route ID.
 * 2. Data Hydration: Maps domain entities into normalized dynamic form schemas.
 * 3. Mutation Orchestration: Processes payload cleanup and persistence routing.
 */
@Component({
  selector: 'app-product-form-context',
  standalone: true,
  imports: [CommonModule, DynamicFormPageComponent],
  templateUrl: './product-form-context.component.html',
  styleUrl: './product-form-context.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormContextComponent implements OnInit {

  private productsService = inject(ProductsService);
  private router = inject(Router);
  /** Anchor for declarative stream cleanup to ensure no memory leakage */
  private destroyRef = inject(DestroyRef); 

  /** Route-injected identity key: Null denotes creation mode, otherwise update mode */
  id = input<string | null>(null);

  /**
   * Data Resolver Effect:
   * Reactively triggers entity hydration upon route navigation.
   * Ensures the local cache is populated before form initialization.
   */
  constructor() {
    effect(() => {
      const productId = this.id();
      if (productId) {
        this.productsService.loadSingleProduct(productId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    });
  }

  /** Current entity slice resolved from the centralized state store */
  protected currentProduct = computed<Product | undefined>(() => {
    const productId = this.id();
    return this.productsService.getProductById(productId);
  });

  /**
   * Schema Definition Factory:
   * Translates application domain requirements into dynamic form field descriptors.
   */
  private productSchema = computed<FormFieldConfig[]>(() => {
    const availableCategories = this.productsService.categories();

    return [
      { key: 'title', label: 'PRODUCT.FIELDS.TITLE', type: 'text', colSpan: 'col-12', validators: [Validators.required] },
      { key: 'brand', label: 'PRODUCT.FIELDS.BRAND', type: 'text', colSpan: 'col-6', validators: [Validators.required] },
      {
        key: 'category',
        label: 'PRODUCT.FIELDS.CATEGORY',
        type: 'select',
        colSpan: 'col-6',
        options: availableCategories,
        validators: [Validators.required]
      },
      { key: 'price', label: 'PRODUCT.FIELDS.PRICE', type: 'number', colSpan: 'col-6', validators: [Validators.required] },
      { key: 'discountPercentage', label: 'PRODUCT.FIELDS.DISCOUNT', type: 'number', colSpan: 'col-6' },
      { key: 'stock', label: 'PRODUCT.FIELDS.STOCK', type: 'number', colSpan: 'col-6', validators: [Validators.required] },
      { key: 'sku', label: 'PRODUCT.FIELDS.SKU', type: 'text', colSpan: 'col-6', validators: [Validators.required] },
      { key: 'weight', label: 'PRODUCT.FIELDS.WEIGHT', type: 'number', colSpan: 'col-6' },
      { key: 'warrantyInformation', label: 'PRODUCT.FIELDS.WARRANTY', type: 'text', colSpan: 'col-6' },
      { key: 'shippingInformation', label: 'PRODUCT.FIELDS.SHIPPING', type: 'text', colSpan: 'col-6' },
      { key: 'returnPolicy', label: 'PRODUCT.FIELDS.RETURN_POLICY', type: 'text', colSpan: 'col-6' },
      { key: 'description', label: 'PRODUCT.FIELDS.DESCRIPTION', type: 'textarea', colSpan: 'col-12', validators: [Validators.required] },
      { key: 'image1', label: 'IMAGE 1', type: 'text', colSpan: 'col-6' },
      { key: 'image2', label: 'IMAGE 2', type: 'text', colSpan: 'col-6' },
      { key: 'thumbnail', label: 'PRODUCT.FIELDS.THUMBNAIL', type: 'text', colSpan: 'col-12', validators: [Validators.required] }
    ];
  });

  /**
   * UI Configuration Generator:
   * Determines form presentation state (Title, Buttons, Initial Data) based on context.
   */
  protected pageConfig = computed<DynamicDialogConfig | null>(() => {
    const productId = this.id();
    const schema = this.productSchema();

    // Mode: Creation
    if (!productId) {
      return {
        title: 'CREATE PRODUCT',
        subtitle: 'Add new product',
        saveButtonText: 'CREATE',
        fields: schema
      };
    }

    // Mode: Update (Hydration Pending)
    const product = this.currentProduct();
    if (!product) {
      return {
        title: 'LOADING...',
        subtitle: '',
        saveButtonText: 'UPDATE',
        fields: schema,
        initialData: {}
      };
    }

    // Mode: Update (Active Hydration)
    const flattened = {
      ...product,
      image1: product.images?.[0] || '',
      image2: product.images?.[1] || '',
      image3: product.images?.[2] || ''
    };

    return {
      title: 'EDIT PRODUCT',
      subtitle: 'Update product data',
      saveButtonText: 'UPDATE',
      fields: schema,
      initialData: flattened
    };
  });

  ngOnInit(): void {
    // Ensures taxonomy list is available for form dropdown selection
    this.productsService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Persistence Pipeline:
   * Handles multi-part data formatting, service communication, and routing resolution.
   */
  protected onFormSubmit(formData: Record<string, any>): void {
    const productId = this.id();
    const { image1, image2, image3, ...clean } = formData;

    clean['images'] = [image1, image2, image3].filter(Boolean);

    // Branching logic: Dispatch mutation based on presence of entity ID
    const operation$ = productId 
      ? this.productsService.updateProduct(+productId, clean) 
      : this.productsService.addProduct(clean);

    operation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/products'])
      });
  }
}