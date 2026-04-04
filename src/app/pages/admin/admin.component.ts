import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Art, ArtService } from '../../services/art.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-header">
      <a routerLink="/admin" class="tab active">Dashboard</a>
      <a routerLink="/admin/upload" class="tab">Upload</a>
      <a routerLink="/admin/orders" class="tab">Pedidos</a>
    </div>

    <div class="grid">
      @for (art of arts(); track art.id) {
        <div class="card">
          <button class="btn-delete" (click)="onDelete(art)" title="Excluir">
            🗑️
          </button>
          <img [src]="art.images[0]?.url" alt="Quadro" class="card-img" />
          <div class="card-body">
            <p class="card-title">{{ art.name }}</p>
            <span>{{ art.cm }} cm</span>
            <span>{{ art.city }}</span>
          </div>
        </div>
      }
    </div>

    @if (arts().length === 0) {
      <p class="empty">Nenhum quadro cadastrado ainda.</p>
    }
  `,
  styles: [
    `
      .admin-header {
        display: flex;
        gap: 0.5rem;
        background: var(--accent);
        padding: 0.6rem 1rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
      }
      .tab {
        color: white;
        font-weight: 600;
        padding: 0.4rem 1rem;
        border-radius: 6px;
      }
      .tab.active,
      .tab:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .card {
        background: var(--bg-card);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }
      .btn-delete {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 2;
        transition: transform 0.2s;
      }
      .btn-delete:hover {
        transform: scale(1.2);
      }
      .card-img {
        width: 100%;
        height: 280px;
        object-fit: cover;
      }
      .card-body {
        padding: 0.8rem;
      }
      .card-body span {
        display: block;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      .card-title {
        font-weight: 700;
        margin-bottom: 0.3rem;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary);
        margin-top: 3rem;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  private artService = inject(ArtService);
  private auth = inject(AuthService);

  arts = signal<Art[]>([]);

  async ngOnInit() {
    await this.loadArts();
  }

  async loadArts() {
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    this.arts.set(await this.artService.getByUser(uid));
  }

  async onDelete(art: Art) {
    if (!confirm(`Excluir "${art.name}"?`)) return;
    await this.artService.delete(art);
    this.arts.update((list) => list.filter((a) => a.id !== art.id));
  }
}
