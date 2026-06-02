import { ChangeDetectionStrategy, Component, inject, input, output, OnInit, effect, ChangeDetectorRef} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig } from '../../models/form.model';
import { DropdownComponent } from '../dropdown/dropdown.component';

/**
 * Dynamic Reactive Form Orchestrator
 * -----------------------------------------------------------------------------------
 * A highly reusable, standalone component that renders forms based on provided 
 * schema configurations. Handles reactive form building, validation cycles, 
 * and data synchronization with OnPush change detection strategy.
 */
@Component({
  selector: 'app-dynamic-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DropdownComponent],
  templateUrl: './dynamic-form-dialog.component.html',
  styleUrl: './dynamic-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormPageComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  /** Configuration schema defining form fields, types, and validation rules */
  config = input.required<DynamicDialogConfig>();
  
  /** Output event stream for form submission payloads */
  submitForm = output<Record<string, any>>();

  /** Internal form group instance */
  form!: FormGroup;

  /**
   * Reactive synchronization layer.
   * Ensures form values are patched reactively whenever the external 
   * initialData configuration evolves.
   */
  constructor() {
    effect(() => {
      const cfg = this.config();

      if (this.form && cfg.initialData) {
        // Patch values without triggering infinite loop cycles
        this.form.patchValue(cfg.initialData, { emitEvent: false });
        // Force manual check to sync UI state in OnPush strategy
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Form Factory: Constructs the FormGroup structure based on the schema definition.
   */
  private buildForm(): void {
    const group: Record<string, any> = {};
    const cfg = this.config();

    cfg.fields.forEach(field => {
      group[field.key] = [
        cfg.initialData?.[field.key] || '',
        field.validators || []
      ];
    });

    this.form = this.fb.group(group);
  }

  /**
   * Bridge for custom components: Updates specific control state upon selection.
   * @param fieldKey Unique identifier of the target form field
   * @param value Selected value to be patched
   */
  protected onDropdownSelectionChange(fieldKey: string, value: any): void {
    const control = this.form.get(fieldKey);

    if (control) {
      control.setValue(value);
      control.markAsTouched();
      this.cdr.markForCheck();
    }
  }

  /**
   * Submission Handler: Validates the form state and emits data if pristine/valid.
   */
  protected onSubmit(): void {
    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
    } else {
      // Trigger validation feedback for all controls if submission attempt fails
      this.form.markAllAsTouched();
    }
  }

  /**
   * Navigation: Redirects the user back to the product catalog view.
   */
  protected onCancel(): void {
    this.router.navigate(['/products']);
  }
}