import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Art, ArtService } from '../../services/art.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-art-detail',
  standalone: true,
  imports: [FormsModule, BrlPipe, RouterLink],
  template: `
    @if (art(); as a) {
      <div class="detail-wrapper">
      <a routerLink="/" class="btn-close" title="Voltar para Home">✕</a>
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
            <div class="comment-avatar">{{ getInitial() }}</div>
            <input class="comment-input" placeholder="Escreva um comentário..." [(ngModel)]="commentText" (keyup.enter)="submitComment()" />
            <button class="btn-comment" (click)="submitComment()" [disabled]="!commentText.trim()">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        } @else {
          <p class="login-hint">Faça login para comentar.</p>
        }

        @if (comments().length === 0) {
          <p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>
        }

        <div class="comments-list">
          @for (c of comments(); track c.id) {
            <div class="comment">
              <div class="comment-avatar-sm">{{ (c.userName || 'A').charAt(0) }}</div>
              <div class="comment-content">
                <div class="comment-header">
                  <strong>{{ c.userName || 'Anônimo' }}</strong>
                  <span class="comment-date">{{ formatDate(c.created) }}</span>
                </div>
                @if (editingId === c.id) {
                  <div class="edit-form">
                    <input class="edit-input" [(ngModel)]="editText" (keyup.enter)="saveEdit(c)" />
                    <button class="btn-save-edit" (click)="saveEdit(c)">✓</button>
                    <button class="btn-cancel-edit" (click)="editingId = ''">✕</button>
                  </div>
                } @else {
                  <p class="comment-text">{{ c.text }}</p>
                }
                @if (c.uid === auth.user()?.uid || auth.isAdmin()) {
                  <div class="comment-actions">
                    @if (c.uid === auth.user()?.uid && editingId !== c.id) {
                      <button class="btn-edit" (click)="startEdit(c)">Editar</button>
                    }
                    <button class="btn-delete-comment" (click)="deleteComment(c.id)">Excluir</button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .detail { display: inline-block; background: var(--bg-card); border-radius: 12px; overflow: hidden; max-width: 100%; }
    .detail-wrapper { display: flex; justify-content: center; margin: 2rem 0; position: relative; }
    .btn-close { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; background: rgba(0,0,0,0.6); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; z-index: 10; transition: all 0.2s; text-decoration: none; }
    .btn-close:hover { background: var(--accent); transform: scale(1.1); }
    .detail-img { display: block; max-width: 100%; max-height: 70vh; }
    .info { padding: 1.2rem 1.5rem; text-align: center; }
    .info h1 { font-size: 1.4rem; margin-bottom: 0.15rem; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-bottom: 0.8rem; font-size: 0.85rem; }
    .meta { display: flex; justify-content: center; gap: 2rem; }
    .meta div { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
    .label { color: var(--border-color); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta strong { font-size: 0.95rem; color: var(--text-primary); }
    .price { font-size: 1.5rem; font-weight: 700; color: #22c55e; margin-bottom: 1rem; }
    .btn-cart { width: 100%; padding: 0.9rem; background: var(--btn-primary); color: white; border-radius: 8px; font-weight: 600; font-size: 1.05rem; border: none; cursor: pointer; }
    .btn-cart:hover { background: var(--btn-primary-hover); }
    .added-msg { color: #4ade80; text-align: center; margin-top: 0.5rem; font-size: 0.9rem; }
    .sold-label { color: var(--accent); font-weight: 700; font-size: 1.2rem; text-align: center; padding: 0.8rem; background: rgba(239,68,68,0.1); border-radius: 8px; }

    .comments-section { max-width: 650px; margin: 0 auto 2rem; background: var(--bg-card); border-radius: 12px; padding: 1.5rem; }
    .comments-section h3 { font-size: 1.1rem; margin-bottom: 1rem; text-align: center; }
    .comment-form { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; align-items: center; }
    .comment-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--border-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .comment-input { flex: 1; padding: 0.7rem 1rem; border: none; border-radius: 20px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9rem; }
    .comment-input::placeholder { color: var(--text-secondary); opacity: 0.5; }
    .btn-comment { width: 36px; height: 36px; border-radius: 50%; background: var(--border-color); color: white; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; }
    .btn-comment:hover { opacity: 0.85; }
    .btn-comment:disabled { opacity: 0.3; }
    .login-hint { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem; opacity: 0.7; text-align: center; }
    .no-comments { text-align: center; color: var(--text-secondary); opacity: 0.5; font-size: 0.85rem; padding: 1rem 0; }
    .comments-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .comment { display: flex; gap: 0.6rem; padding: 0.8rem; background: var(--bg-secondary); border-radius: 10px; }
    .comment-avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.1); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.7rem; flex-shrink: 0; margin-top: 2px; }
    .comment-content { flex: 1; min-width: 0; }
    .comment-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem; }
    .comment-header strong { font-size: 0.8rem; }
    .comment-date { color: var(--text-secondary); font-size: 0.65rem; opacity: 0.5; }
    .comment-text { font-size: 0.88rem; line-height: 1.4; word-break: break-word; }
    .comment-actions { display: flex; gap: 0.5rem; margin-top: 0.3rem; }
    .btn-edit, .btn-delete-comment { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.7rem; opacity: 0.5; padding: 0; }
    .btn-edit:hover { opacity: 1; color: var(--border-color); }
    .btn-delete-comment:hover { opacity: 1; color: var(--accent); }
    .edit-form { display: flex; gap: 0.3rem; margin-top: 0.3rem; }
    .edit-input { flex: 1; padding: 0.4rem 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); font-size: 0.85rem; }
    .btn-save-edit, .btn-cancel-edit { background: none; border: none; cursor: pointer; font-size: 0.85rem; padding: 0.2rem 0.4rem; }
    .btn-save-edit { color: #22c55e; }
    .btn-cancel-edit { color: var(--accent); }
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
    const price = art.price ? String(art.price) : '0';
    this.cart.add({
      artId: art.id,
      artName: art.name,
      artImage: art.images[0]?.url || '',
      price,
    }, this.auth.user()?.uid);
    this.router.navigate(['/cart'], { queryParams: { payment: true } });
  }

  // Filtro de palavras ofensivas
  private badWords = [
    'merda', 'porra', 'caralho', 'puta', 'fdp', 'viado', 'buceta',
    'cu', 'foda', 'arrombado', 'desgraça', 'idiota', 'imbecil',
    'babaca', 'otario', 'vagabundo', 'lixo', 'nojento', 'bosta',
  ];

  private filterText(text: string): string {
    let filtered = text;
    for (const word of this.badWords) {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    }
    return filtered;
  }

  // Edição
  editingId = '';
  editText = '';

  startEdit(c: any) {
    this.editingId = c.id;
    this.editText = c.text;
  }

  async saveEdit(c: any) {
    const artId = this.art()?.id;
    if (!artId || !this.editText.trim()) return;
    const filtered = this.filterText(this.editText.trim());
    await this.artService.updateComment(artId, c.id, filtered);
    this.editingId = '';
    this.comments.set(await this.artService.getComments(artId));
  }

  getInitial(): string {
    return (this.auth.user()?.displayName || 'U').charAt(0).toUpperCase();
  }

  async submitComment() {
    const text = this.commentText.trim();
    if (!text) return;
    const user = this.auth.user();
    const artId = this.art()?.id;
    if (!user || !artId) return;
    const filtered = this.filterText(text);
    await this.artService.addComment(artId, user.uid, user.displayName || 'Usuário', filtered);
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
