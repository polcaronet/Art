import { Injectable, signal, computed } from '@angular/core';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  deleteUser,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private loadingSignal = signal(true);
  private roleSignal = signal<'admin' | 'customer' | null>(null);

  user = this.userSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  role = this.roleSignal.asReadonly();
  signed = computed(() => !!this.userSignal());
  isAdmin = computed(() => this.roleSignal() === 'admin');
  isCustomer = computed(() => this.roleSignal() === 'customer');
  isLoggedIn = computed(() => {
    const u = this.userSignal();
    return !!u && !u.isAnonymous;
  });
  isAnonymous = computed(() => {
    const u = this.userSignal();
    return !!u && u.isAnonymous;
  });

  constructor(private fb: FirebaseService) {
    onAuthStateChanged(this.fb.auth, async (user) => {
      this.userSignal.set(user);
      if (user && !user.isAnonymous) {
        await this.loadRole(user.uid);
      } else {
        this.roleSignal.set(null);
      }
      this.loadingSignal.set(false);
    });
  }

  private async loadRole(uid: string) {
    const snap = await getDoc(doc(this.fb.firestore, 'users', uid));
    if (snap.exists()) {
      this.roleSignal.set(snap.data()['role'] || 'customer');
    } else {
      // Primeiro login com email/senha do admin (sem doc) = admin
      this.roleSignal.set('admin');
    }
  }

  async loginAnonymous() {
    // Espera o auth resolver o estado antes de criar anônimo
    await new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(this.fb.auth, () => {
        unsub();
        resolve();
      });
    });
    const current = this.fb.auth.currentUser;
    if (current) return; // já logado (real ou anônimo)
    await signInAnonymously(this.fb.auth);
  }

  async login(email: string, password: string) {
    const current = this.fb.auth.currentUser;
    if (current?.isAnonymous) {
      await deleteUser(current).catch(() => { });
    }
    return signInWithEmailAndPassword(this.fb.auth, email, password);
  }

  async loginWithGoogle() {
    const current = this.fb.auth.currentUser;
    if (current?.isAnonymous) {
      await deleteUser(current).catch(() => { });
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.fb.auth, provider);
    // Se não tem doc de user, cria como admin (primeiro Google login = admin)
    const snap = await getDoc(doc(this.fb.firestore, 'users', result.user.uid));
    if (!snap.exists()) {
      await setDoc(doc(this.fb.firestore, 'users', result.user.uid), {
        name: result.user.displayName || '',
        email: result.user.email || '',
        role: 'admin',
        created: new Date(),
      });
    }
    return result;
  }

  async register(name: string, email: string, password: string) {
    const current = this.fb.auth.currentUser;
    if (current?.isAnonymous) {
      await deleteUser(current).catch(() => { });
    }
    const cred = await createUserWithEmailAndPassword(this.fb.auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(this.fb.firestore, 'users', cred.user.uid), {
      name,
      email,
      role: 'customer',
      created: new Date(),
    });
    return cred;
  }

  async logout() {
    const user = this.fb.auth.currentUser;
    if (user?.isAnonymous) {
      await deleteUser(user).catch(() => { });
    } else {
      await signOut(this.fb.auth);
    }
    this.roleSignal.set(null);
    await signInAnonymously(this.fb.auth);
  }

  async updateUserProfile(displayName: string) {
    const user = this.fb.auth.currentUser;
    if (user && !user.isAnonymous) {
      await updateProfile(user, { displayName });
      this.userSignal.set({ ...user, displayName } as User);
    }
  }

  async cleanupAnonymous() {
    const user = this.fb.auth.currentUser;
    if (user?.isAnonymous) {
      await deleteUser(user).catch(() => { });
    }
  }
}
