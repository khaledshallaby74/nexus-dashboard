import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';

export const routes: Routes = [
  {   
    path: '', 
    component: AdminLayoutComponent,
    children: [
      // شاشة عرض الجدول والكروت الحالية
      {
        path: 'products',
        loadComponent: () => 
          import('./features/products/pages/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
        title: 'NEXUS - Products Management'
      },
      
      // ➕ مسار إضافة منتج جديد (شاشة كاملة)
      {
        path: 'products/create',
        loadComponent: () => 
          import('./features/products/pages/product-form-context/product-form-context.component').then(
            (m) => m.ProductFormContextComponent
          ),
        title: 'NEXUS - Create Product'
      },

      // 🔄 مسار تعديل منتج قائم باستخدام الـ ID ديناميكياً (شاشة كاملة)
      {
        path: 'products/edit/:id',
        loadComponent: () => 
          import('./features/products/pages/product-form-context/product-form-context.component').then(
            (m) => m.ProductFormContextComponent
          ),
        title: 'NEXUS - Edit Product'
      }
    ]
  }
  ];
