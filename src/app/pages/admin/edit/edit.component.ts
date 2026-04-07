import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Art, ArtService } from '../../../services/art.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="admin-header">
      <a routerLink="/admin" class="tab">Dashboard</a>
      <a routerLink="/admin/upload" class="tab">Upload</a>
      <a routerLink="/admin/edit" class="tab active">Editar</a>
      <a routerLink="/admin/orders" class="tab">Pedidos</a>
    </div>

    @if (!editing()) {
      <div class="grid">
        @for (art of arts(); track art.id) {
          <div class="card" (click)="startEdit(art)">
            <img [src]="art.images[0]?.url" alt="Quadro" class="card-img" />
            <div class="card-body">
              <p class="card-title">{{ art.name }}</p>
              <span class="card-info">{{ art.year }} | {{ art.cm }} cm</span>
            </div>
            <div class="card-overlay">✏️ Editar</div>
          </div>
        }
      </div>
      @if (arts().length === 0) {
        <p class="empty">Nenhum quadro para editar.</p>
      }
    } @else {
      <div class="edit-form">
        <h2>Editando: {{ editName }}</h2>

        <div class="edit-images">
          @for (img of editImages; track img.name) {
            <div class="img-item">
              <img [src]="img.url" alt="Preview" />
              <button class="btn-remove" (click)="removeImage(img)">✕</button>
            </div>
          }
          @if (editImages.length === 0) {
          <label class="upload-btn">
            <span>+</span>
            <input type="file" accept="image/jpeg,image/png" (change)="onAddImage($event)" hidden />
          </label>
          }
        </div>
        @if (uploading()) { <p class="uploading">Enviando imagem...</p> }

        <div class="fields">
          <div class="row">
            <div class="field">
              <label>Nome</label>
              <input type="text" [(ngModel)]="editName" name="name" class="input" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Ano</label>
              <input type="text" [(ngModel)]="editYear" name="year" class="input" />
            </div>
            <div class="field">
              <label>Dimensões (cm)</label>
              <input type="text" [(ngModel)]="editCm" name="cm" class="input" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Cidade</label>
              <input type="text" [(ngModel)]="editCity" name="city" class="input" />
            </div>
            <div class="field">
              <label>WhatsApp</label>
              <input type="text" [(ngModel)]="editWhatsapp" name="whatsapp" class="input" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Tipo</label>
              <select [(ngModel)]="editType" name="type" class="input">
                <option value="showcase">Mostruário</option>
                <option value="sale">À Venda</option>
              </select>
            </div>
            @if (editType === 'sale') {
              <div class="field">
                <label>Status</label>
                <select [(ngModel)]="editStatus" name="status" class="input">
                  <option value="available">Disponível</option>
                  <option value="order">Encomenda</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
              <div class="field">
                <label>Preço (R$)</label>
                <input type="text" [(ngModel)]="editPrice" name="price" class="input" />
              </div>
            }
          </div>
        </div>

        @if (error()) { <p class="error">{{ error() }}</p> }
        @if (success()) { <p class="success">{{ success() }}</p> }

        <div class="actions">
          <button class="btn-save" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Salvando...' : 'Salvar' }}
          </button>
          <button class="btn-cancel" (click)="cancelEdit()">Cancelar</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-header { display: flex; gap: 0.5rem; background: var(--accent); padding: 0.6rem 1rem; border-radius: 10px; margin-bottom: 1.5rem; }
    .tab { color: white; font-weight: 600; padding: 0.4rem 1rem; border-radius: 6px; }
    .tab.active, .tab:hover { background: rgba(255,255,255,0.2); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .card { background: var(--bg-card); border-radius: 10px; overflow: hidden; cursor: pointer; position: relative; transition: transform 0.2s; }
    .card:hover { transform: translateY(-3px); }
    .card-img { width: 100%; aspect-ratio: 4/3; object-fit: contain; display: block; background: rgba(0,0,0,0.3); }
    .card-body { padding: 0.8rem; }
    .card-title { font-weight: 700; margin-bottom: 0.2rem; }
    .card-info { color: var(--text-secondary); font-size: 0.85rem; }
    .card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600; opacity: 0; transition: opacity 0.2s; }
    .card:hover .card-overlay { opacity: 1; }
    .empty { text-align: center; color: var(--text-secondary); margin-top: 3rem; }
    .edit-form { background: var(--bg-secondary); padding: 1.5rem; border-radius: 10px; }
    .edit-form h2 { margin-bottom: 1rem; font-size: 1.2rem; }
    .edit-images { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; justify-content: center; margin-bottom: 1rem; }
    .img-item { position: relative; width: 120px; height: 120px; }
    .img-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
    .btn-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
    .upload-btn { width: 120px; height: 120px; border: 2px dashed rgba(255,255,255,0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 2.5rem; color: rgba(255,255,255,0.4); transition: all 0.2s; }
    .upload-btn:hover { border-color: rgba(255,255,255,0.5); color: rgba(255,255,255,0.7); }
    .uploading { color: var(--text-secondary); text-align: center; margin-bottom: 0.5rem; }
    .fields { margin-top: 1rem; }
    .row { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .field { flex: 1; }
    .field label { display: block; margin-bottom: 0.4rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem; }
    .input { width: 100%; padding: 0.7rem 1rem; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; background: var(--input-bg); color: var(--input-text); }
    .error { color: #f87171; margin-bottom: 0.5rem; }
    .success { color: #4ade80; margin-bottom: 0.5rem; }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-save { flex: 1; padding: 0.8rem; background: #22c55e; color: white; border-radius: 8px; font-weight: 600; font-size: 1rem; }
    .btn-save:hover { background: #16a34a; }
    .btn-save:disabled { opacity: 0.6; }
    .btn-cancel { flex: 1; padding: 0.8rem; background: rgba(255,255,255,0.1); color: var(--text-secondary); border-radius: 8px; font-weight: 600; font-size: 1rem; }
    .btn-cancel:hover { background: rgba(255,255,255,0.15); }
    @media (max-width: 600px) { .row { flex-direction: column; } }
  `],
})
export class EditComponent implements OnInit {
  private artService = inject(ArtService);
  private auth = inject(AuthService);

  arts = signal<Art[]>([]);
  editing = signal(false);
  saving = signal(false);
  uploading = signal(false);
  error = signal('');
  success = signal('');

  editId = '';
  editName = '';
  editYear = '';
  editCm = '';
  editCity = '';
  editWhatsapp = '';
  editType = 'showcase';
  editStatus = 'available';
  editPrice = '';
  editImages: { name: string; uid: string; url: string }[] = [];

  async ngOnInit() {
    const uid = this.auth.user()?.uid;
    if (uid) this.arts.set(await this.artService.getByUser(uid));
  }

  startEdit(art: Art) {
    this.editId = art.id;
    this.editName = art.name;
    this.editYear = art.year;
    this.editCm = art.cm;
    this.editCity = art.city;
    this.editWhatsapp = art.whatsapp || '';
    this.editType = art.type || 'showcase';
    this.editStatus = art.status || 'available';
    this.editPrice = art.price || '';
    this.editImages = [...art.images];
    this.editing.set(true);
    this.error.set('');
    this.success.set('');
  }

  cancelEdit() {
    this.editing.set(false);
  }

  removeImage(img: { name: string; uid: string; url: string }) {
    this.editImages = this.editImages.filter((i) => i.name !== img.name);
  }

  async onAddImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const uid = this.auth.user()?.uid;
    if (!uid) return;
    this.uploading.set(true);
    try {
      const img = await this.artService.uploadImage(uid, file);
      this.editImages = [...this.editImages, img];
    } catch {
      this.error.set('Erro ao enviar imagem.');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async save() {
    this.error.set('');
    this.success.set('');
    if (this.editImages.length === 0) {
      this.error.set('Adicione pelo menos uma imagem.');
      return;
    }
    this.saving.set(true);
    try {
      const data: any = {
        name: this.editName.toUpperCase(),
        year: this.editYear,
        cm: this.editCm,
        city: this.editCity,
        whatsapp: this.editWhatsapp,
        type: this.editType,
        images: this.editImages,
      };
      if (this.editType === 'sale') {
        data.status = this.editStatus;
        data.price = this.editPrice;
      }
      await this.artService.update(this.editId, data);
      this.success.set('Quadro atualizado!');
      this.arts.update((list) =>
        list.map((a) => (a.id === this.editId ? { ...a, ...data } : a))
      );
    } catch (e: any) {
      this.error.set(e?.message || 'Erro ao salvar.');
    } finally {
      this.saving.set(false);
    }
  }
}
