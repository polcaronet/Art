import { Component, inject, OnInit, signal } from '@angular/core';
import { Order, OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
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
            <span class="status" [class]="'status-' + order.status">{{ statusLabel(order.status) }}</span>
          </div>
          <div class="order-items">
            @for (item of order.items; track item.artId) {
              <div class="order-item">
                <img [src]="item.artImage" alt="Quadro" class="item-img" />
                <div>
                  <p class="item-name">{{ item.artName }}</p>
                  <p class="item-price">R$ {{ item.price }}</p>
                </div>
              </div>
            }
          </div>
          <div class="order-footer">
            <span>Total: <strong>R$ {{ order.total }}</strong></span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .title { font-size: 1.5rem; margin-bottom: 1.5rem; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; }
    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .order-card { background: var(--bg-secondary); border-radius: 10px; overflow: hidden; }
    .order-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .order-id { font-weight: 600; opacity: 0.7; }
    .status { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; color: white; }
    .status-pending { background: #f59e0b; }
    .status-confirmed { background: #3b82f6; }
    .status-delivered { background: #22c55e; }
    .status-cancelled { background: #ef4444; }
    .order-items { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .order-item { display: flex; align-items: center; gap: 0.8rem; }
    .item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .item-name { font-weight: 600; font-size: 0.9rem; }
    .item-price { color: var(--text-secondary); font-size: 0.85rem; }
    .order-footer { padding: 0.8rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.95rem; }
  `],
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  orders = signal<Order[]>([]);

  async ngOnInit() {
    const uid = this.auth.user()?.uid;
    if (uid) {
      this.orders.set(await this.orderService.getByUser(uid));
    }
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return map[s] || s;
  }
}
