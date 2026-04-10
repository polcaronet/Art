import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArtImage, ArtService } from '../../../services/art.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="admin-header">
      <a routerLink="/admin" class="tab">Dashboard</a>
      <a routerLink="/admin/upload" class="tab active">Upload</a>
      <a routerLink="/admin/edit" class="tab">Editar</a>
      <a routerLink="/admin/orders" class="tab">Pedidos</a>
      <a routerLink="/admin/chat" class="tab">Mensagens</a>
    </div>

    <div class="upload-area">
      <div class="images-preview">
        @if (images().length === 0) {
        <label class="upload-btn">
          <span>+</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            (change)="onFileSelect($event)"
            hidden
          />
        </label>
        }
        @for (img of images(); track img.name) {
          <div class="preview-item">
            <button class="btn-remove" (click)="removeImage(img)">✕</button>
            <img [src]="img.url" alt="Preview" />
          </div>
        }
      </div>
      @if (uploading()) {
        <p class="uploading">Enviando imagem...</p>
      }
    </div>

    <form class="form" (ngSubmit)="onSubmit()">
      <div class="row">
        <div class="field">
          <label>Nome do Quadro</label>
          <input
            type="text"
            [(ngModel)]="name"
            name="name"
            placeholder="Ex: Violinista"
            class="input"
            required
          />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Ano</label>
          <input
            type="text"
            [(ngModel)]="year"
            name="year"
            placeholder="Ex: 2015"
            class="input"
            required
          />
        </div>
        <div class="field">
          <label>Dimensões (cm)</label>
          <input
            type="text"
            [(ngModel)]="cm"
            name="cm"
            placeholder="Ex: 50 x 40"
            class="input"
            required
          />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>WhatsApp</label>
          <input
            type="text"
            [(ngModel)]="whatsapp"
            name="whatsapp"
            placeholder="Ex: 5521996710902"
            class="input"
            required
          />
        </div>
        <div class="field">
          <label>Cidade</label>
          <input
            type="text"
            [(ngModel)]="city"
            name="city"
            placeholder="Ex: Maricá - RJ"
            class="input"
            required
          />
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Tipo</label>
          <select [(ngModel)]="artType" name="artType" class="input">
            <option value="showcase">Mostruário</option>
            <option value="sale">À Venda</option>
          </select>
        </div>
        @if (artType === 'sale') {
          <div class="field">
            <label>Status</label>
            <select [(ngModel)]="artStatus" name="artStatus" class="input">
              <option value="available">Disponível</option>
              <option value="order">Encomenda</option>
              <option value="sold">Vendido</option>
            </select>
          </div>
          <div class="field">
            <label>Preço (R$)</label>
            <input
              type="text"
              [(ngModel)]="price"
              name="price"
              placeholder="Ex: 1500.00"
              class="input"
            />
          </div>
        }
      </div>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (success()) {
        <p class="success">{{ success() }}</p>
      }

      <button type="submit" class="btn-submit" [disabled]="submitting()">
        {{ submitting() ? 'Cadastrando...' : 'Cadastrar' }}
      </button>
    </form>
  `,
  styles: [
    `
      .admin-header {
        display: flex;
        gap: 0.5rem;
        background: var(--accent);
        padding: 0.6rem 1rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
      }
      .tab {
        color: white;
        font-weight: 600;
        padding: 0.4rem 1rem;
        border-radius: 6px;
      }
      .tab.active,
      .tab:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .upload-area {
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        border: 1px solid var(--border-color);
      }
      .images-preview {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }
      .upload-btn {
        width: 120px;
        height: 120px;
        border: 2px dashed var(--border-color);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 2.5rem;
        color: var(--text-secondary);
        transition: all 0.2s;
      }
      .upload-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: rgba(0, 0, 0, 0.03);
      }
      .preview-item {
        position: relative;
        width: 120px;
        height: 120px;
      }
      .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
      }
      .btn-remove {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uploading {
        color: var(--text-secondary);
        margin-top: 0.5rem;
      }
      .form {
        background: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 10px;
      }
      .row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .field {
        flex: 1;
      }
      .field label {
        display: block;
        margin-bottom: 0.4rem;
        font-weight: 500;
        color: var(--text-secondary);
      }
      .input {
        width: 100%;
        padding: 0.7rem 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        background: var(--input-bg);
        color: var(--input-text);
      }
      .error {
        color: #f87171;
        margin-bottom: 0.5rem;
      }
      .success {
        color: #4ade80;
        margin-bottom: 0.5rem;
      }
      .btn-submit {
        width: 100%;
        padding: 0.8rem;
        background: #18181b;
        color: white;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.05rem;
        margin-top: 0.5rem;
      }
      .btn-submit:hover {
        background: #27272a;
      }
      .btn-submit:disabled {
        opacity: 0.6;
      }
      @media (max-width: 600px) {
        .row {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class UploadComponent {
  private artService = inject(ArtService);
  private auth = inject(AuthService);
  private router = inject(Router);

  images = signal<ArtImage[]>([]);
  uploading = signal(false);
  submitting = signal(false);
  error = signal('');
  success = signal('');

  name = '';
  year = '';
  cm = '';
  city = '';
  whatsapp = '';
  artType: 'showcase' | 'sale' = 'showcase';
  artStatus: 'available' | 'order' | 'sold' = 'available';
  price = '';

  async onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      this.error.set('Envie apenas imagens JPEG ou PNG.');
      return;
    }

    const uid = this.auth.user()?.uid;
    if (!uid) return;

    this.uploading.set(true);
    this.error.set('');
    try {
      const img = await this.artService.uploadImage(uid, file);
      this.images.update((list) => [...list, img]);
    } catch {
      this.error.set('Erro ao enviar imagem.');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removeImage(img: ArtImage) {
    this.images.update((list) => list.filter((i) => i.name !== img.name));
  }

  async onSubmit() {
    this.error.set('');
    this.success.set('');

    if (this.images().length === 0) {
      this.error.set('Envie pelo menos uma imagem.');
      return;
    }
    if (!this.name || !this.year || !this.cm || !this.city || !this.whatsapp) {
      this.error.set('Preencha todos os campos.');
      return;
    }

    const uid = this.auth.user()?.uid;
    if (!uid) return;

    this.submitting.set(true);
    try {
      await this.artService.create({
        name: this.name,
        year: this.year,
        cm: this.cm,
        city: this.city,
        whatsapp: this.whatsapp,
        type: this.artType,
        status: this.artType === 'sale' ? this.artStatus : undefined,
        price: this.artType === 'sale' ? this.price : undefined,
        uid,
        images: this.images(),
      });
      this.success.set('Quadro cadastrado com sucesso!');
      this.name = '';
      this.year = '';
      this.cm = '';
      this.city = '';
      this.whatsapp = '';
      this.artType = 'showcase';
      this.artStatus = 'available';
      this.price = '';
      this.images.set([]);
    } catch (e: any) {
      console.error('Erro ao cadastrar:', e);
      this.error.set(e?.message || 'Erro ao cadastrar quadro.');
    } finally {
      this.submitting.set(false);
    }
  }
}
