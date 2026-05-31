import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { NavGroup } from '../../models/nav-item.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, TranslateModule],
  standalone:true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  // Injecting LayoutService to handle collapse/expand states across the app
  layoutService = inject(LayoutService);
  /** 
   * Centralized Navigation Configuration
   * Groups are used to categorize links for better information architecture
   */
  readonly menuGroups: NavGroup[] = [
    {
      groupName: 'SIDEBAR.GROUPS.MAIN', 
      items: [
        { label: 'SIDEBAR.LABELS.DASHBOARD', icon: 'ic-dashboard', route: '/dashboard' },
        { label: 'SIDEBAR.LABELS.PRODUCTS', icon: 'ic-products', route: 'products' },
        { label: 'SIDEBAR.LABELS.CATEGORIES', icon: 'ic-categories', route: '/categories' },
        { label: 'SIDEBAR.LABELS.ORDERS', icon: 'ic-orders', route: '/orders' },
        { label: 'SIDEBAR.LABELS.CUSTOMERS', icon: 'ic-customers', route: '/customers' }
      ]
    },
    {
      groupName: 'SIDEBAR.GROUPS.ACCOUNT',
      items: [
        { label: 'SIDEBAR.LABELS.PROFILE', icon: 'ic-profile', route: '/profile' },
        { label: 'SIDEBAR.LABELS.SETTINGS', icon: 'ic-settings', route: '/settings' }
      ]
    }
  ];
}
