import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <h1>Meu Perfil</h1>

        <div class="section">
          <h2>Editar Nome</h2>
          <form (ngSubmit)="onSaveName()">
            <input
              type="text"
              [(ngModel)]="displayName"
              name="displayName"
              class="input"
              placeholder="Seu nome..."
            />
            <button type="submit" class="btn" [disabled]="saving()">
              {{ saving() ? 'Salvando...' : 'Salvar Nome' }}
            </button>
          </form>
          @if (message()) {
            <p class="success">{{ message() }}</p>
          }
        </div>

        <div class="section">
          <h2>Tema da Página</h2>
          <div class="theme-options">
            <button
              class="theme-btn"
              [class.active]="themeService.theme() === 'default'"
              (click)="setTheme('default')"
            >
              🔵 Padrão
            </button>
            <button
              class="theme-btn"
              [class.active]="themeService.theme() === 'dark'"
              (click)="setTheme('dark')"
            >
              🌙 Escuro
            </button>
            <button
              class="theme-btn"
              [class.active]="themeService.theme() === 'warm'"
              (click)="setTheme('warm')"
            >
              🌅 Quente
            </button>
          </div>
        </div>

        <div class="section info">
          <p><span class="label">Email:</span> {{ auth.user()?.email }}</p>
          <p><span class="label">Tipo:</span> Administrador</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-page {
        display: flex;
        justify-content: center;
        padding-top: 2rem;
      }
      .profile-card {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
      }
      .profile-card h1 {
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
      }
      .section {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
      }
      .section h2 {
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
        color: var(--text-secondary);
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
      .btn {
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 0.6rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
      }
      .btn:hover {
        opacity: 0.85;
      }
      .success {
        color: #4ade80;
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }
      .theme-options {
        display: flex;
        gap: 0.8rem;
      }
      .theme-btn {
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        background: var(--bg-card);
        color: var(--text-primary);
        font-weight: 500;
        border: 2px solid transparent;
        transition: all 0.2s;
      }
      .theme-btn.active {
        border-color: var(--accent);
      }
      .theme-btn:hover {
        opacity: 0.85;
      }
      .info .label {
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  themeService = inject(ThemeService);

  displayName = '';
  saving = signal(false);
  message = signal('');

  ngOnInit() {
    this.displayName = this.auth.user()?.displayName || '';
  }

  async onSaveName() {
    this.saving.set(true);
    this.message.set('');
    try {
      await this.auth.updateUserProfile(this.displayName);
      this.message.set('Nome atualizado com sucesso!');
    } catch {
      this.message.set('Erro ao atualizar nome.');
    } finally {
      this.saving.set(false);
    }
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
