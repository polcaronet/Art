import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Art, ArtService } from '../../services/art.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <section class="search-bar">
      <input class="search-input" placeholder="Digite o nome do quadro..." [(ngModel)]="searchTerm" (input)="onSearch()" (keyup.enter)="onSearch()" />
      <button class="btn-search" (click)="onSearch()">Pesquisar</button>
    </section>

    <div class="theme-selector">
      <label>Tema:</label>
      <select [value]="themeService.theme()" (change)="onThemeChange($event)">
        <option value="default">Padrão (Azul)</option>
        <option value="dark">Escuro</option>
        <option value="warm">Quente</option>
        <option value="light">Claro</option>
      </select>
    </div>

    <div class="intro">
      <h1 class="fade-in">Façam um Tour pelas Obras do Artista 👇🏻</h1>
      <h2 class="fade-in delay">Aguardem novas publicações!</h2>
    </div>

    @if (mostViewed() || mostLiked()) {
      <section class="highlights">
        <h2 class="highlights-title">🏆 Destaques da Semana</h2>
        <div class="highlights-grid">
          @if (mostViewed(); as mv) {
            <a [routerLink]="['/art', mv.id]" class="highlight-card">
              <div class="highlight-badge">👁️ Mais Visto</div>
              <img [src]="mv.images[0]?.url" alt="Mais Visto" class="highlight-img" />
              <div class="highlight-body">
                <p class="highlight-name">{{ mv.name }}</p>
                <span class="highlight-stat">{{ mv.views || 0 }} visualizações</span>
              </div>
            </a>
          }
          @if (mostLiked(); as ml) {
            <a [routerLink]="['/art', ml.id]" class="highlight-card">
              <div class="highlight-badge liked">❤️ Mais Curtido</div>
              <img [src]="ml.images[0]?.url" alt="Mais Curtido" class="highlight-img" />
              <div class="highlight-body">
                <p class="highlight-name">{{ ml.name }}</p>
                <span class="highlight-stat">{{ ml.likes || 0 }} curtidas</span>
              </div>
            </a>
          }
        </div>
      </section>
    }

    <div class="grid">
      @for (art of arts(); track art.id) {
        <div class="card">
          <a [routerLink]="['/art', art.id]">
            <img [src]="art.images[0]?.url" alt="Quadro" class="card-img" loading="lazy" />
          </a>
          <div class="card-body">
            <p class="card-title">{{ art.name }}</p>
            <span class="card-info">{{ art.year }} | {{ art.cm }} cm</span>
            <span class="card-city">{{ art.city }}</span>
            <div class="card-stats">
              <button class="like-btn" [class.liked]="isLiked(art.id)" (click)="toggleLike(art)">
                <svg viewBox="0 0 24 24" width="18" height="18" [attr.fill]="isLiked(art.id) ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                <span>{{ art.likes || 0 }}</span>
              </button>
              <span class="views">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ art.views || 0 }}
              </span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-bar { display: flex; gap: 0.5rem; background: var(--bg-secondary); padding: 1rem; border-radius: 10px; max-width: 700px; margin: 0 auto 1.5rem; box-sizing: border-box; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .search-input { flex: 1; min-width: 0; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-text); font-size: 1rem; }
    .btn-search { background: var(--accent); color: white; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; white-space: nowrap; }
    .btn-search:hover { background: var(--accent-hover); }
    .theme-selector { display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; margin-bottom: 1rem; }
    .theme-selector label { font-weight: 500; }
    .theme-selector select { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-text); }
    .intro { text-align: center; margin: 2rem 0; }
    .intro h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
    .intro h2 { font-size: 1.2rem; color: var(--text-secondary); }
    .fade-in { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s ease forwards; }
    .fade-in.delay { animation-delay: 0.3s; }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: var(--bg-card); border-radius: 10px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover); }
    .card-img { width: 100%; aspect-ratio: 4/3; object-fit: contain; display: block; background: var(--img-bg); }
    .card-body { padding: 1rem; }
    .card-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary); }
    .card-info, .card-city { display: block; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
    .card-city { margin-top: 0.3rem; color: var(--border-color); }
    .card-stats { display: flex; align-items: center; gap: 1.2rem; margin-top: 0.8rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.06); }
    .like-btn { display: flex; align-items: center; gap: 0.3rem; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; transition: color 0.2s; padding: 0; }
    .like-btn:hover, .like-btn.liked { color: #ef4444; }
    .views { display: flex; align-items: center; gap: 0.3rem; color: var(--text-secondary); font-size: 0.85rem; }

    .highlights { margin-bottom: 2rem; }
    .highlights-title { text-align: center; font-size: 1.3rem; margin-bottom: 1rem; }
    .highlights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    .highlight-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; position: relative; transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); display: block; }
    .highlight-card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover); }
    .highlight-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; z-index: 2; }
    .highlight-badge.liked { background: #ef4444; }
    .highlight-img { width: 100%; aspect-ratio: 4/3; object-fit: contain; display: block; background: var(--img-bg); }
    .highlight-body { padding: 1rem; }
    .highlight-name { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.3rem; color: var(--text-primary); }
    .highlight-stat { color: var(--text-secondary); font-size: 0.85rem; }

    @media (max-width: 600px) {
      .search-bar { flex-direction: column; }
      .btn-search { width: 100%; padding: 0.7rem; }
      .grid { grid-template-columns: 1fr; }
      .intro h1 { font-size: 1.3rem; }
      .intro h2 { font-size: 1rem; }
      .theme-selector { justify-content: center; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private artService = inject(ArtService);
  private auth = inject(AuthService);
  themeService = inject(ThemeService);

  arts = signal<Art[]>([]);
  likedIds = signal<string[]>([]);
  searchTerm = '';
  private searchTimeout: any;

  mostViewed = computed(() => {
    const sorted = [...this.arts()].sort((a, b) => (b.views || 0) - (a.views || 0));
    return sorted.length > 0 && (sorted[0].views || 0) > 0 ? sorted[0] : null;
  });

  mostLiked = computed(() => {
    const sorted = [...this.arts()].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return sorted.length > 0 && (sorted[0].likes || 0) > 0 ? sorted[0] : null;
  });

  ngOnInit() {
    this.themeService.init();
    this.loadArts();
  }

  async loadArts() {
    const allArts = await this.artService.getShowcase();
    this.arts.set(allArts);
    const uid = this.auth.user()?.uid;
    if (uid) {
      const ids: string[] = [];
      for (const art of allArts) {
        const liked = await this.artService.hasLiked(art.id, uid);
        if (liked) ids.push(art.id);
      }
      this.likedIds.set(ids);
    }
  }

  isLiked(artId: string): boolean {
    return this.likedIds().includes(artId);
  }

  async toggleLike(art: Art) {
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    const liked = await this.artService.toggleLike(art.id, uid);
    if (liked) {
      this.likedIds.update((ids) => [...ids, art.id]);
      art.likes = (art.likes || 0) + 1;
    } else {
      this.likedIds.update((ids) => ids.filter((id) => id !== art.id));
      art.likes = (art.likes || 1) - 1;
    }
    this.arts.update((list) => [...list]);
  }

  async onSearch() {
    clearTimeout(this.searchTimeout);
    if (!this.searchTerm.trim()) { await this.loadArts(); return; }
    this.searchTimeout = setTimeout(async () => {
      this.arts.set(await this.artService.search(this.searchTerm));
    }, 300);
  }

  onThemeChange(event: Event) {
    const theme = (event.target as HTMLSelectElement).value as Theme;
    this.themeService.setTheme(theme);
  }
}
