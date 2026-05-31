import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig } from '../../models/form.model';
import { DropdownComponent } from '../dropdown/dropdown.component';

/**
 * Enterprise Dynamic Form View Orchestrator Component
 * -----------------------------------------------------------------------------------
 * Automatically constructs and renders a context-aware Reactive Form structure 
 * bound dynamically via external declaration metadata inputs.
 * Integrates programmatic control state synchronization tailored for custom presentation components.
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
  /** Injected reactive form creation toolkit provider */
  private fb = inject(FormBuilder);
  
  /** Core routing engine utilized for system viewport layout traversal tracking */
  private router = inject(Router);

  /** Structural dynamic metadata blueprints defining the complete target form architecture boundary */
  config = input.required<DynamicDialogConfig>();
  
  /** Broadcasts the clean, normalized payload object map upstream once the form matrix satisfies validations */
  submitForm = output<Record<string, any>>(); 

  /** The master control container coordinating localized dynamic sub-elements */
  form!: FormGroup;

  /**
   * Synchronous hook initializing view composition lifecycles.
   * Mandates the conversion of static configurations into reactive node schemas.
   */
  ngOnInit(): void {
    this.buildForm();
  }

  /**
   * Translates incoming field metadata configurations array into an active, 
   * strongly-tracked programmatic Angular FormGroup context tree layout.
   */
  private buildForm(): void {
    const group: Record<string, any> = {};
    const currentConfig = this.config();

    currentConfig.fields.forEach(field => {
      // Defensive fallback evaluation parsing pre-existing initial payload entities versus empty creation constraints
      const initialValue = currentConfig.initialData ? currentConfig.initialData[field.key] : '';
      group[field.key] = [initialValue, field.validators || []];
    });

    this.form = this.fb.group(group);
  }

  /**
   * Senior Integration Strategy: Manual Control Update Gate
   * ---------------------------------------------------------------------------------
   * Synchronizes external decoupled select selections straight into the baseline dynamic control loop.
   * Manually dispatches value assignments and touches validation triggers to safeguard state data fidelity.
   * * @param fieldKey Unique signature index key targeting the explicit Form Control node reference
   * @param value The active domain entity option value emitted from the custom dropdown element
   */
  protected onDropdownSelectionChange(fieldKey: string, value: any): void {
    const control = this.form.get(fieldKey);
    if (control) {
      control.setValue(value);
      control.markAsTouched(); // Instantly trips pristine states to force presentation rendering evaluation updates
    }
  }

  /**
   * Asserts logical validation states upon submission requests before emitting execution streams.
   */
  protected onSubmit(): void {
    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
    } else {
      // Defensive feedback tactic: Expose invalid layout regions instantly to global UI layers
      this.form.markAllAsTouched();
    }
  }

  /**
   * Rejects outstanding UI criteria changes and routes view containers back to the primary domain indexes.
   */
  protected onCancel(): void {
    this.router.navigate(['/products']);
  }
}