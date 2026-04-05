import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [BrlPipe],
  template: `
    <h1 class="title">🛒 Carrinho</h1>

    @if (cart.count() === 0 && !showPayment()) {
      <p class="empty">Seu carrinho está vazio.</p>
    } @else if (showPayment()) {
      <!-- Tela de opções de pagamento -->
      <div class="payment-box">
        <h2>Escolha a forma de pagamento</h2>
        <p class="pay-total">Total: <strong>{{ cart.total() | brl }}</strong></p>

        <div class="pay-options">
          <button class="pay-option" (click)="selectPayment('pix_full')">
            <span class="pay-icon">💠</span>
            <span class="pay-title">Pix à Vista</span>
            <span class="pay-desc">Pagamento integral via Pix</span>
            <span class="pay-value">{{ cart.total() | brl }}</span>
          </button>

          <button class="pay-option" (click)="selectPayment('card_3x')">
            <span class="pay-icon">💳</span>
            <span class="pay-title">Cartão até 3x</span>
            <span class="pay-desc">Parcelado no cartão de crédito</span>
            <span class="pay-value">3x de {{ getInstallment(3) | brl }}</span>
          </button>

          <button class="pay-option" (click)="selectPayment('pix_50_card')">
            <span class="pay-icon">💠💳</span>
            <span class="pay-title">50% Pix + 50% Cartão</span>
            <span class="pay-desc">Sinal via Pix, resto no cartão</span>
            <span class="pay-value">{{ getHalf() | brl }} + {{ getHalf() | brl }}</span>
          </button>

          <button class="pay-option" (click)="selectPayment('card_50_card')">
            <span class="pay-icon">💳💳</span>
            <span class="pay-title">50% Cartão + 50% Cartão</span>
            <span class="pay-desc">Sinal no cartão, resto no cartão</span>
            <span class="pay-value">{{ getHalf() | brl }} + {{ getHalf() | brl }}</span>
          </button>
        </div>

        <button class="btn-back" (click)="showPayment.set(false)">← Voltar ao carrinho</button>
        @if (error()) { <p class="error">{{ error() }}</p> }
      </div>
    } @else {
      <div class="cart-list">
        @for (item of cart.items(); track item.artId) {
          <div class="cart-item">
            <img [src]="item.artImage" alt="Quadro" class="item-img" />
            <div class="item-info">
              <p class="item-name">{{ item.artName }}</p>
              <p class="item-price">{{ item.price | brl }}</p>
            </div>
            <button class="btn-remove" (click)="cart.remove(item.artId, auth.user()?.uid)">✕</button>
          </div>
        }
      </div>

      <div class="cart-footer">
        <p class="total">Total: <strong>{{ cart.total() | brl }}</strong></p>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button class="btn-checkout" (click)="goToPayment()">
          Escolher Pagamento
        </button>
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

    .payment-box { max-width: 550px; margin: 0 auto; }
    .payment-box h2 { font-size: 1.3rem; margin-bottom: 0.5rem; text-align: center; }
    .pay-total { text-align: center; font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-secondary); }
    .pay-options { display: flex; flex-direction: column; gap: 0.8rem; }
    .pay-option { display: flex; align-items: center; gap: 1rem; background: var(--bg-secondary); padding: 1rem 1.2rem; border-radius: 10px; border: 2px solid transparent; cursor: pointer; text-align: left; color: var(--text-primary); transition: all 0.2s; width: 100%; }
    .pay-option:hover { border-color: var(--border-color); background: var(--bg-card); }
    .pay-icon { font-size: 1.3rem; min-width: 40px; text-align: center; }
    .pay-title { font-weight: 700; font-size: 0.95rem; min-width: 180px; }
    .pay-desc { flex: 1; color: var(--text-secondary); font-size: 0.8rem; }
    .pay-value { font-weight: 600; font-size: 0.85rem; color: var(--border-color); white-space: nowrap; }
    .btn-back { margin-top: 1.5rem; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; }
    .btn-back:hover { color: var(--text-primary); }

    @media (max-width: 600px) {
      .pay-option { flex-wrap: wrap; gap: 0.5rem; }
      .pay-title { min-width: auto; }
      .pay-desc { display: none; }
    }
  `],
})
export class CartComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showPayment = signal(false);
  loading = signal(false);
  error = signal('');

  constructor() {
    const payment = this.route.snapshot.queryParamMap.get('payment');
    if (payment === 'true') this.showPayment.set(true);
  }

  goToPayment() {
    const user = this.auth.user();
    if (!user || user.isAnonymous) {
      this.router.navigate(['/register']);
      return;
    }
    this.showPayment.set(true);
  }

  getHalf(): number {
    return parseFloat(this.cart.total()) / 2;
  }

  getInstallment(n: number): number {
    return parseFloat(this.cart.total()) / n;
  }

  async selectPayment(method: string) {
    const user = this.auth.user();
    if (!user || user.isAnonymous) {
      this.router.navigate(['/register']);
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      // Verifica se já tem pedido pendente com os mesmos itens
      const existing = await this.orderService.getByUser(user.uid);
      const itemIds = this.cart.items().map(i => i.artId).sort().join(',');
      const duplicate = existing.find(o =>
        o.status === 'pending' &&
        o.items.map(i => i.artId).sort().join(',') === itemIds
      );

      if (!duplicate) {
        await this.orderService.create({
          uid: user.uid,
          userName: user.displayName || '',
          userEmail: user.email || '',
          items: this.cart.items(),
          status: 'pending',
          total: this.cart.total(),
          created: new Date(),
          paymentMethod: method,
        } as any);
      }
      this.router.navigate(['/orders']);
    } catch (e: any) {
      console.error('Erro ao criar pedido:', e);
      this.error.set(e?.message || 'Erro ao finalizar pedido.');
    } finally {
      this.loading.set(false);
    }
  }
}
