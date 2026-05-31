import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Product, ProductResponse } from '../models/product';
import { tap } from 'rxjs';
import { DropdownItem } from '../../../shared/models/dropdown.model';
import { TableColumnConfig } from '../../../shared/models/table.model';

/**
 * Enterprise Core Product State Machine Service
 * -----------------------------------------------------------------------------------
 * Centralizes global state management architectural patterns for the product catalog domain.
 * Governs active data streams, declarative layout configurations, dynamic server-side 
 * filtering parameters, and asynchronous caching operations utilizing Angular Signals and RxJS.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  /** Injected framework network module token driving core data mutations */
  private http = inject(HttpClient);
  
  /** Base microservice resource pathway endpoint suffix boundary */
  private endPoints = 'products';

  // --- Core State Encapsulation (Private Single Source of Truth) ---
  
  /** Dynamic localized database cache acting as the baseline source of truth */
  private productsState = signal<Product[]>([]);
  
  /** In-memory dictionary bucket caching raw string taxonomy categories from the backend */
  private categoriesState = signal<string[]>([]);
  
  // --- Public Read-Write Layout UI State Signals ---
  
  /** Toggles active master rendering blueprints between row-based sheets and structural matrices */
  viewMode = signal<'table' | 'cards'>('table'); 
  
  /** Grand total metric reflecting complete backend repository items availability weights */
  totalItems = signal<number>(0); 
  
  /** Paging capacity boundary specifying target record row limit slices per page initialization */
  limitState = signal<number>(10); 
  
  /** Progressive active sequence tracking structural index pages */
  currentPage = signal<number>(1); 

  /** Target matching query sequence string applied directly onto dynamic criteria bounds */
  searchQuery = signal<string>('');
  
  /** Active selection filter criteria isolating context representations */
  selectedCategory = signal<string>('');

  /** Automatically derives index offset calculation matrices reactively upon page or limit modifications */
  skipState = computed(() => (this.currentPage() - 1) * this.limitState()); 

  // --- Public Read-Only Derived Selectors ---
  
  /** Exposed immutable projection stream driving downstream presentational interfaces safely */
  products = computed(() => this.productsState());

  /**
   * Senior Architectural Selector: Dynamic Selection Options Factory
   * ---------------------------------------------------------------------------------
   * Transforms raw structural category lookups into strongly-typed DropdownItem objects
   * while prepending neutral reset layout states to ensure interface binding safeties.
   */
  categories = computed<DropdownItem[]>(() => {
    const allOption: DropdownItem = { label: 'All Categories', value: 'All Categories' };
    
    const apiOptions = this.categoriesState().map(cat => ({
      label: this.capitalize(cat),
      value: cat 
    }));

    return [allOption, ...apiOptions];
  });

  /**
   * Synchronizes active reactive criteria states to hydrate or re-fetch catalog dataset streams.
   * Dynamically switches query routes between categories, text matches, and offset indices.
   */
  loadProducts(): void {
    let categoryPath = '';
    let apiEndPoint = this.endPoints;
    
    if (this.selectedCategory() && this.selectedCategory() !== 'All Categories') {
      categoryPath = `/category/${this.selectedCategory().toLowerCase()}`;
      apiEndPoint = `${this.endPoints}${categoryPath}`;
    }
    else if (this.searchQuery()) {
      apiEndPoint = `${this.endPoints}/search`;
    }
    
    const queryParams = `?limit=${this.limitState()}&skip=${this.skipState()}${this.searchQuery() ? '&q=' + this.searchQuery() : ''}`;
    const fullEndPoint = `${apiEndPoint}${queryParams}`;
    
    this.http.get<ProductResponse>(fullEndPoint).pipe(
      tap(res => {
        this.productsState.set(res.products);
        this.totalItems.set(res.total);
      })
    ).subscribe(); 
  }

  /**
   * Adjusts primary tracking index pages and fires subsequent endpoint synchronizations.
   * @param page Expected progressive tracking sequence token
   */
  onPageChange(page: number): void {
    this.currentPage.set(page); 
    this.loadProducts(); 
  }

  /**
   * Updates global structural presentation parameters.
   * @param mode Target layout rendering signature style
   */
  toggleViewMode(mode: 'table' | 'cards') {
    this.viewMode.set(mode);
  }

  /**
   * Hits database taxonomy lookup endpoints to ingest and cache available raw category models.
   */
  loadCategories(): void {
    this.http.get<string[]>(`${this.endPoints}/category-list`).pipe(
      tap(res => this.categoriesState.set(res)) 
    ).subscribe();
  }

  /**
   * Centralized filter modification gate.
   * Updates multiple criteria pointers simultaneously and resets pagination structures
   * defensively back to standard initial bounds to prevent index clipping boundary anomalies.
   * @param search Current input match target text
   * @param category Current selected context classification tag
   */
  updateFilters(search: string, category: string): void {
    this.searchQuery.set(search);
    this.selectedCategory.set(category);
    this.currentPage.set(1); 
    this.loadProducts();
  }

  /**
   * Functional string transformation utility mapping text into Title Case format variants.
   * @param str Raw string target
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Senior Structural Grid Blueprint Generator
   * ---------------------------------------------------------------------------------
   * Calculates a uniform layout column definition matrix driven by active cache updates.
   * Programmatically wires column names straight to internationalization JSON translation tokens.
   */
  tableColumnsConfig = computed<TableColumnConfig[]>(() => {
    const currentProducts = this.productsState();
    if (currentProducts.length === 0) return [];

    const orderedKeys = ['title', 'category', 'price', 'stock', 'edit', 'delete'];

    return orderedKeys.map(key => {
      let type: 'text' | 'badge' | 'actions' = 'text';
      let labelKey = `TABLE.HEADERS.${key.toUpperCase()}`;

      if (key === 'price' || key === 'stock') type = 'badge';
      if (key === 'edit' || key === 'delete') type = 'actions';

      return { 
        key, 
        label: labelKey, 
        type 
      };
    });
  });

  /**
   * Dispatches network creation requests to append new record entities onto servers.
   * Automatically updates in-memory array structures linearly to enforce responsive UI states.
   * @param productData Flat un-nested data model layout map harvested from presentation structures
   */
  addProduct(productData: Record<string, any>): void {
    const addEndPoint = `${this.endPoints}/add`;

    this.http.post<Product>(addEndPoint, productData).pipe(
      tap(newProduct => {
        // Enforce optimistic rendering behaviors by prepending newly declared entities upstream
        this.productsState.update(currentProducts => [newProduct, ...currentProducts]);
        this.totalItems.update(total => total + 1);
      })
    ).subscribe({
      next: () => console.log('Product Added Successfully to DummyJSON Cached State!'),
      error: (err) => console.error('Error adding product:', err)
    });
  }

  /**
   * Dispatches network adjustment mutations targeting specific historical database references.
   * Performs real-time row projection array swap-outs inside localized states to reflect updates instantly.
   * @param id Targeted primary key database index mapping the resource
   * @param productData Modified collection payload mapping delta adjustments
   */
  updateProduct(id: number, productData: Record<string, any>): void {
    this.http.put<Product>(`${this.endPoints}/${id}`, productData).pipe(
      tap(updatedProduct => {
        // Linearly scan active datasets and intercept matching key bounds to merge server-side confirmations
        this.productsState.update(currentProducts => 
          currentProducts.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
        );
      })
    ).subscribe();
  }
}