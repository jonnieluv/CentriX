import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc, onSnapshot, QueryConstraint, query } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized:", app);
console.log("Firestore Database ID:", firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Enforce inMemoryPersistence so browser refresh forces a manual login
setPersistence(auth, inMemoryPersistence).catch((err) => {
  console.warn("Failed to set inMemory persistence:", err);
});

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

let dbInstance: any;
export function getDb() {
  if (!dbInstance) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("DB instance created:", dbInstance);
  }
  return dbInstance;
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return signOut(auth);
}

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function fetchData(collectionName: string) {
  try {
    const db = getDb();
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}

export async function saveData(collectionName: string, id: string, data: any) {
  try {
    const db = getDb();
    await setDoc(doc(db, collectionName, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}
