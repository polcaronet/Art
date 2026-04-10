import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { ChatService, ChatMessage } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FormsModule],
  template: `
    <app-header />
    <main class="container">
      <router-outlet />
    </main>
    <app-footer />

    <div class="support-fab">
      <button class="fab-btn" (click)="toggleChat()">
        @if (chatOpen()) { ✕ } @else { 💬 }
      </button>

      @if (chatOpen()) {
        <div class="chat-box">
          <div class="chat-header">
            <span>💬 Suporte</span>
          </div>
          <div class="chat-messages" #chatMessages>
            @if (messages().length === 0) {
              <p class="chat-empty">Envie uma mensagem para iniciar o atendimento.</p>
            }
            @for (msg of messages(); track msg.id) {
              <div class="chat-msg" [class.mine]="!msg.fromAdmin" [class.admin]="msg.fromAdmin">
                <span class="msg-text">{{ msg.text }}</span>
              </div>
            }
          </div>
          <div class="chat-input-row">
            <input class="chat-input" placeholder="Digite sua mensagem..." [(ngModel)]="chatText" (keyup.enter)="sendMessage()" />
            <button class="chat-send" (click)="sendMessage()" [disabled]="!chatText.trim()">➤</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1rem;
        min-height: calc(100vh - 130px);
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .container > * {
        display: block;
        width: 100%;
      }
      .support-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
      .fab-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #25d366;
        color: white;
        font-size: 1.5rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fab-btn:hover { transform: scale(1.1); }
      .chat-box {
        width: 320px;
        height: 420px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        order: -1;
      }
      .chat-header { background: #25d366; color: white; padding: 0.8rem 1rem; font-weight: 700; font-size: 0.95rem; }
      .chat-messages { flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.4rem; }
      .chat-empty { text-align: center; color: var(--text-secondary); font-size: 0.8rem; margin-top: 2rem; opacity: 0.6; }
      .chat-msg { max-width: 80%; padding: 0.5rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; word-break: break-word; }
      .chat-msg.mine { align-self: flex-end; background: #25d366; color: white; border-bottom-right-radius: 4px; }
      .chat-msg.admin { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
      .chat-input-row { display: flex; gap: 0.4rem; padding: 0.6rem; border-top: 1px solid var(--border-color); }
      .chat-input { flex: 1; padding: 0.5rem 0.8rem; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-text); font-size: 0.85rem; outline: none; }
      .chat-send { width: 36px; height: 36px; border-radius: 50%; background: #25d366; color: white; border: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
      .chat-send:disabled { opacity: 0.4; }
      @media (max-width: 400px) { .chat-box { width: calc(100vw - 40px); } }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private chatService = inject(ChatService);

  chatOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  chatText = '';
  private chatId = '';
  private unsub: any;

  ngOnInit() {
    this.auth.loginAnonymous();
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  async toggleChat() {
    this.chatOpen.update(v => !v);
    if (this.chatOpen() && !this.chatId) {
      const user = this.auth.user();
      if (!user || user.isAnonymous) return;
      this.chatId = await this.chatService.getOrCreateChat(
        user.uid, user.displayName || 'Cliente', user.email || ''
      );
      await this.chatService.markRead(this.chatId, false);
      this.unsub = this.chatService.listenMessages(this.chatId, (msgs) => {
        this.messages.set(msgs);
      });
    }
  }

  async sendMessage() {
    if (!this.chatText.trim() || !this.chatId) return;
    const user = this.auth.user();
    if (!user) return;
    await this.chatService.sendMessage(this.chatId, user.uid, user.displayName || 'Cliente', this.chatText.trim(), false);
    this.chatText = '';
  }
}
