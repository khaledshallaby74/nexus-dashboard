import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar.component/navbar';
import { SidebarComponent } from '../components/sidebar.component/sidebar.component';
import { LoadingService } from '../../core/services/loading/loading.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone:true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, SpinnerComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  /**
   Exposed publicly to be bound directly within the HTML template expression.
   */
  loadingService = inject(LoadingService);
}
