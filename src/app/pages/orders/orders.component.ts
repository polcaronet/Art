import { Component, inject, OnInit, signal } from '@angular/core';
import { Order, OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [BrlPipe],
  template: `
    <h1 class="title">📦 Meus Pedidos</h1>

    @if (orders().length === 0) {
      <p class="empty">Você ainda não fez nenhum pedido.</p>
    }

    <div class="orders-list">
      @for (order of orders(); track order.id) {
        <div class="order-card">
          <div class="order-header">
            <span class="order-id">#{{ order.id.slice(0, 8) }}</span>
            <span class="pay-method">{{ payMethodLabel(order.paymentMethod) }}</span>
            <span class="order-date">{{ formatDate(order.created) }}</span>
            <span class="status" [class]="'status-' + order.status">{{ statusLabel(order.status) }}</span>
          </div>
          <div class="order-info">
            <span>👤 {{ order.userName || 'Cliente' }}</span>
            <span>📧 {{ order.userEmail }}</span>
          </div>
          <div class="order-items">
            @for (item of order.items; track item.artId) {
              <div class="order-item">
                <img [src]="item.artImage" alt="Quadro" class="item-img" />
                <div>
                  <p class="item-name">{{ item.artName }}</p>
                  <p class="item-price">{{ item.price | brl }}</p>
                </div>
              </div>
            }
          </div>
          <div class="order-footer">
            <div class="tracker">
              <div class="track-step" [class.done]="isStepDone(order.status, 'pending')" [class.active]="order.status === 'pending'">
                <div class="track-dot"></div>
                <span>Pendente</span>
              </div>
              <div class="track-line" [class.done]="isStepDone(order.status, 'confirmed')"></div>
              <div class="track-step" [class.done]="isStepDone(order.status, 'confirmed')" [class.active]="order.status === 'confirmed'">
                <div class="track-dot"></div>
                <span>Confirmado</span>
              </div>
              <div class="track-line" [class.done]="isStepDone(order.status, 'delivered')"></div>
              <div class="track-step" [class.done]="isStepDone(order.status, 'delivered')" [class.active]="order.status === 'delivered'">
                <div class="track-dot"></div>
                <span>Entregue</span>
              </div>
            </div>
            @if (order.status === 'cancelled') {
              <p class="cancelled-text">Pedido Cancelado</p>
            }
            <span class="order-total">Total: <strong>{{ order.total | brl }}</strong></span>

            @if (order.status === 'pending') {
              <div class="pay-actions">
                @if (order.paymentMethod === 'pix_full') {
                  <button class="btn-pix" (click)="payPix(order, order.total)" [disabled]="loading()">
                    💠 Pagar {{ order.total | brl }} via Pix
                  </button>
                }
                @if (order.paymentMethod === 'card_3x') {
                  <button class="btn-card" (click)="payCard(order, order.total)" [disabled]="loading()">
                    💳 Pagar 3x de {{ getInstallment(order.total, 3) | brl }}
                  </button>
                }
                @if (order.paymentMethod === 'pix_50_card') {
                  <button class="btn-pix" (click)="payPix(order, getHalf(order.total))" [disabled]="loading()">
                    💠 Sinal {{ getHalf(order.total) | brl }} via Pix
                  </button>
                  <button class="btn-card" (click)="payCard(order, getHalf(order.total))" [disabled]="loading()">
                    💳 Resto {{ getHalf(order.total) | brl }} no Cartão
                  </button>
                }
                @if (order.paymentMethod === 'card_50_card') {
                  <button class="btn-card" (click)="payCard(order, getHalf(order.total))" [disabled]="loading()">
                    💳 Sinal {{ getHalf(order.total) | brl }} no Cartão
                  </button>
                  <button class="btn-card" (click)="payCard(order, getHalf(order.total))" [disabled]="loading()">
                    💳 Resto {{ getHalf(order.total) | brl }} no Cartão
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (error()) { <p class="error-msg">{{ error() }}</p> }
  `,
  styles: [`
    .title { font-size: 1.5rem; margin-bottom: 1.5rem; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: var(--bg-secondary); border-radius: 10px; overflow: hidden; }
    .order-header { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; }
    .order-id { font-weight: 600; opacity: 0.7; }
    .order-date { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.6; }
    .pay-method { font-size: 0.75rem; color: var(--border-color); background: rgba(255,255,255,0.06); padding: 0.15rem 0.5rem; border-radius: 4px; }
    .order-info { display: flex; gap: 1.5rem; padding: 0.6rem 1rem; font-size: 0.8rem; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.04); }
    .status { margin-left: auto; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: white; }
    .status-pending { background: #f59e0b; }
    .status-confirmed { background: #3b82f6; }
    .status-delivered { background: #22c55e; }
    .status-cancelled { background: #ef4444; }
    .order-items { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .order-item { display: flex; align-items: center; gap: 0.8rem; }
    .item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .item-name { font-weight: 600; font-size: 0.9rem; }
    .item-price { color: var(--text-secondary); font-size: 0.85rem; }
    .order-footer { padding: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
    .tracker { display: flex; align-items: center; justify-content: center; margin-bottom: 0.8rem; }
    .track-step { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .track-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.2); }
    .track-step.active .track-dot { background: var(--border-color); border-color: var(--border-color); box-shadow: 0 0 6px var(--border-color); }
    .track-step.done .track-dot { background: #22c55e; border-color: #22c55e; }
    .track-step span { font-size: 0.6rem; color: var(--text-secondary); opacity: 0.5; }
    .track-step.active span, .track-step.done span { opacity: 1; }
    .track-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); margin-bottom: 1rem; }
    .track-line.done { background: #22c55e; }
    .cancelled-text { text-align: center; color: var(--accent); font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .order-total { display: block; font-size: 0.95rem; }
    .pay-actions { display: flex; gap: 0.8rem; margin-top: 1rem; flex-wrap: wrap; }
    .btn-pix { flex: 1; min-width: 200px; padding: 0.8rem; background: #00b4d8; color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; }
    .btn-pix:hover { opacity: 0.85; }
    .btn-card { flex: 1; min-width: 200px; padding: 0.8rem; background: #6366f1; color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; }
    .btn-card:hover { opacity: 0.85; }
    .btn-pix:disabled, .btn-card:disabled { opacity: 0.5; }
    .error-msg { color: #f87171; text-align: center; margin-top: 1rem; }
  `],
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private cart = inject(CartService);
  auth = inject(AuthService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal('');

  async ngOnInit() {
    const uid = this.auth.user()?.uid;
    if (uid) {
      const orders = await this.orderService.getByUser(uid);
      // Verifica status de pagamentos pendentes
      for (const order of orders) {
        if (order.status === 'pending' && order.paymentMethod === 'pix_full') {
          // Tenta verificar se já foi pago consultando o último pagamento
          // O webhook já recebeu, mas o status no Firestore não atualizou
          // Por enquanto marca como confirmado se já clicou pra pagar
        }
      }
      this.orders.set(orders);
    }
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', delivered: 'Entregue', cancelled: 'Cancelado' };
    return m[s] || s;
  }

  private stepOrder = ['pending', 'confirmed', 'delivered'];

  isStepDone(orderStatus: string, step: string): boolean {
    return this.stepOrder.indexOf(orderStatus) > this.stepOrder.indexOf(step);
  }

  formatDate(created: any): string {
    if (!created) return '';
    const date = created.toDate ? created.toDate() : new Date(created);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  payMethodLabel(m?: string): string {
    const map: Record<string, string> = {
      pix_full: 'Pix à Vista',
      card_3x: 'Cartão 3x',
      pix_50_card: '50% Pix + 50% Cartão',
      card_50_card: '50% + 50% Cartão',
    };
    return map[m || ''] || m || '';
  }

  getHalf(total: string): string {
    return (parseFloat(total) / 2).toFixed(2);
  }

  getInstallment(total: string, n: number): string {
    return (parseFloat(total) / n).toFixed(2);
  }

  async payPix(order: Order, amount: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const email = this.auth.user()?.email || '';
      const desc = order.items.map((i) => i.artName).join(', ');
      const result = await this.paymentService.createPix(parseFloat(amount), desc, email, order.id);
      if (result.ticketUrl) {
        this.cart.clear(this.auth.user()?.uid);
        window.open(result.ticketUrl, '_blank');
        this.router.navigate(['/']);
      } else {
        this.error.set('Pix gerado mas sem URL. Verifique o Mercado Pago.');
      }
    } catch (e: any) {
      console.error('Erro Pix:', e);
      this.error.set(e?.message || 'Erro ao gerar Pix.');
    } finally {
      this.loading.set(false);
    }
  }

  async payCard(order: Order, amount: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      const desc = order.items.map((i) => i.artName).join(', ');
      const result = await this.paymentService.createStripeSession(parseFloat(amount), desc, order.id);
      if (result.url) {
        this.cart.clear(this.auth.user()?.uid);
        window.location.href = result.url;
      }
    } catch (e: any) {
      console.error('Erro Stripe:', e);
      this.error.set(e?.message || 'Erro ao criar sessão de pagamento.');
    } finally {
      this.loading.set(false);
    }
  }
}
