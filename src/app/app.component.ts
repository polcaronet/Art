import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="container">
      <router-outlet />
    </main>
    <app-footer />

    <div class="support-fab" [class.open]="supportOpen()">
      <button class="fab-btn" (click)="supportOpen.set(!supportOpen())">
        @if (supportOpen()) { ✕ } @else { 💬 }
      </button>
      @if (supportOpen()) {
        <div class="fab-menu">
          <p class="fab-title">Fale Conosco</p>
          <a href="https://wa.me/5521996710902?text=Olá, vim pelo site Galeria Damião!" target="_blank" class="fab-contact">
            <span class="fab-icon">📱</span>
            <span>(21) 99671-0902</span>
          </a>
          <a href="https://wa.me/5521995735177?text=Olá, vim pelo site Galeria Damião!" target="_blank" class="fab-contact">
            <span class="fab-icon">📱</span>
            <span>(21) 99573-5177</span>
          </a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1rem;
        min-height: calc(100vh - 130px);
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .container > * {
        display: block;
        width: 100%;
      }
      .support-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
      .fab-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #25d366;
        color: white;
        font-size: 1.5rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fab-btn:hover { transform: scale(1.1); }
      .support-fab.open .fab-btn { background: var(--accent); }
      .fab-menu {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        min-width: 220px;
        order: -1;
      }
      .fab-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.8rem;
        color: var(--text-primary);
      }
      .fab-contact {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        color: var(--text-primary);
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.2s;
        text-decoration: none;
      }
      .fab-contact:hover { background: rgba(37,211,102,0.1); }
      .fab-icon { font-size: 1.1rem; }
    `,
  ],
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  supportOpen = signal(false);

  ngOnInit() {
    this.auth.loginAnonymous();
  }
}
