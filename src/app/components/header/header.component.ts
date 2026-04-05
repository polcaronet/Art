import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <div class="header-inner">
        <a routerLink="/" class="logo">
          <img src="/logo.svg" alt="Galeria Damião" class="logo-img" />
        </a>
        <nav class="nav-links">
          <a routerLink="/" class="nav-link">Início</a>
          <a routerLink="/sale" class="nav-link">À Venda</a>

          @if (!auth.loading()) {
            @if (auth.isAdmin()) {
              <span class="user-name">{{ auth.user()?.displayName }}</span>
              <a routerLink="/admin" class="nav-link">Admin</a>
              <a routerLink="/profile" class="nav-link">Perfil</a>
              <button class="btn-action btn-logout" (click)="auth.logout()">Sair</button>
            } @else if (auth.isCustomer()) {
              <span class="user-name">{{ auth.user()?.displayName }}</span>
              <a routerLink="/cart" class="nav-link cart-link">
                🛒
                @if (cart.count() > 0) {
                  <span class="cart-badge">{{ cart.count() }}</span>
                }
              </a>
              <a routerLink="/orders" class="nav-link">Pedidos</a>
              <button class="btn-action btn-logout" (click)="auth.logout()">Sair</button>
            } @else {
              <a routerLink="/register" class="btn-action btn-register">Entrar</a>
              <a routerLink="/login" class="btn-action btn-admin">Admin</a>
            }
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--header-bg);
      padding: 0 1.5rem;
      height: 80px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .header-inner {
      max-width: 1080px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo { display: flex; align-items: center; }
    .logo-img { height: 48px; width: auto; }
    .nav-links {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }
    .nav-link {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.88rem;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      transition: all 0.2s;
      position: relative;
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(255,255,255,0.1);
    }
    .btn-action {
      font-weight: 600;
      font-size: 0.85rem;
      padding: 0.45rem 1.1rem;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .btn-register {
      background: var(--border-color);
      color: white;
    }
    .btn-register:hover {
      opacity: 0.85;
    }
    .btn-admin {
      background: rgba(255,255,255,0.1);
      color: var(--text-secondary);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-admin:hover {
      background: rgba(255,255,255,0.18);
      color: var(--text-primary);
    }
    .btn-logout {
      background: var(--accent);
      color: white;
    }
    .btn-logout:hover { background: var(--accent-hover); }
    .user-name { color: var(--text-primary); font-weight: 500; font-size: 0.85rem; opacity: 0.8; }
    .cart-link { font-size: 1.1rem; }
    .cart-badge {
      position: absolute;
      top: 0;
      right: 2px;
      background: var(--accent);
      color: white;
      font-size: 0.55rem;
      font-weight: 700;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .header { padding: 0 0.8rem; }
      .nav-links { gap: 0.2rem; }
      .nav-link { font-size: 0.78rem; padding: 0.35rem 0.6rem; }
      .btn-action { font-size: 0.78rem; padding: 0.35rem 0.7rem; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
