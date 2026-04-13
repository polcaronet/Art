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
            <span>🎨 Atelier Virtual</span>
            @if (messages().length > 0 && !confirmClear()) {
              <button class="btn-clear" title="Limpar conversa" (click)="confirmClear.set(true)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            }
            @if (confirmClear()) {
              <div class="confirm-clear">
                <span>Apagar tudo?</span>
                <button class="btn-yes" (click)="clearChat()">Sim</button>
                <button class="btn-no" (click)="confirmClear.set(false)">Não</button>
              </div>
            }
          </div>
          <div class="chat-messages" #chatMessages>
            @if (messages().length === 0) {
              <div class="chat-welcome">
                <span class="welcome-icon">🎨</span>
                <p class="welcome-title">Bem-vindo ao Atelier!</p>
                <p class="chat-empty">Envie uma mensagem para iniciar o atendimento.</p>
              </div>
            }
            @for (msg of messages(); track msg.id) {
              <div class="chat-msg" [class.mine]="!msg.fromAdmin" [class.admin]="msg.fromAdmin">
                <span class="msg-text" [innerHTML]="formatMessage(msg.text)"></span>
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
      .container > * { display: block; width: 100%; }
      .support-fab {
        position: fixed; bottom: 20px; right: 20px; z-index: 1000;
        display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;
      }
      .fab-btn {
        width: 56px; height: 56px; border-radius: 50%; background: var(--chat-fab);
        color: white; font-size: 1.5rem; border: none; cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25); transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      .fab-btn:hover { transform: scale(1.1); }
      .chat-box {
        width: 340px; height: 440px; background: var(--bg-card);
        border: 1px solid var(--border-color); border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        display: flex; flex-direction: column; overflow: hidden; order: -1;
      }
      .chat-header {
        background: var(--chat-header);
        color: white; padding: 0.8rem 1rem; font-weight: 700; font-size: 0.95rem;
        display: flex; justify-content: space-between; align-items: center;
      }
      .btn-clear {
        background: rgba(255,255,255,0.15); border: none; color: white;
        cursor: pointer; padding: 0.35rem; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.2s;
      }
      .btn-clear:hover { background: rgba(255,255,255,0.3); }
      .confirm-clear {
        display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem;
      }
      .confirm-clear span { opacity: 0.9; }
      .btn-yes, .btn-no {
        padding: 0.2rem 0.6rem; border-radius: 6px; border: none;
        font-size: 0.75rem; font-weight: 600; cursor: pointer;
      }
      .btn-yes { background: white; color: var(--chat-header); }
      .btn-yes:hover { background: #fee; }
      .btn-no { background: rgba(255,255,255,0.2); color: white; }
      .btn-no:hover { background: rgba(255,255,255,0.35); }
      .chat-messages {
        flex: 1; overflow-y: auto; padding: 0.8rem;
        display: flex; flex-direction: column; gap: 0.4rem;
      }
      .chat-welcome {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; margin-top: 3rem; gap: 0.3rem;
      }
      .welcome-icon { font-size: 2.5rem; }
      .welcome-title { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
      .chat-empty { text-align: center; color: var(--text-secondary); font-size: 0.8rem; opacity: 0.6; }
      .chat-msg { max-width: 88%; padding: 0.5rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; word-break: break-word; }
      .chat-msg.mine { align-self: flex-end; background: var(--chat-bubble); color: white; border-bottom-right-radius: 4px; }
      .chat-msg.admin { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
      .chat-msg ::ng-deep .chat-link { color: #2563eb; text-decoration: underline; word-break: break-all; }
      .chat-msg.mine ::ng-deep .chat-link { color: #fca5a5; }
      .chat-msg ::ng-deep .chat-btn { display: inline-block; padding: 0.35rem 0.7rem; border-radius: 16px; font-size: 0.78rem; font-weight: 600; text-decoration: none; margin: 0.2rem 0.15rem; }
      .chat-msg ::ng-deep .chat-btn.site { background: #2563eb; color: white; }
      .chat-msg ::ng-deep .chat-btn.wpp { background: #25d366; color: white; }
      .chat-msg ::ng-deep .chat-btn:not(.site):not(.wpp) { background: var(--btn-primary, #3b82f6); color: white; }
      .chat-msg ::ng-deep .chat-btn:hover { opacity: 0.85; }
      .chat-input-row { display: flex; gap: 0.4rem; padding: 0.6rem; border-top: 1px solid var(--border-color); }
      .chat-input { flex: 1; padding: 0.5rem 0.8rem; border: 1px solid var(--border-color); border-radius: 20px; background: var(--input-bg); color: var(--input-text); font-size: 0.85rem; outline: none; }
      .chat-send {
        width: 36px; height: 36px; border-radius: 50%;
        background: var(--chat-send);
        color: white; border: none; cursor: pointer; font-size: 1rem;
        display: flex; align-items: center; justify-content: center;
      }
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
  confirmClear = signal(false);
  chatText = '';
  private chatId = '';
  private unsub: any;

  ngOnInit() {
    this.auth.loginAnonymous();
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  async clearChat() {
    if (this.chatId) {
      await this.chatService.clearMessages(this.chatId);
    }
    this.messages.set([]);
    this.confirmClear.set(false);
  }

  formatMessage(text: string): string {
    let clean = text;
    // Remove tabelas markdown — converte linhas | col1 | col2 | em lista limpa
    clean = clean.replace(/\|[-\s|]+\|/g, ''); // remove linhas separadoras |---|---|
    clean = clean.replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);
      return cells.join(' · ');
    });
    clean = clean.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => {
      if (url.includes('wa.me')) return `<a href="${url}" target="_blank" class="chat-btn wpp">📱 ${label}</a>`;
      if (url.includes('art-five-rho')) return `<a href="${url}" target="_blank" class="chat-btn site">🎨 ${label}</a>`;
      return `<a href="${url}" target="_blank" class="chat-btn">🔗 ${label}</a>`;
    });
    clean = clean.replace(/(?<![">])\((\d{2})\)\s?(\d{4,5})-(\d{4})(?![^<]*<\/a>)/g,
      '<a href="https://wa.me/55$1$2$3" target="_blank" class="chat-btn wpp">📱 ($1) $2-$3</a>');
    // Links de obras individuais — tenta extrair nome da obra do texto antes
    clean = clean.replace(/(\d+\.\s*)?(?:\*\*)?([A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+?)(?:\*\*)?\s*(?:\([^)]*\))?\s*[-–]?\s*[^<\n]*?(https:\/\/art-five-rho\.vercel\.app\/art\/[^\s<,)"]+)/gi,
      (match, num, name, url) => {
        const cleanName = name.trim();
        const prefix = num ? num : '';
        return `${prefix}<a href="${url}" target="_blank" class="chat-btn site">🖼️ ${cleanName}</a>`;
      });
    // Fallback: links de obras soltos sem nome antes
    clean = clean.replace(/(?<!["=])(https:\/\/art-five-rho\.vercel\.app\/art\/[^\s<,)"]+)/g,
      '<a href="$1" target="_blank" class="chat-btn site">🖼️ Ver obra</a>');
    // Remove "Ver:" ou "Ver obra:" ou "Link:" que sobra antes do botão
    clean = clean.replace(/(?:Ver(?:\s+obra)?|Link)\s*:?\s*(?=<a )/gi, '');
    clean = clean.replace(/(?<!["=])(https:\/\/art-five-rho\.vercel\.app[^\s<,)"]*)/g, (m) => {
      if (m.includes('/art/')) return m; // já tratado acima
      if (m.includes('/sale')) return '<a href="' + m + '" target="_blank" class="chat-btn site">🎨 Ver Quadros</a>';
      if (m.includes('/register')) return '<a href="' + m + '" target="_blank" class="chat-btn site">📝 Cadastre-se</a>';
      return '<a href="' + m + '" target="_blank" class="chat-btn site">🏠 Visitar Site</a>';
    });
    clean = clean.replace(/(?<!["=])(https:\/\/wa\.me\/\d+[^\s<,)"]*)/g,
      '<a href="$1" target="_blank" class="chat-btn wpp">📱 WhatsApp</a>');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    clean = clean.replace(/#{1,3}\s?/g, '');
    // Limpa linhas vazias extras
    clean = clean.replace(/\n{3,}/g, '\n\n');
    clean = clean.replace(/\n/g, '<br>');
    return clean;
  }

  async toggleChat() {
    this.chatOpen.update(v => !v);
    if (this.chatOpen() && !this.chatId) {
      const user = this.auth.user();
      if (user && !user.isAnonymous) {
        this.chatId = await this.chatService.getOrCreateChat(
          user.uid, user.displayName || 'Cliente', user.email || ''
        );
        await this.chatService.markRead(this.chatId, false);
        this.unsub = this.chatService.listenMessages(this.chatId, (msgs) => {
          this.messages.set(msgs);
        });
      }
    }
  }

  async sendMessage() {
    if (!this.chatText.trim()) return;

    const text = this.chatText.trim();
    this.chatText = '';
    const user = this.auth.user();

    const userMsg: ChatMessage = {
      id: Date.now().toString(), chatId: '', uid: user?.uid || 'anon',
      userName: user?.displayName || 'Visitante', text, fromAdmin: false, created: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);

    if (this.chatId && user && !user.isAnonymous) {
      await this.chatService.sendMessage(this.chatId, user.uid, user.displayName || 'Cliente', text, false);
    }

    try {
      const history = this.messages().map(m => ({ text: m.text, fromAdmin: m.fromAdmin, fromAI: m.fromAdmin }));
      const res = await fetch('https://webart-backend-polcaronet9724-1mowec7v.leapcell.dev/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(), chatId: '', uid: 'ai',
          userName: 'Assistente', text: data.reply, fromAdmin: true, created: new Date()
        };
        this.messages.update(msgs => [...msgs, aiMsg]);
        if (this.chatId && user && !user.isAnonymous) {
          await this.chatService.sendMessage(this.chatId, 'ai', 'Assistente IA', data.reply, true);
        }
      }
    } catch (e) {
      console.error('Erro IA:', e);
    }
  }
}
