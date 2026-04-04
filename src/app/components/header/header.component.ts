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
          <a routerLink="/">Início</a>
          <a routerLink="/sale">À Venda</a>

          @if (!auth.loading()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin">Admin</a>
              <a routerLink="/profile">Perfil</a>
              <button class="btn-logout" (click)="auth.logout()">Sair</button>
            } @else if (auth.isCustomer()) {
              <a routerLink="/cart" class="cart-link">
                🛒
                @if (cart.count() > 0) {
                  <span class="cart-badge">{{ cart.count() }}</span>
                }
              </a>
              <a routerLink="/orders">Pedidos</a>
              <button class="btn-logout" (click)="auth.logout()">Sair</button>
            } @else {
              <a routerLink="/register">Cadastrar</a>
              <a routerLink="/login">Admin</a>
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
      height: 60px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.06);
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
    .logo-img { height: 40px; width: auto; }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    .nav-links a {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.9rem;
      transition: color 0.2s;
      opacity: 0.8;
    }
    .nav-links a:hover {
      color: var(--text-primary);
      opacity: 1;
    }
    .btn-logout {
      background: var(--accent);
      color: white;
      padding: 0.35rem 0.9rem;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .btn-logout:hover { background: var(--accent-hover); }
    .cart-link {
      position: relative;
      font-size: 1.1rem;
      opacity: 1;
    }
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: var(--accent);
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 600px) {
      .nav-links { gap: 0.8rem; }
      .nav-links a { font-size: 0.8rem; }
      .btn-logout { font-size: 0.8rem; padding: 0.3rem 0.7rem; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}
