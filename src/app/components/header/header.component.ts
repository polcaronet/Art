import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
          @if (!auth.loading() && auth.isAdmin()) {
            <a routerLink="/admin">Admin</a>
            <a routerLink="/profile">Perfil</a>
            <button class="btn-logout" (click)="auth.logout()">Sair</button>
          } @else if (!auth.loading() && !auth.isAdmin()) {
            <a routerLink="/login" class="btn-login">Admin</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        background: var(--header-bg);
        padding: 0 1rem;
        height: 60px;
        display: flex;
        align-items: center;
      }
      .header-inner {
        max-width: 1080px;
        margin: 0 auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .logo {
        display: flex;
        align-items: center;
      }
      .logo-img {
        height: 40px;
        width: auto;
        background: transparent;
      }
      .nav-links {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .nav-links a {
        color: var(--text-secondary);
        font-weight: 500;
        transition: color 0.2s;
      }
      .nav-links a:hover {
        color: var(--text-primary);
      }
      .btn-login {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.4rem 1rem;
        border-radius: 6px;
      }
      .btn-logout {
        background: var(--accent);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.9rem;
      }
      .btn-logout:hover {
        background: var(--accent-hover);
      }
    `,
  ],
})
export class HeaderComponent {
  auth = inject(AuthService);
}
