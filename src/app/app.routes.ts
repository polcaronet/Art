import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { customerGuard } from './guards/customer.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'sale',
    loadComponent: () =>
      import('./pages/sale/sale.component').then((m) => m.SaleComponent),
  },
  {
    path: 'art/:id',
    loadComponent: () =>
      import('./pages/art-detail/art-detail.component').then(
        (m) => m.ArtDetailComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'orders',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./pages/orders/orders.component').then(
        (m) => m.OrdersComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'admin/upload',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/upload/upload.component').then(
        (m) => m.UploadComponent
      ),
  },
  {
    path: 'admin/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/edit/edit.component').then(
        (m) => m.EditComponent
      ),
  },
  {
    path: 'admin/orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin/orders/admin-orders.component').then(
        (m) => m.AdminOrdersComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
