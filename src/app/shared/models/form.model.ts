import { ValidatorFn } from '@angular/forms';

/** Supported core data primitives designated for structural form control generation factories */
export type FieldType = 'text' | 'number' | 'textarea' | 'select';

/**
 * Enterprise Dynamic Control Structure Definition
 * -----------------------------------------------------------------------------------
 * Acts as the strict blueprint layout contract for orchestrating a single reactive form node.
 * Integrates layout grid span controls alongside context-aware selection criteria matrices.
 */
export interface FormFieldConfig {
  /** The unique key signature matching the destination property key required by API payload schemas */
  key: string;
  
  /** The localized internationalization key token designated for upper layout label elements */
  label: string;
  
  /** The designated control element variant format to construct at runtime initialization */
  type: FieldType;
  
  /** Optional micro-copy illustrative text applied inside empty input boundaries */
  placeholder?: string;
  
  /** Optional synchronous rule validation array stack tracking real-time status validities */
  validators?: ValidatorFn[];
  
  /** Optional continuous lookup dataset collection powering contextual selection elements (Select/Dropdowns) */
  options?: { label: string; value: any }[];
  
  /** Optional responsive layout grid column spanning weight parameter class definitions (e.g., 'col-12', 'col-md-6') */
  colSpan?: string; 
}

/**
 * Modern Orchestrated Dynamic Dialog Configuration Surface
 * -----------------------------------------------------------------------------------
 * Outlines the high-level structural parameters driving dynamic portal creation boundaries.
 * Coordinates master textual header tags, subheadings, fields arrays, and initial modification states.
 */
export interface DynamicDialogConfig {
  /** Primary internationalized layout header phrase string */
  title: string;
  
  /** Optional dynamic layout contextual description sub-header token */
  subtitle?: string; 
  
  /** Explicit contextual validation save button completion text path */
  saveButtonText: string;
  
  /** Array blueprint loop stack defining the structural interactive input layout nodes */
  fields: FormFieldConfig[];
  
  /** Optional model payload context object map applied to re-hydrate dynamic control structures on edit states */
  initialData?: Record<string, any>;
}