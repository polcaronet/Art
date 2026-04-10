import { Injectable } from '@angular/core';
import {
  collection, query, where, orderBy, getDocs, addDoc, doc, onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

export interface ChatMessage {
  id: string;
  chatId: string;
  uid: string;
  userName: string;
  text: string;
  fromAdmin: boolean;
  created: any;
}

export interface Chat {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastAt: any;
  unreadAdmin: number;
  unreadUser: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private fb: FirebaseService) { }

  async getOrCreateChat(uid: string, userName: string, userEmail: string): Promise<string> {
    const q = query(collection(this.fb.firestore, 'chats'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].id;
    const ref = await addDoc(collection(this.fb.firestore, 'chats'), {
      uid, userName, userEmail, lastMessage: '', lastAt: new Date(), unreadAdmin: 0, unreadUser: 0
    });
    return ref.id;
  }

  async sendMessage(chatId: string, uid: string, userName: string, text: string, fromAdmin: boolean) {
    await addDoc(collection(this.fb.firestore, 'chats', chatId, 'messages'), {
      chatId, uid, userName, text, fromAdmin, created: new Date()
    });
    const { updateDoc } = await import('firebase/firestore');
    const chatRef = doc(this.fb.firestore, 'chats', chatId);
    const update: any = { lastMessage: text, lastAt: new Date() };
    if (fromAdmin) {
      update.unreadUser = (await this.getUnreadCount(chatId, false)) + 1;
      update.unreadAdmin = 0;
    } else {
      update.unreadAdmin = (await this.getUnreadCount(chatId, true)) + 1;
      update.unreadUser = 0;
    }
    await updateDoc(chatRef, update);
  }

  private async getUnreadCount(chatId: string, forAdmin: boolean): Promise<number> {
    const chatDoc = await getDocs(query(collection(this.fb.firestore, 'chats'), where('__name__', '==', chatId)));
    return 0;
  }

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const q = query(
      collection(this.fb.firestore, 'chats', chatId, 'messages'),
      orderBy('created', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
  }

  async getAllChats(): Promise<Chat[]> {
    const q = query(collection(this.fb.firestore, 'chats'), orderBy('lastAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
  }

  listenMessages(chatId: string, callback: (msgs: ChatMessage[]) => void): Unsubscribe {
    const q = query(
      collection(this.fb.firestore, 'chats', chatId, 'messages'),
      orderBy('created', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
  }

  async markRead(chatId: string, forAdmin: boolean) {
    const { updateDoc } = await import('firebase/firestore');
    const chatRef = doc(this.fb.firestore, 'chats', chatId);
    if (forAdmin) {
      await updateDoc(chatRef, { unreadAdmin: 0 });
    } else {
      await updateDoc(chatRef, { unreadUser: 0 });
    }
  }
}
