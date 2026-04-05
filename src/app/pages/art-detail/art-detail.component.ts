import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Art, ArtService } from '../../services/art.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-art-detail',
  standalone: true,
  imports: [FormsModule, BrlPipe],
  template: `
    @if (art(); as a) {
      <div class="detail-wrapper">
      <div class="detail">
          @for (img of a.images; track img.name) {
            <img [src]="img.url" alt="Quadro" class="detail-img" />
          }
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
              <p class="price">{{ a.price | brl }}</p>
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
      </div>

      <!-- Comentários -->
      <div class="comments-section">
        <h3>💬 Comentários ({{ comments().length }})</h3>

        @if (!auth.isAnonymous()) {
          <div class="comment-form">
            <input class="comment-input" placeholder="Escreva um comentário..." [(ngModel)]="commentText" (keyup.enter)="submitComment()" />
            <button class="btn-comment" (click)="submitComment()" [disabled]="!commentText.trim()">Enviar</button>
          </div>
        } @else {
          <p class="login-hint">Faça login para comentar.</p>
        }

        <div class="comments-list">
          @for (c of comments(); track c.id) {
            <div class="comment">
              <div class="comment-header">
                <strong>{{ c.userName || 'Anônimo' }}</strong>
                <span class="comment-date">{{ formatDate(c.created) }}</span>
                @if (c.uid === auth.user()?.uid || auth.isAdmin()) {
                  <button class="btn-delete-comment" (click)="deleteComment(c.id)">✕</button>
                }
              </div>
              <p class="comment-text">{{ c.text }}</p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .detail { display: inline-block; background: var(--bg-card); border-radius: 12px; overflow: hidden; max-width: 100%; }
    .detail-wrapper { display: flex; justify-content: center; margin: 2rem 0; }
    .detail-img { display: block; max-width: 100%; max-height: 70vh; }
    .info { padding: 1.2rem 1.5rem; text-align: center; }
    .info h1 { font-size: 1.4rem; margin-bottom: 0.15rem; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-bottom: 0.8rem; font-size: 0.85rem; }
    .meta { display: flex; justify-content: center; gap: 2rem; }
    .meta div { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
    .label { color: var(--border-color); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta strong { font-size: 0.95rem; color: var(--text-primary); }
    .price { font-size: 1.5rem; font-weight: 700; color: #22c55e; margin-bottom: 1rem; }
    .btn-cart { width: 100%; padding: 0.9rem; background: var(--border-color); color: white; border-radius: 8px; font-weight: 600; font-size: 1.05rem; border: none; cursor: pointer; }
    .btn-cart:hover { opacity: 0.85; }
    .added-msg { color: #4ade80; text-align: center; margin-top: 0.5rem; font-size: 0.9rem; }
    .sold-label { color: var(--accent); font-weight: 700; font-size: 1.2rem; text-align: center; padding: 0.8rem; background: rgba(239,68,68,0.1); border-radius: 8px; }

    .comments-section { max-width: 650px; margin: 0 auto 2rem; background: var(--bg-card); border-radius: 12px; padding: 1.5rem; }
    .comments-section h3 { font-size: 1.1rem; margin-bottom: 1rem; text-align: center; }
    .comment-form { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; }
    .comment-input { flex: 1; padding: 0.7rem 1rem; border: none; border-radius: 20px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9rem; }
    .comment-input::placeholder { color: var(--text-secondary); opacity: 0.5; }
    .btn-comment { padding: 0.7rem 1.5rem; background: var(--border-color); color: white; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer; }
    .btn-comment:hover { opacity: 0.85; }
    .btn-comment:disabled { opacity: 0.3; }
    .login-hint { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; opacity: 0.7; }
    .comments-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .comment { background: var(--bg-secondary); padding: 0.8rem 1rem; border-radius: 8px; }
    .comment-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
    .comment-header strong { font-size: 0.85rem; }
    .comment-date { color: var(--text-secondary); font-size: 0.7rem; opacity: 0.6; }
    .btn-delete-comment { margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.75rem; opacity: 0.5; }
    .btn-delete-comment:hover { opacity: 1; color: var(--accent); }
    .comment-text { font-size: 0.9rem; line-height: 1.4; }
  `],
})
export class ArtDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private artService = inject(ArtService);
  private cart = inject(CartService);
  auth = inject(AuthService);

  art = signal<Art | null>(null);
  comments = signal<any[]>([]);
  added = signal(false);
  commentText = '';

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/']); return; }
    const art = await this.artService.getById(id);
    if (!art) { this.router.navigate(['/']); return; }
    this.art.set(art);
    this.artService.addView(id);
    this.comments.set(await this.artService.getComments(id));
  }

  addToCart(art: Art) {
    this.cart.add({
      artId: art.id,
      artName: art.name,
      artImage: art.images[0]?.url || '',
      price: art.price || '0',
    }, this.auth.user()?.uid);
    this.router.navigate(['/cart'], { queryParams: { payment: true } });
  }

  async submitComment() {
    const text = this.commentText.trim();
    if (!text) return;
    const user = this.auth.user();
    const artId = this.art()?.id;
    if (!user || !artId) return;
    await this.artService.addComment(artId, user.uid, user.displayName || 'Usuário', text);
    this.commentText = '';
    this.comments.set(await this.artService.getComments(artId));
  }

  async deleteComment(commentId: string) {
    const artId = this.art()?.id;
    if (!artId) return;
    await this.artService.deleteComment(artId, commentId);
    this.comments.update((list) => list.filter((c) => c.id !== commentId));
  }

  formatDate(created: any): string {
    if (!created) return '';
    const date = created.toDate ? created.toDate() : new Date(created);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
