import { Injectable, signal, computed, inject } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { OrderItem } from './order.service';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private fb = inject(FirebaseService);
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

  private saveLocal() {
    localStorage.setItem('cart', JSON.stringify(this.itemsSignal()));
  }

  private async saveToFirestore(uid: string) {
    await setDoc(doc(this.fb.firestore, 'carts', uid), {
      items: this.itemsSignal(),
      updated: new Date(),
    });
  }

  private async save(uid?: string) {
    this.saveLocal();
    if (uid) await this.saveToFirestore(uid);
  }

  /** Carrega carrinho do Firestore quando o usuário loga */
  async loadFromFirestore(uid: string) {
    const snap = await getDoc(doc(this.fb.firestore, 'carts', uid));
    if (snap.exists()) {
      const data = snap.data();
      const remoteItems: OrderItem[] = data['items'] || [];
      // Merge: itens locais + remotos sem duplicar
      const local = this.itemsSignal();
      const merged = [...remoteItems];
      for (const item of local) {
        if (!merged.some((i) => i.artId === item.artId)) {
          merged.push(item);
        }
      }
      this.itemsSignal.set(merged);
      this.saveLocal();
      await this.saveToFirestore(uid);
    }
  }

  add(item: OrderItem, uid?: string) {
    const exists = this.itemsSignal().some((i) => i.artId === item.artId);
    if (exists) return;
    this.itemsSignal.update((list) => [...list, item]);
    this.save(uid);
  }

  remove(artId: string, uid?: string) {
    this.itemsSignal.update((list) => list.filter((i) => i.artId !== artId));
    this.save(uid);
  }

  clear(uid?: string) {
    this.itemsSignal.set([]);
    localStorage.removeItem('cart');
    if (uid) {
      setDoc(doc(this.fb.firestore, 'carts', uid), { items: [], updated: new Date() });
    }
  }
}
