import { Injectable, signal, computed } from '@angular/core';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  deleteUser,
  updateProfile,
  User,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private loadingSignal = signal(true);

  user = this.userSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  signed = computed(() => !!this.userSignal());
  isAdmin = computed(() => {
    const u = this.userSignal();
    return !!u && !u.isAnonymous;
  });
  isAnonymous = computed(() => {
    const u = this.userSignal();
    return !!u && u.isAnonymous;
  });

  constructor(private fb: FirebaseService) {
    onAuthStateChanged(this.fb.auth, (user) => {
      this.userSignal.set(user);
      this.loadingSignal.set(false);
    });

    // Limpa usuário anônimo ao fechar a página
    window.addEventListener('beforeunload', () => {
      const user = this.fb.auth.currentUser;
      if (user?.isAnonymous) {
        // sendBeacon garante que a request saia antes da página fechar
        // mas deleteUser é a melhor opção aqui
        deleteUser(user).catch(() => { });
      }
    });
  }

  /** Login anônimo temporário para visitantes */
  async loginAnonymous() {
    const current = this.fb.auth.currentUser;
    if (current) return; // já logado
    await signInAnonymously(this.fb.auth);
  }

  /** Login real para admin */
  async login(email: string, password: string) {
    const current = this.fb.auth.currentUser;
    if (current?.isAnonymous) {
      await deleteUser(current).catch(() => { });
    }
    return signInWithEmailAndPassword(this.fb.auth, email, password);
  }

  /** Login com Google para admin */
  async loginWithGoogle() {
    const current = this.fb.auth.currentUser;
    if (current?.isAnonymous) {
      await deleteUser(current).catch(() => { });
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.fb.auth, provider);
  }

  async logout() {
    const user = this.fb.auth.currentUser;
    if (user?.isAnonymous) {
      // Deleta o anônimo ao sair
      await deleteUser(user).catch(() => { });
    } else {
      await signOut(this.fb.auth);
    }
    // Re-cria sessão anônima para continuar navegando
    await signInAnonymously(this.fb.auth);
  }

  async updateUserProfile(displayName: string) {
    const user = this.fb.auth.currentUser;
    if (user && !user.isAnonymous) {
      await updateProfile(user, { displayName });
      this.userSignal.set({ ...user, displayName } as User);
    }
  }

  /** Limpa usuário anônimo manualmente (chamado no destroy se necessário) */
  async cleanupAnonymous() {
    const user = this.fb.auth.currentUser;
    if (user?.isAnonymous) {
      await deleteUser(user).catch(() => { });
    }
  }
}
