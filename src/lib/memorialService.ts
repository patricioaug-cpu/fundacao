import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { CalculationResult, CalculationInput } from '../calculations/engine';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveMemorial(input: CalculationInput, result: CalculationResult) {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Você precisa estar autenticado para salvar o memorial.');
  }

  const path = `users/${user.uid}/memorials`;
  try {
    const memorialData = {
      foundationType: result.foundationType,
      justification: result.justification,
      calculationMemory: result.calculationMemory,
      settlementAnalysis: result.settlementAnalysis,
      loadKN: input.loadKN,
      nspt: input.nspt,
      // Store full objects for viewing later
      inputData: input,
      resultData: result,
      created_at: serverTimestamp(),
      userId: user.uid
    };

    const memorialsRef = collection(db, path);
    const docRef = await addDoc(memorialsRef, memorialData);
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getMemorials() {
  const user = auth.currentUser;
  if (!user) return [];

  const path = `users/${user.uid}/memorials`;
  try {
    const q = query(collection(db, path), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateMemorial(memorialId: string, data: any) {
  const user = auth.currentUser;
  if (!user) throw new Error('Auth required');

  const path = `users/${user.uid}/memorials/${memorialId}`;
  try {
    const docRef = doc(db, 'users', user.uid, 'memorials', memorialId);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMemorial(memorialId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Auth required');

  const path = `users/${user.uid}/memorials/${memorialId}`;
  try {
    const docRef = doc(db, 'users', user.uid, 'memorials', memorialId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
