/**
 * Enterprise Grid Column Schema Specification
 * -----------------------------------------------------------------------------------
 * Defines the strict layout structural configuration blueprint for an individual table column cell.
 * Facilitates custom format handling, dynamic visibility, and localized internationalization tokens.
 */
export interface TableColumnConfig {
  /** The unique dynamic entity property path registry key mapping directly onto JSON payload streams */
  key: string;       
  
  /** The localized translation schema path token used to dynamically render column headers */
  label: string;     
  
  /** Optional structural toggle to activate state-driven sorting routines on this cell cluster */
  sortable?: boolean; 
  
  /** Optional layout variant rendering indicator used to map dynamic cells onto specialized factory templates */
  type?: 'text' | 'image' | 'currency' | 'badge' | 'actions'; 
  
  /** Optional localized legacy presentation toggle used to invoke dynamic financial rounding pipes */
  isCurrency?: boolean; 
}