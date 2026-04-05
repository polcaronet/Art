import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Art, ArtService } from '../../services/art.service';

@Component({
  selector: 'app-art-detail',
  standalone: true,
  template: `
    @if (art(); as a) {
      <div class="detail">
        <div class="images">
          @for (img of a.images; track img.name) {
            <img [src]="img.url" alt="Quadro" class="detail-img" />
          }
        </div>
        <div class="info">
          <h1>{{ a.name }}</h1>
          <p class="subtitle">Óleo sobre tela</p>
          <div class="meta">
            <div>
              <span class="label">Cidade</span>
              <strong>{{ a.city }}</strong>
            </div>
            <div>
              <span class="label">Ano</span>
              <strong>{{ a.year }}</strong>
            </div>
            <div>
              <span class="label">Medidas</span>
              <strong>{{ a.cm }} cm</strong>
            </div>
          </div>
          @if (a.type === 'sale' && a.whatsapp) {
            <p class="phone-label">Telefone / WhatsApp</p>
            <p>{{ a.whatsapp }}</p>
            <a
              [href]="
                'https://api.whatsapp.com/send/?phone=' +
                a.whatsapp +
                '&text=Olá, vi o quadro ' +
                a.name +
                ' na galeria e fiquei interessado!'
              "
              target="_blank"
              class="btn-whatsapp"
            >
              Preço a Combinar 📱
            </a>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .detail {
        max-width: 900px;
        margin: 0 auto;
      }
      .images {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        margin-bottom: 1.5rem;
      }
      .detail-img {
        max-height: 450px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .info {
        background: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 10px;
      }
      .info h1 {
        font-size: 2rem;
        margin-bottom: 0.3rem;
      }
      .subtitle {
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }
      .meta {
        display: flex;
        gap: 2rem;
        margin-bottom: 1.5rem;
      }
      .label {
        display: block;
        color: var(--text-secondary);
        font-size: 0.85rem;
      }
      .phone-label {
        font-weight: 600;
        margin-top: 1rem;
      }
      .btn-whatsapp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: #22c55e;
        color: white;
        padding: 0.8rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1.1rem;
        margin-top: 1rem;
        text-align: center;
      }
      .btn-whatsapp:hover {
        background: #16a34a;
      }
    `,
  ],
})
export class ArtDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private artService = inject(ArtService);

  art = signal<Art | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    const art = await this.artService.getById(id);
    if (!art) {
      this.router.navigate(['/']);
      return;
    }
    this.art.set(art);
  }
}
