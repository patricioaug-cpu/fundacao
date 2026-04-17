import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter } from 'date-fns';

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

interface UserData {
  id: string;
  name: string;
  email: string;
  device_serial: string;
  role: 'USER' | 'ADMIN';
  status: 'TRIAL' | 'LIBERADO' | 'BLOQUEADO';
  trial_start_at: any;
  trial_end_at: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isTrialExpired: boolean;
  isAdmin: boolean;
  deviceSerial: string;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceSerial, setDeviceSerial] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    // Get or generate device serial
    let serial = localStorage.getItem('fundacao_device_serial');
    if (!serial) {
      serial = uuidv4();
      localStorage.setItem('fundacao_device_serial', serial);
    }
    setDeviceSerial(serial);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const newUserData: Partial<UserData> = {
              id: currentUser.uid,
              name: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              device_serial: serial!,
              role: currentUser.email === 'patricioaug@gmail.com' ? 'ADMIN' : 'USER',
              status: 'TRIAL',
              trial_start_at: serverTimestamp(),
              trial_end_at: addDays(new Date(), 7),
            };

            await setDoc(userRef, newUserData);
            setUserData(newUserData as UserData);

            // Notify Admin via Backend
            fetch('/api/notify-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: newUserData.name,
                email: newUserData.email,
                deviceSerial: serial
              })
            });
          } else {
            const data = userSnap.data() as UserData;
            setUserData(data);

            // Update login history
            await setDoc(doc(db, `users/${currentUser.uid}/logins`, uuidv4()), {
              login_at: serverTimestamp(),
              device_serial: serial
            });

            // Notify Admin
            fetch('/api/notify-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                deviceSerial: serial
              })
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => auth.signOut();

  const isTrialExpired = userData?.status === 'TRIAL' && 
    userData.trial_end_at && 
    isAfter(new Date(), userData.trial_end_at.toDate ? userData.trial_end_at.toDate() : new Date(userData.trial_end_at));

  const isAdmin = userData?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, userData, loading, isTrialExpired, isAdmin, deviceSerial, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
