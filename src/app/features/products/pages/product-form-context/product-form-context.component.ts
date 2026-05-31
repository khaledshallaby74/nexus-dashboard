import { ChangeDetectionStrategy, Component, inject, input, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { DynamicFormPageComponent } from '../../../../shared/components/dynamic-form-dialog/dynamic-form-dialog.component';
import { DynamicDialogConfig, FormFieldConfig } from '../../../../shared/models/form.model';
import { Product } from '../../models/product';

/**
 * Enterprise Product Form Context Orchestrator
 * -----------------------------------------------------------------------------------
 * Centralizes context determination workflows for both product creation and modification.
 * Dynamically resolves metadata schemas, flattens relational payloads, and routes actions
 * using highly optimized read-only reactive computed selectors.
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
  /** Injected state engine processing business operations for the catalog domain */
  private productsService = inject(ProductsService);
  
  /** Core angular framework platform routing system provider */
  private router = inject(Router);

  /** Programmatic route parameter context tracking the entity database primary key index */
  id = input<string | null>(null); 

  /**
   * Reactive Schema Factory Selector
   * ---------------------------------------------------------------------------------
   * Derives structural layout configurations dynamically based on stream updates 
   * arriving from lookup category option data repositories.
   */
  private productSchema = computed<FormFieldConfig[]>(() => {
    const availableCategories = this.productsService.categories();

    return [
      // Block Segment 1: Core Identification Metadata
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
      
      // Block Segment 2: Financial Matrix & Asset Constraints
      { key: 'price', label: 'PRODUCT.FIELDS.PRICE', type: 'number', colSpan: 'col-6', validators: [Validators.required] },
      { key: 'discountPercentage', label: 'PRODUCT.FIELDS.DISCOUNT', type: 'number', colSpan: 'col-6' },
      { key: 'stock', label: 'PRODUCT.FIELDS.STOCK', type: 'number', colSpan: 'col-6', validators: [Validators.required] },
      { key: 'sku', label: 'PRODUCT.FIELDS.SKU', type: 'text', colSpan: 'col-6', validators: [Validators.required] },

      // Block Segment 3: Logistics & Operational Directives
      { key: 'weight', label: 'PRODUCT.FIELDS.WEIGHT', type: 'number', colSpan: 'col-6' },
      { key: 'warrantyInformation', label: 'PRODUCT.FIELDS.WARRANTY', type: 'text', colSpan: 'col-6' },
      { key: 'shippingInformation', label: 'PRODUCT.FIELDS.SHIPPING', type: 'text', colSpan: 'col-12' },
      { key: 'returnPolicy', label: 'PRODUCT.FIELDS.RETURN_POLICY', type: 'text', colSpan: 'col-12' },
      
      // Block Segment 4: Descriptive Content Assets & Media URIs
      { key: 'description', label: 'PRODUCT.FIELDS.DESCRIPTION', type: 'textarea', colSpan: 'col-12', validators: [Validators.required] },
      { key: 'image1', label: 'PRODUCT.FIELDS.IMAGE_URL_1', type: 'text', colSpan: 'col-6' },
      { key: 'image2', label: 'PRODUCT.FIELDS.IMAGE_URL_2', type: 'text', colSpan: 'col-6' },
      { key: 'image3', label: 'PRODUCT.FIELDS.IMAGE_URL_3', type: 'text', colSpan: 'col-12' },
      { key: 'thumbnail', label: 'PRODUCT.FIELDS.THUMBNAIL', type: 'text', colSpan: 'col-12', validators: [Validators.required] }
    ];
  });

  /**
   * Context-Aware Configuration Selector Machine
   * ---------------------------------------------------------------------------------
   * Evaluates routing parameters to establish view intent (CREATE vs EDIT).
   * Automatically intercepts data targets, handles flat formatting mapping transformations,
   * and builds cohesive internationalization descriptors safely.
   */
  protected pageConfig = computed<DynamicDialogConfig | null>(() => {
    const productId = this.id();
    const schema = this.productSchema();

    if (productId) {
      // Intent Mutation Path: Re-hydrate schema parameters for EDIT processing operations
      const existingProduct = this.productsService.products().find(p => p.id === +productId);
      
      // Flatten asset array structures into atomic key pairs matching component controller bindings
      let flattenedData: Partial<Product> & Record<string, any> = { ...existingProduct };
      if (existingProduct?.images) {
        flattenedData['image1'] = existingProduct.images[0] || '';
        flattenedData['image2'] = existingProduct.images[1] || '';
        flattenedData['image3'] = existingProduct.images[2] || '';
      }

      return {
        title: 'PRODUCT.PAGES.EDIT_TITLE',
        subtitle: 'PRODUCT.PAGES.SUBTITLE_EDIT_INFO', 
        saveButtonText: 'PRODUCT.BUTTONS.UPDATE',
        fields: schema,
        initialData: flattenedData
      };
    } else {
      // Intent Mutation Path: Map flat pristine boundaries for CREATE processing operations
      return {
        title: 'PRODUCT.PAGES.CREATE_TITLE',
        subtitle: 'PRODUCT.PAGES.SUBTITLE_CREATE_INFO', 
        saveButtonText: 'PRODUCT.BUTTONS.CREATE',
        fields: schema
      };
    }
  });

  /**
   * Dispatches initial operations required to hydrate upstream lookups.
   */
  ngOnInit(): void {
    this.productsService.loadCategories();
  }

  /**
   * Intercepts valid dynamic outputs, maps asset inputs back into deep structures,
   * and routes execution workflows to proper domain engine channels.
   * @param formData Raw data mapping collected from form layout elements
   */
  protected onFormSubmit(formData: Record<string, any>): void {
    const productId = this.id();

    // Structural De-nesting: Un-flatten dynamic media rows back into unified collections arrays
    const { image1, image2, image3, ...cleanPayload } = formData;
    cleanPayload['images'] = [image1, image2, image3].filter(url => !!url);

    if (productId) {
      this.productsService.updateProduct(+productId, cleanPayload);
    } else {
      this.productsService.addProduct(cleanPayload);
    }

    // Direct layout traversal back to default management catalog tracking nodes
    this.router.navigate(['/products']);
  }
}