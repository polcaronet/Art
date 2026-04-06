import { Component, inject, signal } from '@angular/core';
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

        <button class="hamburger" (click)="toggleMenu()">
          <span [class.open]="menuOpen()"></span>
          <span [class.open]="menuOpen()"></span>
          <span [class.open]="menuOpen()"></span>
        </button>

        <nav class="nav-links" [class.show]="menuOpen()">
          <a routerLink="/" class="nav-link" (click)="closeMenu()">Início</a>
          <a routerLink="/sale" class="nav-link" (click)="closeMenu()">À Venda</a>

          @if (!auth.loading()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="nav-link" (click)="closeMenu()">Admin</a>
              <a routerLink="/profile" class="nav-link" (click)="closeMenu()">Perfil</a>
              <span class="user-name">{{ auth.user()?.displayName }}</span>
              <button class="btn-action btn-logout" (click)="auth.logout(); closeMenu()">Sair</button>
            } @else if (auth.isCustomer()) {
              <a routerLink="/cart" class="nav-link cart-link" (click)="closeMenu()">
                🛒
                @if (cart.count() > 0) {
                  <span class="cart-badge">{{ cart.count() }}</span>
                }
              </a>
              <a routerLink="/orders" class="nav-link" (click)="closeMenu()">Pedidos</a>
              <span class="user-name">{{ auth.user()?.displayName }}</span>
              <button class="btn-action btn-logout" (click)="auth.logout(); closeMenu()">Sair</button>
            } @else {
              <a routerLink="/register" class="btn-action btn-register" (click)="closeMenu()">Entrar</a>
              <a routerLink="/login" class="btn-action btn-admin" (click)="closeMenu()">Admin</a>
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
      position: relative;
      z-index: 100;
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
    .btn-register { background: var(--border-color); color: white; }
    .btn-register:hover { opacity: 0.85; }
    .btn-admin { background: rgba(255,255,255,0.1); color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.15); }
    .btn-admin:hover { background: rgba(255,255,255,0.18); color: var(--text-primary); }
    .btn-logout { background: var(--accent); color: white; }
    .btn-logout:hover { background: var(--accent-hover); }
    .user-name { color: var(--border-color); font-size: 0.85rem; font-family: 'Georgia', 'Times New Roman', cursive; font-style: italic; }
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
    .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 0.5rem; flex-direction: column; gap: 5px; }
    .hamburger span { display: block; width: 24px; height: 2px; background: var(--text-primary); transition: all 0.3s; }
    .hamburger span.open:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none;
        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        background: var(--header-bg);
        flex-direction: column;
        padding: 1rem;
        gap: 0.3rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99;
      }
      .nav-links.show { display: flex; }
      .nav-link { width: 100%; text-align: center; padding: 0.7rem; }
      .btn-action { width: 100%; text-align: center; }
      .user-name { text-align: center; padding: 0.3rem 0; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  menuOpen = signal(false);

  toggleMenu() { this.menuOpen.update((v) => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
