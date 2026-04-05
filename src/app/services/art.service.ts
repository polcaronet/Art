import { Injectable } from '@angular/core';
import {
  collection,
  query,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  increment,
  orderBy,
  where,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { CloudinaryService } from './cloudinary.service';

export interface ArtImage {
  name: string;
  uid: string;
  url: string;
}

export interface Art {
  id: string;
  name: string;
  year: string;
  city: string;
  cm: string;
  whatsapp?: string;
  price?: string;
  type: 'showcase' | 'sale';
  status?: 'available' | 'order' | 'sold';
  views?: number;
  likes?: number;
  uid: string;
  images: ArtImage[];
}

@Injectable({ providedIn: 'root' })
export class ArtService {
  constructor(
    private fb: FirebaseService,
    private cloudinary: CloudinaryService
  ) { }

  async getAll(): Promise<Art[]> {
    const q = query(
      collection(this.fb.firestore, 'arts'),
      orderBy('created', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Art));
  }

  async search(term: string): Promise<Art[]> {
    const q = query(
      collection(this.fb.firestore, 'arts'),
      where('name', '>=', term.toUpperCase()),
      where('name', '<=', term.toUpperCase() + '\uf8ff')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Art));
  }

  async getById(id: string): Promise<Art | null> {
    const snap = await getDoc(doc(this.fb.firestore, 'arts', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Art;
  }

  async getByUser(uid: string): Promise<Art[]> {
    const q = query(
      collection(this.fb.firestore, 'arts'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Art));
  }

  /** Upload via Cloudinary, retorna ArtImage com URL do Cloudinary */
  async uploadImage(uid: string, file: File): Promise<ArtImage> {
    const result = await this.cloudinary.upload(file, 'gallery');
    return {
      name: result.public_id,
      uid,
      url: result.secure_url,
    };
  }

  async create(data: {
    name: string;
    year: string;
    cm: string;
    city: string;
    whatsapp: string;
    type?: string;
    status?: string;
    price?: string;
    uid: string;
    images: ArtImage[];
  }) {
    const doc: any = {
      name: data.name.toUpperCase(),
      year: data.year,
      cm: data.cm,
      city: data.city,
      whatsapp: data.whatsapp,
      type: data.type || 'showcase',
      uid: data.uid,
      owner: data.uid,
      images: data.images,
      created: new Date(),
      views: 0,
      likes: 0,
    };
    if (data.status) doc.status = data.status;
    if (data.price) doc.price = data.price;
    return addDoc(collection(this.fb.firestore, 'arts'), doc);
  }

  async update(id: string, data: Partial<Art>) {
    const clean: any = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) clean[key] = val;
    }
    return updateDoc(doc(this.fb.firestore, 'arts', id), clean);
  }

  async delete(art: Art) {
    await deleteDoc(doc(this.fb.firestore, 'arts', art.id));
    for (const img of art.images) {
      await this.cloudinary.deleteByUrl(img.url);
    }
  }

  async addView(artId: string) {
    const key = `viewed_${artId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    await updateDoc(doc(this.fb.firestore, 'arts', artId), {
      views: increment(1),
    });
  }

  async toggleLike(artId: string, uid: string): Promise<boolean> {
    const likeRef = doc(this.fb.firestore, 'arts', artId, 'likes', uid);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      const { deleteDoc: delDoc } = await import('firebase/firestore');
      await delDoc(likeRef);
      await updateDoc(doc(this.fb.firestore, 'arts', artId), {
        likes: increment(-1),
      });
      return false;
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(likeRef, { created: new Date() });
      await updateDoc(doc(this.fb.firestore, 'arts', artId), {
        likes: increment(1),
      });
      return true;
    }
  }

  async hasLiked(artId: string, uid: string): Promise<boolean> {
    const snap = await getDoc(doc(this.fb.firestore, 'arts', artId, 'likes', uid));
    return snap.exists();
  }
}
