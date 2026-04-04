import { Injectable, signal, computed } from '@angular/core';
import { OrderItem } from './order.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<OrderItem[]>(this.loadFromStorage());

  items = this.itemsSignal.asReadonly();
  count = computed(() => this.itemsSignal().length);
  total = computed(() => {
    return this.itemsSignal()
      .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
      .toFixed(2);
  });

  private loadFromStorage(): OrderItem[] {
    try {
      const data = localStorage.getItem('cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem('cart', JSON.stringify(this.itemsSignal()));
  }

  add(item: OrderItem) {
    const exists = this.itemsSignal().some((i) => i.artId === item.artId);
    if (exists) return;
    this.itemsSignal.update((list) => [...list, item]);
    this.save();
  }

  remove(artId: string) {
    this.itemsSignal.update((list) => list.filter((i) => i.artId !== artId));
    this.save();
  }

  clear() {
    this.itemsSignal.set([]);
    localStorage.removeItem('cart');
  }
}
