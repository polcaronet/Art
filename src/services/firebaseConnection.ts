
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC07d7Q7kuo32Loo54Hlmcm4gNAedTuR5I",
  authDomain: "webart-a0b2d.firebaseapp.com",
  projectId: "webart-a0b2d",
  storageBucket: "webart-a0b2d.appspot.com",
  messagingSenderId: "269338612242",
  appId: "1:269338612242:web:a52159353a1eddc7ddfecb"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const auth = getAuth(app);
const storage = getStorage(app);

export { firestore, auth, storage };

