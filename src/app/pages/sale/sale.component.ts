import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Art, ArtService } from '../../services/art.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [RouterLink, BrlPipe],
  template: `
    <div class="intro">
      <h1 class="fade-in">Quadros à Venda 🎨</h1>
      <h2 class="fade-in delay">Adquira uma obra original do artista</h2>
    </div>

    <div class="grid">
      @for (art of arts(); track art.id) {
        <div class="card">
          <a [routerLink]="['/art', art.id]">
            <img [src]="art.images[0]?.url" alt="Quadro" class="card-img" loading="lazy" />
          </a>
          <span class="badge" [class]="getBadgeClass(art)">{{ getBadgeLabel(art) }}</span>
          @if (art.price) {
            <span class="price-tag">{{ art.price | brl }}</span>
          }
          <div class="card-body">
            <p class="card-title">{{ art.name }}</p>
            <span class="card-info">{{ art.year }} | {{ art.cm }} cm</span>
            <span class="card-city">{{ art.city }}</span>
            @if (getBadgeLabel(art) !== 'Vendido' && auth.isLoggedIn()) {
              <button class="btn-cart" (click)="addToCart(art)">
                {{ addedId === art.id ? '✓ Adicionado' : '🛒 Adicionar' }}
              </button>
            }
          </div>
        </div>
      }
    </div>

    @if (arts().length === 0) {
      <p class="empty">Nenhum quadro à venda no momento.</p>
    }
  `,
  styles: [`
    .intro { text-align: center; margin: 2rem 0; }
    .intro h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
    .intro h2 { font-size: 1.2rem; color: var(--text-secondary); }
    .fade-in { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s ease forwards; }
    .fade-in.delay { animation-delay: 0.3s; }
    @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: var(--bg-card); border-radius: 10px; overflow: hidden; position: relative; transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover); }
    .card-img { width: 100%; aspect-ratio: 4/3; object-fit: contain; display: block; background: var(--img-bg); }
    .badge { position: absolute; top: 12px; left: 12px; padding: 0.25rem 0.7rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem; color: white; }
    .badge-available { background: #22c55e; }
    .badge-order { background: #f59e0b; }
    .badge-sold { background: #ef4444; }
    .price-tag { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 0.25rem 0.7rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
    .card-body { padding: 1rem; }
    .card-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; }
    .card-info, .card-city { display: block; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
    .card-city { margin-top: 0.3rem; }
    .btn-cart { margin-top: 0.8rem; background: var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; width: 100%; border: none; cursor: pointer; }
    .btn-cart:hover { opacity: 0.85; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; font-size: 1.1rem; }

    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
      .intro h1 { font-size: 1.3rem; }
      .intro h2 { font-size: 1rem; }
    }
  `],
})
export class SaleComponent implements OnInit {
  private artService = inject(ArtService);
  private router = inject(Router);
  cart = inject(CartService);
  auth = inject(AuthService);
  arts = signal<Art[]>([]);

  async ngOnInit() {
    this.arts.set(await this.artService.getForSale());
  }

  getBadgeClass(art: Art): string {
    const label = this.getBadgeLabel(art);
    if (label === 'Vendido') return 'badge badge-sold';
    if (label === 'Encomenda') return 'badge badge-order';
    return 'badge badge-available';
  }

  getBadgeLabel(art: Art): string {
    if (art.status === 'sold') return 'Vendido';
    if (art.status === 'order') return 'Encomenda';
    if (art.status === 'available') return 'Disponível';
    return 'Disponível';
  }

  addedId = '';

  addToCart(art: Art) {
    const price = art.price ? String(art.price) : '0';
    this.cart.add({
      artId: art.id,
      artName: art.name,
      artImage: art.images[0]?.url || '',
      price,
    }, this.auth.user()?.uid);
    this.router.navigate(['/cart'], { queryParams: { payment: true } });
  }
}
