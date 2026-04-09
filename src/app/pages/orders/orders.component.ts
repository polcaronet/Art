import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
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
    <h1 class="title">Meus Pedidos</h1>

    @if (orders().length === 0) {
      <p class="empty">Você ainda não fez nenhum pedido.</p>
    } @else {
      <div class="summary">
        <div class="summary-card">
          <span class="summary-num">{{ orders().length }}</span>
          <span class="summary-label">Pedidos</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ approvedCount() }}</span>
          <span class="summary-label">Aprovados</span>
        </div>
        <div class="summary-card">
          <span class="summary-num">{{ totalSpent() | brl }}</span>
          <span class="summary-label">Total</span>
        </div>
      </div>
    }

    <div class="orders-list">
      @for (order of orders(); track order.id) {
        <div class="order-card">
          <div class="order-top">
            <span class="order-id">Pedido #{{ order.id.slice(0, 8) }}</span>
            <span class="status" [class]="'status-' + order.status">{{ statusLabel(order.status) }}</span>
          </div>

          @if (order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'refund_requested') {
            <div class="tracker">
              @for (step of trackSteps; track step.key; let i = $index) {
                @if (i > 0) {
                  <div class="track-line" [class.done]="getStepIndex(order.status) >= i"></div>
                }
                <div class="track-step" [class.done]="getStepIndex(order.status) >= i" [class.active]="getStepIndex(order.status) === i">
                  <div class="track-icon">{{ step.icon }}</div>
                  <span>{{ step.label }}</span>
                </div>
              }
            </div>
          }

          @if (order.status === 'cancelled') {
            <p class="status-msg cancelled-text">Pedido Cancelado</p>
          }
          @if (order.status === 'refund_requested') {
            <p class="status-msg refund-text">⏳ Estorno Solicitado</p>
          }
          @if (order.status === 'refunded') {
            <p class="status-msg refunded-text">✅ Estorno Realizado</p>
          }

          <div class="order-items">
            @for (item of order.items; track item.artId) {
              <div class="order-item">
                <img [src]="item.artImage" alt="Quadro" class="item-img" />
                <div class="item-details">
                  <p class="item-name">{{ item.artName }}</p>
                </div>
              </div>
            }
          </div>

          <div class="order-bottom">
            <div class="order-meta">
              <span>📦 {{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'itens' }}</span>
              <span>💳 {{ payMethodLabel(order.paymentMethod) }}</span>
              <span>📅 {{ formatDate(order.created) }}</span>
            </div>
            <span class="order-total">{{ order.total | brl }}</span>
          </div>

          @if (order.status === 'confirmed' && canRequestRefund(order)) {
            <button class="btn-refund" (click)="requestRefund(order)">Solicitar Estorno</button>
          }

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
                <button class="btn-pix" (click)="payPixHalf(order)" [disabled]="loading()">
                  💠 Pagar {{ getHalf(order.total) | brl }} via Pix (1ª parte)
                </button>
              }
            </div>
          }

          @if (order.status === 'half_paid' && order.paymentMethod === 'pix_50_card') {
            <div class="pay-actions">
              <p class="half-info">✅ Pix confirmado. Falta pagar o resto no cartão:</p>
              <button class="btn-card" (click)="payCardHalf(order)" [disabled]="loading()">
                💳 Pagar {{ getHalf(order.total) | brl }} no Cartão
              </button>
            </div>
          }
        </div>
      }
    </div>

    @if (error()) { <p class="error-msg">{{ error() }}</p> }
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .title { font-size: 1.5rem; margin-bottom: 1.5rem; font-weight: 700; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; }

    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; text-align: center; box-shadow: var(--card-shadow); }
    .summary-num { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    .summary-label { font-size: 0.8rem; color: var(--text-secondary); }

    .orders-list { display: flex; flex-direction: column; gap: 1.2rem; }
    .order-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem; box-shadow: var(--card-shadow); }

    .order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .order-id { font-weight: 700; font-size: 1.05rem; }
    .status { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: white; }
    .status-pending { background: #f59e0b; }
    .status-half_paid { background: #00b4d8; }
    .status-confirmed { background: #3b82f6; }
    .status-delivered { background: #22c55e; }
    .status-cancelled { background: #ef4444; }
    .status-refund_requested { background: #f59e0b; }
    .status-refunded { background: #8b5cf6; }

    .tracker { display: flex; align-items: flex-start; justify-content: center; margin-bottom: 1.2rem; padding: 0.5rem 0; }
    .track-step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; min-width: 60px; }
    .track-icon { width: 36px; height: 36px; border-radius: 50%; background: rgba(128,128,128,0.15); display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.3s; }
    .track-step.done .track-icon { background: #22c55e; }
    .track-step.active .track-icon { background: var(--btn-primary); box-shadow: 0 0 12px var(--btn-primary); }
    .track-step span { font-size: 0.65rem; color: var(--text-secondary); opacity: 0.5; text-align: center; }
    .track-step.done span { opacity: 0.8; color: #22c55e; }
    .track-step.active span { opacity: 1; color: var(--btn-primary); font-weight: 600; }
    .track-line { flex: 1; height: 2px; background: rgba(128,128,128,0.2); margin-top: 18px; min-width: 20px; }
    .track-line.done { background: #22c55e; }

    .status-msg { text-align: center; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.8rem; padding: 0.5rem; border-radius: 8px; }
    .cancelled-text { color: var(--accent); background: rgba(239,68,68,0.08); }
    .refund-text { color: #f59e0b; background: rgba(245,158,11,0.08); }
    .refunded-text { color: #22c55e; background: rgba(34,197,94,0.08); }

    .order-items { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .order-item { display: flex; align-items: center; gap: 0.6rem; }
    .item-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
    .item-name { font-weight: 600; font-size: 0.9rem; }

    .order-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 0.8rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem; }
    .order-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary); flex-wrap: wrap; }
    .order-total { font-size: 1.2rem; font-weight: 700; color: var(--btn-primary); }

    .btn-refund { margin-top: 0.8rem; width: 100%; padding: 0.6rem; background: rgba(239,68,68,0.08); color: var(--accent); border: 1px solid var(--accent); border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
    .btn-refund:hover { background: var(--accent); color: white; }

    .pay-actions { display: flex; gap: 0.8rem; margin-top: 1rem; flex-wrap: wrap; }
    .btn-pix { flex: 1; min-width: 200px; padding: 0.8rem; background: #00b4d8; color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; }
    .btn-pix:hover { opacity: 0.85; }
    .btn-card { flex: 1; min-width: 200px; padding: 0.8rem; background: var(--btn-primary); color: white; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; }
    .btn-card:hover { opacity: 0.85; }
    .btn-pix:disabled, .btn-card:disabled { opacity: 0.5; }
    .half-info { color: #22c55e; font-size: 0.85rem; margin-bottom: 0.5rem; width: 100%; }
    .error-msg { color: #f87171; text-align: center; margin-top: 1rem; }

    @media (max-width: 600px) {
      .summary { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
      .summary-num { font-size: 1.2rem; }
      .tracker { gap: 0; }
      .track-step { min-width: 50px; }
      .track-icon { width: 30px; height: 30px; font-size: 0.8rem; }
      .track-line { margin-top: 15px; }
      .order-meta { flex-direction: column; gap: 0.3rem; }
    }
  `],
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private cart = inject(CartService);
  private router = inject(Router);
  auth = inject(AuthService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal('');

  approvedCount = computed(() => this.orders().filter(o => o.status === 'confirmed' || o.status === 'delivered').length);
  totalSpent = computed(() => {
    return this.orders()
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
      .toFixed(2);
  });

  trackSteps = [
    { key: 'pending', label: 'Confirmado', icon: '✓' },
    { key: 'confirmed', label: 'Aprovado', icon: '👍' },
    { key: 'production', label: 'Produção', icon: '🎨' },
    { key: 'shipped', label: 'Enviado', icon: '📦' },
    { key: 'delivered', label: 'Entregue', icon: '🏠' },
  ];

  getStepIndex(status: string): number {
    const map: Record<string, number> = {
      pending: 0, half_paid: 0, confirmed: 1, production: 2, shipped: 3, delivered: 4
    };
    return map[status] ?? -1;
  }

  async ngOnInit() {
    const uid = this.auth.user()?.uid;
    if (uid) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        this.cart.clear(uid);
      }
      this.orders.set(await this.orderService.getByUser(uid));
    }
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Aguardando', half_paid: 'Pix Pago', confirmed: 'Aprovado',
      production: 'Em Produção', shipped: 'Enviado', delivered: 'Entregue',
      cancelled: 'Cancelado', refund_requested: 'Estorno Solicitado', refunded: 'Estornado'
    };
    return m[s] || s;
  }

  formatDate(created: any): string {
    if (!created) return '';
    const date = created.toDate ? created.toDate() : new Date(created);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  canRequestRefund(order: Order): boolean {
    if (!order.created) return false;
    const created = order.created.toDate ? order.created.toDate() : new Date(order.created);
    const diffDays = (new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  async requestRefund(order: Order) {
    const reason = prompt('Motivo do estorno:');
    if (!reason) return;
    await this.orderService.updateStatus(order.id, 'refund_requested' as any);
    const { doc, updateDoc } = await import('firebase/firestore');
    const fb = (this.orderService as any).fb;
    await updateDoc(doc(fb.firestore, 'orders', order.id), { refundReason: reason });
    this.orders.update((list) => list.map((o) => o.id === order.id ? { ...o, status: 'refund_requested' as any, refundReason: reason } : o));
  }

  payMethodLabel(m?: string): string {
    const map: Record<string, string> = {
      pix_full: 'Pix à Vista', card_3x: 'Cartão de Crédito', pix_50_card: '50% Pix + 50% Cartão',
    };
    return map[m || ''] || m || '';
  }

  getHalf(total: string): string { return (parseFloat(total) / 2).toFixed(2); }
  getInstallment(total: string, n: number): string { return (parseFloat(total) / n).toFixed(2); }

  async payPix(order: Order, amount: string) {
    this.loading.set(true); this.error.set('');
    try {
      const result = await this.paymentService.createPix(parseFloat(amount), order.items.map(i => i.artName).join(', '), this.auth.user()?.email || '', order.id);
      if (result.ticketUrl) {
        await this.orderService.updatePaymentId(order.id, String(result.id));
        this.cart.clear(this.auth.user()?.uid);
        window.open(result.ticketUrl, '_blank');
      }
    } catch (e: any) { this.error.set(e?.message || 'Erro ao gerar Pix.'); }
    finally { this.loading.set(false); }
  }

  async payPixHalf(order: Order) {
    this.loading.set(true); this.error.set('');
    try {
      const half = parseFloat(order.total) / 2;
      const result = await this.paymentService.createPix(half, order.items.map(i => i.artName).join(', ') + ' (50% Pix)', this.auth.user()?.email || '', order.id);
      if (result.ticketUrl) {
        await this.orderService.updatePaymentId(order.id, String(result.id));
        await this.orderService.updateStatus(order.id, 'half_paid' as any);
        this.cart.clear(this.auth.user()?.uid);
        window.open(result.ticketUrl, '_blank');
        const uid = this.auth.user()?.uid;
        if (uid) this.orders.set(await this.orderService.getByUser(uid));
      }
    } catch (e: any) { this.error.set(e?.message || 'Erro ao gerar Pix.'); }
    finally { this.loading.set(false); }
  }

  async payCardHalf(order: Order) {
    this.loading.set(true); this.error.set('');
    try {
      const half = parseFloat(order.total) / 2;
      const checkout = await this.paymentService.createMpCheckout(
        [{ title: order.items.map(i => i.artName).join(', ') + ' (50% Cartão)', unit_price: half }],
        order.id, this.auth.user()?.email || '', 1
      );
      window.location.href = checkout.init_point;
    } catch (e: any) { this.error.set(e?.message || 'Erro ao criar pagamento.'); }
    finally { this.loading.set(false); }
  }

  async payCard(order: Order, amount: string) {
    this.loading.set(true); this.error.set('');
    try {
      const checkout = await this.paymentService.createMpCheckout(
        order.items.map(i => ({ title: i.artName, unit_price: parseFloat(i.price) })),
        order.id, this.auth.user()?.email || '', order.paymentMethod === 'card_3x' ? 3 : 1
      );
      this.cart.clear(this.auth.user()?.uid);
      window.location.href = checkout.init_point;
    } catch (e: any) { this.error.set(e?.message || 'Erro ao criar pagamento.'); }
    finally { this.loading.set(false); }
  }
}
