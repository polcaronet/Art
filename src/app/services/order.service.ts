import { Injectable } from '@angular/core';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  where,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface OrderItem {
  artId: string;
  artName: string;
  artImage: string;
  price: string;
}

export interface Order {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total: string;
  paymentMethod?: string;
  created: any;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private fb: FirebaseService) { }

  async create(data: Omit<Order, 'id'>) {
    return addDoc(collection(this.fb.firestore, 'orders'), data);
  }

  async getByUser(uid: string): Promise<Order[]> {
    const q = query(
      collection(this.fb.firestore, 'orders'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    return orders.sort((a, b) => {
      const da = a.created?.toDate ? a.created.toDate() : new Date(a.created);
      const db = b.created?.toDate ? b.created.toDate() : new Date(b.created);
      return db.getTime() - da.getTime();
    });
  }

  async getAll(): Promise<Order[]> {
    const q = query(
      collection(this.fb.firestore, 'orders'),
      orderBy('created', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  }

  async updateStatus(id: string, status: Order['status']) {
    return updateDoc(doc(this.fb.firestore, 'orders', id), { status });
  }
}
