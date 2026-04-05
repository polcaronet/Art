import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from '../../../services/order.service';
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
            <select [ngModel]="order.status" (ngModelChange)="onStatusChange(order, $event)" class="status-select">
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
              <option value="refund_requested">Estorno Solicitado</option>
              <option value="refunded">Estornado</option>
            </select>
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
    .admin-header { display: flex; gap: 0.5rem; background: var(--accent); padding: 0.6rem 1rem; border-radius: 10px; margin-bottom: 1.5rem; flex-wrap: wrap; }
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
    await this.orderService.updateStatus(order.id, status);
    this.orders.update((list) =>
      list.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
  }
}
