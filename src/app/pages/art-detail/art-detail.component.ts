import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Art, ArtService } from '../../services/art.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-art-detail',
  standalone: true,
  template: `
    @if (art(); as a) {
      <div class="detail">
        <div class="images">
          @for (img of a.images; track img.name) {
            <img [src]="img.url" alt="Quadro" class="detail-img" />
          }
        </div>
        <div class="info">
          <h1>{{ a.name }}</h1>
          <p class="subtitle">Óleo sobre tela</p>
          <div class="meta">
            <div>
              <span class="label">Cidade</span>
              <strong>{{ a.city }}</strong>
            </div>
            <div>
              <span class="label">Ano</span>
              <strong>{{ a.year }}</strong>
            </div>
            <div>
              <span class="label">Medidas</span>
              <strong>{{ a.cm }} cm</strong>
            </div>
          </div>

          @if (a.type === 'sale') {
            @if (a.price) {
              <p class="price">R$ {{ a.price }}</p>
            }
            @if (a.status !== 'sold') {
              <button class="btn-cart" (click)="addToCart(a)">
                🛒 Adicionar ao Carrinho
              </button>
              @if (added()) {
                <p class="added-msg">Adicionado ao carrinho!</p>
              }
            } @else {
              <p class="sold-label">Vendido</p>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .detail { max-width: 900px; margin: 0 auto; }
    .images { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .detail-img {
      width: 100%;
      max-height: 550px;
      border-radius: 12px;
      object-fit: contain;
      background: rgba(0,0,0,0.2);
    }
    .info {
      background: var(--bg-secondary);
      padding: 2rem;
      border-radius: 12px;
    }
    .info h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1rem; }
    .meta {
      display: flex;
      gap: 2.5rem;
      margin-bottom: 1.5rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .label { display: block; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta strong { font-size: 1.05rem; }
    .price { font-size: 1.5rem; font-weight: 700; color: #22c55e; margin-bottom: 1rem; }
    .btn-cart {
      width: 100%;
      padding: 0.9rem;
      background: var(--border-color);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.05rem;
      transition: opacity 0.2s;
      border: none;
      cursor: pointer;
    }
    .btn-cart:hover { opacity: 0.85; }
    .added-msg { color: #4ade80; text-align: center; margin-top: 0.5rem; font-size: 0.9rem; }
    .sold-label { color: var(--accent); font-weight: 700; font-size: 1.2rem; text-align: center; padding: 0.8rem; background: rgba(239,68,68,0.1); border-radius: 8px; }
  `],
})
export class ArtDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private artService = inject(ArtService);
  private cart = inject(CartService);
  private auth = inject(AuthService);

  art = signal<Art | null>(null);
  added = signal(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }
    const art = await this.artService.getById(id);
    if (!art) { this.router.navigate(['/']); return; }
    this.art.set(art);
  }

  addToCart(art: Art) {
    this.cart.add({
      artId: art.id,
      artName: art.name,
      artImage: art.images[0]?.url || '',
      price: art.price || '0',
    }, this.auth.user()?.uid);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
