import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC07d7Q7kuo32Loo54Hlmcm4gNAedTuR5I',
  authDomain: 'webart-a0b2d.firebaseapp.com',
  projectId: 'webart-a0b2d',
  storageBucket: 'webart-a0b2d.appspot.com',
  messagingSenderId: '269338612242',
  appId: '1:269338612242:web:a52159353a1eddc7ddfecb',
};

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }
}
