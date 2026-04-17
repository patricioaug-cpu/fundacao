import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '@/src/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { HardHat, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!name) throw new Error("Nome é obrigatório");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success("Conta criada com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login realizado!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Insira seu e-mail para recuperar a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("E-mail de recuperação enviado!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-900/30 p-4 rounded-full border border-green-700/50">
              <HardHat className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter text-green-500 font-mono">
            FUNDAÇÃO
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Pré-Dimensionamento de Fundações Superficiais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <Input 
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 pl-10"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <Input 
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-6"
            >
              {loading ? "PROCESSANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR"}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-green-500 hover:underline"
            >
              {isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem conta? Cadastre-se"}
            </button>
            {!isSignUp && (
              <button 
                onClick={handleForgotPassword}
                className="text-xs text-zinc-500 hover:underline"
              >
                Esqueci minha senha
              </button>
            )}
          </div>

          <div className="space-y-2 text-sm text-zinc-500 pt-4 border-t border-zinc-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Conforme NBR 6122:2022</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Ao se cadastrar, você inicia o período de teste de 7 dias. 
              Uso exclusivo para fins de pré-dimensionamento técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
