import {ChangeDetectionStrategy, Component, inject, input, OnInit,computed,effect,DestroyRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductsService } from '../../services/products.service';
import { DynamicFormPageComponent } from '../../../../shared/components/dynamic-form-dialog/dynamic-form-dialog.component';
import { DynamicDialogConfig, FormFieldConfig } from '../../../../shared/models/form.model';
import { Product } from '../../models/product';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Enterprise Product Form Context Orchestrator
 * -----------------------------------------------------------------------------------
 * Provides a unified smart container for both entity creation and update workflows.
 * Coordinates dynamic form schema derivation and state-driven hydration.
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
  /** Lifecycle management for RxJS streams to prevent memory leaks in OnPush components */
  private destroyRef = inject(DestroyRef); 

  /** Input signal capturing the entity ID from the route path registry */
  id = input<string | null>(null);

  /**
   * Reactive effect to trigger data fetching cycles automatically when the ID signal updates.
   */
  constructor() {
    effect(() => {
      const productId = this.id();
      if (productId) {
        this.productsService.loadSingleProduct(productId);
      }
    });
  }

  /**
   * Selector providing a streamlined lookup for the current entity instance.
   */
  protected currentProduct = computed<Product | undefined>(() => {
    const productId = this.id();
    return this.productsService.getProductById(productId);
  });

  /**
   * Computed Schema Registry
   * -----------------------------------------------------------------------------------
   * Derives structural configuration arrays reactively from the service's category dictionary.
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
      { key: 'image3', label: 'IMAGE 3', type: 'text', colSpan: 'col-12' },
      { key: 'thumbnail', label: 'PRODUCT.FIELDS.THUMBNAIL', type: 'text', colSpan: 'col-12', validators: [Validators.required] }
    ];
  });

  /**
   * Page Configuration Factory
   * -----------------------------------------------------------------------------------
   * Evaluates the application mode (Create vs Edit) and performs payload re-hydration logic.
   */
  protected pageConfig = computed<DynamicDialogConfig | null>(() => {

    const productId = this.id();
    const schema = this.productSchema();

    /** CREATE MODE: Render pristine configuration boundaries */
    if (!productId) {
      return {
        title: 'CREATE PRODUCT',
        subtitle: 'Add new product',
        saveButtonText: 'CREATE',
        fields: schema
      };
    }

    /** EDIT MODE: Hydrate existing product data into flattened structure */
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
    this.productsService.loadCategories();
  }

  /**
   * Mutation Handler
   * -----------------------------------------------------------------------------------
   * Dispatches persistence requests and navigates the user upon successful stream resolution.
   * Utilizes takeUntilDestroyed to ensure stream integrity during lifecycle termination.
   */
  protected onFormSubmit(formData: Record<string, any>): void {
    const productId = this.id();
    const { image1, image2, image3, ...clean } = formData;

    clean['images'] = [image1, image2, image3].filter(Boolean);

    if (productId) {
      // Edit mutation: Synchronize update stream with router progression
      this.productsService.updateProduct(+productId, clean)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/products']);
          }
        });
    } else {
      // Create mutation: Dispatch and redirect upon successful persistence confirmation
      this.productsService.addProduct(clean)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigate(['/products']);
          }
        });
    }
  }
}