import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService, Chat, ChatMessage } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-header">
      <a routerLink="/admin" class="tab">Dashboard</a>
      <a routerLink="/admin/upload" class="tab">Upload</a>
      <a routerLink="/admin/edit" class="tab">Editar</a>
      <a routerLink="/admin/orders" class="tab">Pedidos</a>
      <a routerLink="/admin/chat" class="tab active">Mensagens</a>
    </div>

    <div class="chat-layout">
      <div class="chat-list">
        <h3>Conversas</h3>
        @if (chats().length === 0) {
          <p class="empty">Nenhuma conversa ainda.</p>
        }
        @for (chat of chats(); track chat.id) {
          <button class="chat-item" [class.active]="selectedChat()?.id === chat.id" (click)="selectChat(chat)">
            <div class="chat-item-top">
              <span class="chat-name">{{ chat.userName }}</span>
              @if (chat.unreadAdmin > 0) {
                <span class="unread-badge">{{ chat.unreadAdmin }}</span>
              }
            </div>
            <span class="chat-preview">{{ chat.lastMessage || 'Sem mensagens' }}</span>
          </button>
        }
      </div>

      <div class="chat-area">
        @if (!selectedChat()) {
          <p class="select-hint">Selecione uma conversa</p>
        } @else {
          <div class="chat-area-header">
            <strong>{{ selectedChat()!.userName }}</strong>
            <span>{{ selectedChat()!.userEmail }}</span>
          </div>
          <div class="messages-area">
            @for (msg of messages(); track msg.id) {
              <div class="msg" [class.admin]="msg.fromAdmin" [class.user]="!msg.fromAdmin">
                <span class="msg-text">{{ msg.text }}</span>
              </div>
            }
          </div>
          <div class="reply-row">
            <input class="reply-input" placeholder="Responder..." [(ngModel)]="replyText" (keyup.enter)="sendReply()" />
            <button class="reply-btn" (click)="sendReply()" [disabled]="!replyText.trim()">Enviar</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-header { display: flex; gap: 0.5rem; background: var(--accent); padding: 0.6rem 1rem; border-radius: 10px; margin-bottom: 1.5rem; }
    .tab { color: white; font-weight: 600; padding: 0.4rem 1rem; border-radius: 6px; font-size: 1rem; }
    .tab.active, .tab:hover { background: rgba(255,255,255,0.2); }
    .chat-layout { display: flex; gap: 1rem; height: calc(100vh - 220px); min-height: 400px; }
    .chat-list { width: 280px; flex-shrink: 0; background: var(--bg-card); border-radius: 10px; padding: 1rem; overflow-y: auto; border: 1px solid var(--border-color); }
    .chat-list h3 { font-size: 1rem; margin-bottom: 0.8rem; }
    .empty { color: var(--text-secondary); font-size: 0.85rem; }
    .chat-item { display: block; width: 100%; text-align: left; padding: 0.7rem; border-radius: 8px; background: none; border: none; color: var(--text-primary); cursor: pointer; transition: all 0.2s; margin-bottom: 0.3rem; }
    .chat-item:hover { background: var(--bg-secondary); }
    .chat-item.active { background: var(--btn-primary); color: white; }
    .chat-item-top { display: flex; justify-content: space-between; align-items: center; }
    .chat-name { font-weight: 600; font-size: 0.9rem; }
    .unread-badge { background: var(--accent); color: white; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 10px; }
    .chat-preview { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chat-item.active .chat-preview { color: rgba(255,255,255,0.7); }
    .chat-area { flex: 1; background: var(--bg-card); border-radius: 10px; display: flex; flex-direction: column; border: 1px solid var(--border-color); overflow: hidden; }
    .select-hint { text-align: center; color: var(--text-secondary); margin-top: 3rem; }
    .chat-area-header { padding: 0.8rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .chat-area-header strong { font-size: 0.95rem; }
    .chat-area-header span { font-size: 0.8rem; color: var(--text-secondary); }
    .messages-area { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .msg { max-width: 75%; padding: 0.5rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; word-break: break-word; }
    .msg.user { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
    .msg.admin { align-self: flex-end; background: #25d366; color: white; border-bottom-right-radius: 4px; }
    .reply-row { display: flex; gap: 0.5rem; padding: 0.8rem; border-top: 1px solid var(--border-color); }
    .reply-input { flex: 1; padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-text); font-size: 0.9rem; outline: none; }
    .reply-btn { padding: 0.6rem 1.2rem; background: #25d366; color: white; border-radius: 20px; font-weight: 600; border: none; cursor: pointer; }
    .reply-btn:disabled { opacity: 0.4; }
    @media (max-width: 700px) {
      .chat-layout { flex-direction: column; height: auto; }
      .chat-list { width: 100%; max-height: 200px; }
    }
  `],
})
export class AdminChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private auth = inject(AuthService);

  chats = signal<Chat[]>([]);
  selectedChat = signal<Chat | null>(null);
  messages = signal<ChatMessage[]>([]);
  replyText = '';
  private unsub: any;

  async ngOnInit() {
    this.chats.set(await this.chatService.getAllChats());
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  async selectChat(chat: Chat) {
    if (this.unsub) this.unsub();
    this.selectedChat.set(chat);
    await this.chatService.markRead(chat.id, true);
    this.unsub = this.chatService.listenMessages(chat.id, (msgs) => {
      this.messages.set(msgs);
    });
    // Atualiza badge
    this.chats.update(list => list.map(c => c.id === chat.id ? { ...c, unreadAdmin: 0 } : c));
  }

  async sendReply() {
    const chat = this.selectedChat();
    if (!this.replyText.trim() || !chat) return;
    const user = this.auth.user();
    await this.chatService.sendMessage(chat.id, user?.uid || '', 'Admin', this.replyText.trim(), true);
    this.replyText = '';
  }
}
