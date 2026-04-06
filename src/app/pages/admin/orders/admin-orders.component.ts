import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../../../services/order.service';
import { PaymentService } from '../../../services/payment.service';
import { BrlPipe } from '../../../pipes/brl.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, FormsModule, BrlPipe],
  template: `
    <div class="admin-header">
      <a routerLink="/admin" class="tab">Dashboard</a>
      <a routerLink="/admin/upload" class="tab">Upload</a>
      <a routerLink="/admin/edit" class="tab">Editar</a>
      <a routerLink="/admin/orders" class="tab active">Pedidos</a>
    </div>

    <h2 class="subtitle">Todos os Pedidos</h2>

    @if (orders().length === 0) {
      <p class="empty">Nenhum pedido ainda.</p>
    }

    <div class="orders-list">
      @for (order of orders(); track order.id) {
        <div class="order-card">
          <div class="order-header">
            <div class="order-meta">
              <span class="order-id">#{{ order.id.slice(0, 8) }}</span>
              <span class="user-info">{{ order.userName }} ({{ order.userEmail }})</span>
              @if (order.paymentMethod) {
                <span class="pay-badge">{{ payMethodLabel(order.paymentMethod) }}</span>
              }
            </div>
            <div class="action-buttons">
              @if (order.status === 'pending') {
                <button class="btn-confirm" (click)="onStatusChange(order, 'confirmed')">✓ Confirmar</button>
                <button class="btn-cancel" (click)="onStatusChange(order, 'cancelled')">✕ Cancelar</button>
              }
              @if (order.status === 'confirmed') {
                <button class="btn-deliver" (click)="onStatusChange(order, 'delivered')">📦 Entregue</button>
                <button class="btn-cancel" (click)="onStatusChange(order, 'cancelled')">✕ Cancelar</button>
                <button class="btn-refund" (click)="onStatusChange(order, 'refunded')">💰 Estornar</button>
              }
              @if (order.status === 'delivered') {
                <button class="btn-refund" (click)="onStatusChange(order, 'refunded')">💰 Estornar</button>
              }
              @if (order.status === 'refund_requested') {
                <button class="btn-refund" (click)="onStatusChange(order, 'refunded')">💰 Aprovar Estorno</button>
                <button class="btn-deny" (click)="onStatusChange(order, 'confirmed')">✕ Negar</button>
              }
              @if (order.status === 'cancelled' || order.status === 'refunded') {
                <span class="status-badge" [class]="'sb-' + order.status">{{ statusLabel(order.status) }}</span>
              }
            </div>
          </div>

          @if (order.refundReason) {
            <div class="refund-reason">
              ⚠️ Motivo do estorno: {{ order.refundReason }}
            </div>
          }

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
            <span>Total: <strong>{{ order.total | brl }}</strong></span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .admin-header { display: flex; gap: 0.5rem; background: var(--accent); padding: 0.6rem 1rem; border-radius: 10px; margin-bottom: 1.5rem; width: 100%; }
    .tab { color: white; font-weight: 600; padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.85rem; }
    .tab.active, .tab:hover { background: rgba(255,255,255,0.2); }
    .subtitle { font-size: 1.3rem; margin-bottom: 1rem; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: var(--bg-secondary); border-radius: 10px; overflow: hidden; }
    .order-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; gap: 0.5rem; }
    .order-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .order-id { font-weight: 600; opacity: 0.7; }
    .user-info { color: var(--text-secondary); font-size: 0.8rem; }
    .pay-badge { font-size: 0.7rem; color: var(--border-color); background: rgba(255,255,255,0.06); padding: 0.1rem 0.4rem; border-radius: 4px; }
    .status-select { padding: 0.3rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-text); font-size: 0.8rem; }
    .action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn-confirm { padding: 0.4rem 0.8rem; background: #22c55e; color: white; border-radius: 6px; font-weight: 600; font-size: 0.8rem; border: none; cursor: pointer; }
    .btn-confirm:hover { opacity: 0.85; }
    .btn-deliver { padding: 0.4rem 0.8rem; background: #3b82f6; color: white; border-radius: 6px; font-weight: 600; font-size: 0.8rem; border: none; cursor: pointer; }
    .btn-deliver:hover { opacity: 0.85; }
    .btn-cancel { padding: 0.4rem 0.8rem; background: rgba(239,68,68,0.1); color: var(--accent); border: 1px solid var(--accent); border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; }
    .btn-cancel:hover { background: var(--accent); color: white; }
    .btn-refund { padding: 0.4rem 0.8rem; background: #8b5cf6; color: white; border-radius: 6px; font-weight: 600; font-size: 0.8rem; border: none; cursor: pointer; }
    .btn-refund:hover { opacity: 0.85; }
    .btn-deny { padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.1); color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; }
    .btn-deny:hover { background: rgba(255,255,255,0.2); }
    .status-badge { padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: white; }
    .sb-delivered { background: #22c55e; }
    .sb-cancelled { background: #ef4444; }
    .sb-refunded { background: #8b5cf6; }
    .refund-reason { padding: 0.6rem 1rem; background: rgba(239,68,68,0.08); color: var(--accent); font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .order-items { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .order-item { display: flex; align-items: center; gap: 0.8rem; }
    .item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .item-name { font-weight: 600; font-size: 0.9rem; }
    .item-price { color: var(--text-secondary); font-size: 0.85rem; }
    .order-footer { padding: 0.8rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.95rem; }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  orders = signal<Order[]>([]);

  async ngOnInit() {
    this.orders.set(await this.orderService.getAll());
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

  async onStatusChange(order: Order, status: Order['status']) {
    if (status === 'refunded' && order.paymentId) {
      try {
        if (order.paymentMethod?.includes('pix')) {
          await this.paymentService.refundPix(order.paymentId, order.id);
        } else {
          await this.paymentService.refundCard(order.paymentId, order.id);
        }
      } catch (e: any) {
        alert('Erro ao estornar: ' + (e?.message || 'Erro desconhecido'));
        return;
      }
    }
    await this.orderService.updateStatus(order.id, status);
    this.orders.update((list) =>
      list.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      delivered: 'Entregue', cancelled: 'Cancelado', refunded: 'Estornado'
    };
    return m[s] || s;
  }
}
