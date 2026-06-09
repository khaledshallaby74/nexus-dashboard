import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-order-detail',
  standalone:true,
  imports: [],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {}
