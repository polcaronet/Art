import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { Order, OrderService } from '../../services/order.service';
import { BrlPipe } from '../../pipes/brl.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, BrlPipe],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <h1>Meu Perfil</h1>

        <div class="section">
          <h2>Editar Nome</h2>
          <form (ngSubmit)="onSaveName()">
            <input type="text" [(ngModel)]="displayName" name="displayName" class="input" placeholder="Seu nome..." />
            <button type="submit" class="btn" [disabled]="saving()">
              {{ saving() ? 'Salvando...' : 'Salvar Nome' }}
            </button>
          </form>
          @if (message()) { <p class="success">{{ message() }}</p> }
        </div>

        <div class="section">
          <h2>Tema da Página</h2>
          <div class="theme-options">
            <button class="theme-btn" [class.active]="themeService.theme() === 'default'" (click)="setTheme('default')">🔵 Padrão</button>
            <button class="theme-btn" [class.active]="themeService.theme() === 'dark'" (click)="setTheme('dark')">🌙 Escuro</button>
            <button class="theme-btn" [class.active]="themeService.theme() === 'warm'" (click)="setTheme('warm')">🌅 Quente</button>
            <button class="theme-btn" [class.active]="themeService.theme() === 'light'" (click)="setTheme('light')">☀️ Claro</button>
          </div>
        </div>

        <div class="section info">
          <p><span class="lbl">Email:</span> {{ auth.user()?.email }}</p>
          <p><span class="lbl">Tipo:</span> {{ auth.isAdmin() ? 'Administrador' : 'Cliente' }}</p>
        </div>
      </div>

      <!-- Histórico de Pedidos -->
      <div class="orders-card">
        <h2>📦 {{ auth.isAdmin() ? 'Pedidos de Clientes' : 'Meus Pedidos' }}</h2>

        @if (orders().length === 0) {
          <p class="empty">Nenhum pedido encontrado.</p>
        }

        @for (order of orders(); track order.id) {
          <div class="order">
            <div class="order-top">
              <span class="order-id">#{{ order.id.slice(0, 8) }}</span>
              @if (auth.isAdmin()) {
                <span class="order-user">{{ order.userName }} ({{ order.userEmail }})</span>
              }
              <span class="status" [class]="'s-' + order.status">{{ statusLabel(order.status) }}</span>
            </div>
            <div class="order-items">
              @for (item of order.items; track item.artId) {
                <div class="order-item">
                  <img [src]="item.artImage" alt="" class="item-img" />
                  <span class="item-name">{{ item.artName }}</span>
                  <span class="item-price">{{ item.price | brl }}</span>
                </div>
              }
            </div>
            <div class="order-bottom">
              <div class="tracker">
                <div class="track-step" [class.active]="isStepActive(order.status, 'pending')" [class.done]="isStepDone(order.status, 'pending')">
                  <div class="track-dot"></div>
                  <span>Pendente</span>
                </div>
                <div class="track-line" [class.done]="isStepDone(order.status, 'confirmed')"></div>
                <div class="track-step" [class.active]="isStepActive(order.status, 'confirmed')" [class.done]="isStepDone(order.status, 'confirmed')">
                  <div class="track-dot"></div>
                  <span>Confirmado</span>
                </div>
                <div class="track-line" [class.done]="isStepDone(order.status, 'delivered')"></div>
                <div class="track-step" [class.active]="isStepActive(order.status, 'delivered')" [class.done]="isStepDone(order.status, 'delivered')">
                  <div class="track-dot"></div>
                  <span>Entregue</span>
                </div>
              </div>
              @if (order.status === 'cancelled') {
                <p class="cancelled-label">Pedido Cancelado</p>
              }
              <div class="order-total">
                <span>Total: <strong>{{ order.total | brl }}</strong></span>
              @if (auth.isAdmin()) {
                <select [ngModel]="order.status" (ngModelChange)="updateStatus(order, $event)" class="status-select">
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refund_requested">Estorno Solicitado</option>
                  <option value="refunded">Estornado</option>
                </select>
              }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-page { display: flex; gap: 1.5rem; padding-top: 1rem; flex-wrap: wrap; }
    .profile-card { background: var(--bg-secondary); padding: 2rem; border-radius: 12px; width: 100%; max-width: 400px; height: fit-content; }
    .profile-card h1 { margin-bottom: 1.5rem; font-size: 1.5rem; }
    .section { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .section h2 { font-size: 1rem; margin-bottom: 0.8rem; color: var(--text-secondary); }
    .input { width: 100%; padding: 0.7rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; margin-bottom: 0.8rem; font-size: 1rem; background: var(--input-bg); color: var(--input-text); }
    .btn { background: var(--bg-card); color: var(--text-primary); padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; }
    .btn:hover { opacity: 0.85; }
    .success { color: #4ade80; margin-top: 0.5rem; font-size: 0.9rem; }
    .theme-options { display: flex; gap: 0.8rem; }
    .theme-btn { padding: 0.5rem 1rem; border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font-weight: 500; border: 2px solid transparent; font-size: 0.85rem; }
    .theme-btn.active { border-color: var(--accent); }
    .theme-btn:hover { opacity: 0.85; }
    .info .lbl { color: var(--text-secondary); }

    .orders-card { flex: 1; min-width: 300px; background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; height: fit-content; }
    .orders-card h2 { font-size: 1.2rem; margin-bottom: 1rem; }
    .empty { color: var(--text-secondary); opacity: 0.6; }
    .order { background: var(--bg-card); border-radius: 10px; margin-bottom: 0.8rem; overflow: hidden; }
    .order-top { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; }
    .order-id { font-weight: 600; font-size: 0.8rem; opacity: 0.6; }
    .order-user { font-size: 0.8rem; color: var(--text-secondary); }
    .status { margin-left: auto; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white; }
    .s-pending { background: #f59e0b; }
    .s-confirmed { background: #3b82f6; }
    .s-delivered { background: #22c55e; }
    .s-cancelled { background: #ef4444; }
    .order-items { padding: 0.6rem 1rem; }
    .order-item { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem; }
    .item-img { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; }
    .item-name { flex: 1; font-size: 0.85rem; font-weight: 500; }
    .item-price { font-size: 0.8rem; color: var(--text-secondary); }
    .order-bottom { padding: 0.8rem 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
    .tracker { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 0.6rem; }
    .track-step { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .track-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; }
    .track-step.active .track-dot { background: var(--border-color); border-color: var(--border-color); box-shadow: 0 0 8px var(--border-color); }
    .track-step.done .track-dot { background: #22c55e; border-color: #22c55e; }
    .track-step span { font-size: 0.6rem; color: var(--text-secondary); opacity: 0.5; }
    .track-step.active span, .track-step.done span { opacity: 1; }
    .track-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); margin-bottom: 1rem; }
    .track-line.done { background: #22c55e; }
    .cancelled-label { text-align: center; color: var(--accent); font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .order-total { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
    .status-select { padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--input-text); font-size: 0.75rem; }

    @media (max-width: 768px) {
      .profile-page { flex-direction: column; }
      .profile-card { max-width: 100%; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  private orderService = inject(OrderService);

  displayName = '';
  saving = signal(false);
  message = signal('');
  orders = signal<Order[]>([]);

  async ngOnInit() {
    this.displayName = this.auth.user()?.displayName || '';
    await this.loadOrders();
  }

  async loadOrders() {
    if (this.auth.isAdmin()) {
      this.orders.set(await this.orderService.getAll());
    } else {
      const uid = this.auth.user()?.uid;
      if (uid) this.orders.set(await this.orderService.getByUser(uid));
    }
  }

  async onSaveName() {
    this.saving.set(true);
    this.message.set('');
    try {
      await this.auth.updateUserProfile(this.displayName);
      this.message.set('Nome atualizado!');
    } catch {
      this.message.set('Erro ao atualizar.');
    } finally {
      this.saving.set(false);
    }
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', delivered: 'Entregue', cancelled: 'Cancelado', refund_requested: 'Estorno Solicitado', refunded: 'Estornado' };
    return m[s] || s;
  }

  async updateStatus(order: Order, status: Order['status']) {
    await this.orderService.updateStatus(order.id, status);
    this.orders.update((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)));
  }

  private stepOrder = ['pending', 'confirmed', 'delivered'];

  isStepActive(orderStatus: string, step: string): boolean {
    return orderStatus === step;
  }

  isStepDone(orderStatus: string, step: string): boolean {
    const orderIdx = this.stepOrder.indexOf(orderStatus);
    const stepIdx = this.stepOrder.indexOf(step);
    return orderIdx > stepIdx;
  }
}
