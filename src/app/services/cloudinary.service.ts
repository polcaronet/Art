import { Injectable } from '@angular/core';

// ⚠️ PREENCHA COM SEUS DADOS DO CLOUDINARY
// 1. Acesse https://console.cloudinary.com
// 2. Copie seu Cloud Name do dashboard
// 3. Vá em Settings > Upload > Upload Presets > Add unsigned preset
const CLOUD_NAME = 'dktir0vuo';
const UPLOAD_PRESET = 'gallery_unsigned';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  async upload(file: File, folder = 'gallery'): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Erro ao enviar imagem para o Cloudinary');
    }

    return res.json();
  }

  async deleteByUrl(_url: string): Promise<void> {
    // Deletar no Cloudinary requer API server-side (com api_secret)
    // Para deletar, use o painel do Cloudinary ou crie uma Cloud Function
    console.warn('Deletar imagem do Cloudinary requer backend. Remova manualmente no painel.');
  }
}
