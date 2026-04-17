import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck, UserX, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  status: 'TRIAL' | 'LIBERADO' | 'BLOQUEADO';
  trial_end_at: any;
  device_serial: string;
}

export default function AdminScreen({ onBack }: { onBack: () => void }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserRecord[];
      setUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserStatus = async (userId: string, status: 'LIBERADO' | 'BLOQUEADO' | 'TRIAL') => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-zinc-400">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold font-mono text-green-500">PAINEL ADMINISTRATIVO</h1>
      </header>

      <main className="max-w-6xl mx-auto">
        <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <CardHeader>
            <CardTitle>Gestão de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="border-zinc-800">
                <TableRow className="hover:bg-transparent border-zinc-800">
                  <TableHead className="text-zinc-400">Nome/Email</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Expira em</TableHead>
                  <TableHead className="text-zinc-400">Serial</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        user.status === 'LIBERADO' ? 'bg-green-900 text-green-300' :
                        user.status === 'BLOQUEADO' ? 'bg-red-900 text-red-300' :
                        'bg-blue-900 text-blue-300'
                      }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {user.trial_end_at ? 
                        format(user.trial_end_at.toDate ? user.trial_end_at.toDate() : new Date(user.trial_end_at), "dd/MM/yyyy", { locale: ptBR }) 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-zinc-600">
                      {user.device_serial?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {user.status !== 'LIBERADO' && (
                        <Button size="sm" variant="outline" className="border-green-800 text-green-500 hover:bg-green-900/20" onClick={() => updateUserStatus(user.id, 'LIBERADO')}>
                          <UserCheck className="w-4 h-4 mr-1" /> Liberar
                        </Button>
                      )}
                      {user.status !== 'BLOQUEADO' && (
                        <Button size="sm" variant="outline" className="border-red-800 text-red-500 hover:bg-red-900/20" onClick={() => updateUserStatus(user.id, 'BLOQUEADO')}>
                          <UserX className="w-4 h-4 mr-1" /> Bloquear
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
