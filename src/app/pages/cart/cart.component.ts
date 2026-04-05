import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  template: `
    <h1 class="title">🛒 Carrinho</h1>

    @if (cart.count() === 0) {
      <p class="empty">Seu carrinho está vazio.</p>
    } @else {
      <div class="cart-list">
        @for (item of cart.items(); track item.artId) {
          <div class="cart-item">
            <img [src]="item.artImage" alt="Quadro" class="item-img" />
            <div class="item-info">
              <p class="item-name">{{ item.artName }}</p>
              <p class="item-price">R$ {{ item.price }}</p>
            </div>
            <button class="btn-remove" (click)="cart.remove(item.artId, auth.user()?.uid)">✕</button>
          </div>
        }
      </div>

      <div class="cart-footer">
        <p class="total">Total: <strong>R$ {{ cart.total() }}</strong></p>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button class="btn-checkout" (click)="checkout()" [disabled]="loading()">
          {{ loading() ? 'Finalizando...' : 'Finalizar Pedido' }}
        </button>
        <p class="hint">Após finalizar, escolha a forma de pagamento na tela de pedidos.</p>
      </div>
    }
  `,
  styles: [`
    .title { font-size: 1.5rem; margin-bottom: 1.5rem; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; font-size: 1.1rem; }
    .cart-list { display: flex; flex-direction: column; gap: 1rem; }
    .cart-item { display: flex; align-items: center; gap: 1rem; background: var(--bg-secondary); padding: 0.8rem; border-radius: 10px; }
    .item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; }
    .item-name { font-weight: 700; margin-bottom: 0.2rem; }
    .item-price { color: var(--text-secondary); }
    .btn-remove { background: rgba(255,255,255,0.1); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border: none; cursor: pointer; }
    .btn-remove:hover { background: var(--accent); color: white; }
    .cart-footer { margin-top: 1.5rem; background: var(--bg-secondary); padding: 1.5rem; border-radius: 10px; }
    .total { font-size: 1.2rem; margin-bottom: 1rem; }
    .error { color: #f87171; margin-bottom: 0.5rem; }
    .btn-checkout { width: 100%; padding: 0.8rem; background: #22c55e; color: white; border-radius: 8px; font-weight: 600; font-size: 1.05rem; border: none; cursor: pointer; }
    .btn-checkout:hover { background: #16a34a; }
    .btn-checkout:disabled { opacity: 0.6; }
    .hint { text-align: center; color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.8rem; opacity: 0.7; }
  `],
})
export class CartComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  async checkout() {
    const user = this.auth.user();
    if (!user || user.isAnonymous) {
      this.router.navigate(['/register']);
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.orderService.create({
        uid: user.uid,
        userName: user.displayName || '',
        userEmail: user.email || '',
        items: this.cart.items(),
        status: 'pending',
        total: this.cart.total(),
        created: new Date(),
      });
      this.cart.clear(user.uid);
      this.router.navigate(['/orders']);
    } catch (e: any) {
      this.error.set(e?.message || 'Erro ao finalizar pedido.');
    } finally {
      this.loading.set(false);
    }
  }
}
