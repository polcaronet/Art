import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>🎨 Entrar</h1>
        <form (ngSubmit)="onSubmit()">
          <input
            type="email"
            placeholder="Digite seu email..."
            [(ngModel)]="email"
            name="email"
            required
            class="input"
          />
          <input
            type="password"
            placeholder="Digite sua senha..."
            [(ngModel)]="password"
            name="password"
            required
            class="input"
          />
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button type="submit" class="btn-submit" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Acessar' }}
          </button>
        </form>

        <div class="divider">
          <span>ou</span>
        </div>

        <button class="btn-google" (click)="onGoogleLogin()" [disabled]="loading()">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Entrar com Google
        </button>

        <p class="link">Área restrita ao administrador</p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 70vh;
      }
      .auth-card {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        width: 100%;
        max-width: 420px;
      }
      .auth-card h1 {
        text-align: center;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }
      .input {
        width: 100%;
        padding: 0.7rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 0.8rem;
        font-size: 1rem;
        background: var(--input-bg);
        color: var(--input-text);
      }
      .error {
        color: #f87171;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      .btn-submit {
        width: 100%;
        padding: 0.7rem;
        background: #18181b;
        color: white;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
      }
      .btn-submit:hover {
        background: #27272a;
      }
      .btn-submit:disabled {
        opacity: 0.6;
      }
      .link {
        text-align: center;
        margin-top: 1rem;
        color: var(--text-secondary);
      }
      .link a {
        color: var(--border-color);
      }
      .divider {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin: 1.2rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-color);
      }
      .btn-google {
        width: 100%;
        padding: 0.7rem;
        background: white;
        color: #333;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        transition: background 0.2s;
      }
      .btn-google:hover {
        background: #f5f5f5;
      }
      .btn-google:disabled {
        opacity: 0.6;
      }
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin']);
    } catch {
      this.error.set('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleLogin() {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/admin']);
    } catch {
      this.error.set('Erro ao entrar com Google.');
    } finally {
      this.loading.set(false);
    }
  }
}
