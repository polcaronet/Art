import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>📝 Criar Conta</h1>
        <form (ngSubmit)="onSubmit()">
          <input type="text" placeholder="Seu nome..." [(ngModel)]="name" name="name" required class="input" />
          <input type="email" placeholder="Seu email..." [(ngModel)]="email" name="email" required class="input" />
          <input type="password" placeholder="Sua senha..." [(ngModel)]="password" name="password" required class="input" />
          @if (error()) { <p class="error">{{ error() }}</p> }
          <button type="submit" class="btn-submit" [disabled]="loading()">
            {{ loading() ? 'Criando...' : 'Criar Conta' }}
          </button>
        </form>
        <p class="link">Já tem conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 70vh; }
    .auth-card { background: var(--bg-secondary); padding: 2rem; border-radius: 12px; width: 100%; max-width: 420px; }
    .auth-card h1 { text-align: center; margin-bottom: 1.5rem; font-size: 1.5rem; }
    .input { width: 100%; padding: 0.7rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 0.8rem; font-size: 1rem; background: var(--input-bg); color: var(--input-text); }
    .error { color: #f87171; font-size: 0.9rem; margin-bottom: 0.5rem; }
    .btn-submit { width: 100%; padding: 0.7rem; background: #18181b; color: white; border-radius: 8px; font-weight: 600; font-size: 1rem; }
    .btn-submit:hover { background: #27272a; }
    .btn-submit:disabled { opacity: 0.6; }
    .link { text-align: center; margin-top: 1rem; color: var(--text-secondary); }
    .link a { color: var(--border-color); }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    if (!this.name || !this.email || !this.password) {
      this.error.set('Preencha todos os campos.');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.register(this.name, this.email, this.password);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e?.message || 'Erro ao criar conta.');
    } finally {
      this.loading.set(false);
    }
  }
}
