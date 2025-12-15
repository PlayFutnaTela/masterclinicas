// Página de Login e Registro com Supabase Auth
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const supabase = createClient();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError("Email ou senha incorretos");
            } else {
                router.push(callbackUrl);
            }
        } catch {
            setError("Erro ao fazer login. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name.trim(),
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else if (data.user) {
                // Criar perfil na tabela public.user via API (usando service role)
                const response = await fetch("/api/auth/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: data.user.id,
                        name: name.trim(),
                        email: email.toLowerCase().trim(),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || "Erro ao salvar perfil. Tente novamente.");
                } else {
                    setSuccess("Conta criada com sucesso! Verifique seu email para confirmar a conta.");
                    setIsLogin(true);
                    setPassword("");
                    setConfirmPassword("");
                }
            }
        } catch {
            setError("Erro ao criar conta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">MasterClínicas</h1>
                    <p className="text-gray-500 mt-1">
                        {isLogin ? "Acesse sua área administrativa" : "Crie sua conta"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => {
                            setIsLogin(true);
                            setError("");
                            setSuccess("");
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => {
                            setIsLogin(false);
                            setError("");
                            setSuccess("");
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Criar Conta
                    </button>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
                        {!isLogin && (
                            <Input
                                label="Nome completo"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                required
                            />
                        )}

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Senha"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {!isLogin && (
                            <Input
                                label="Confirmar senha"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-600">{success}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            {isLogin ? "Entrar" : "Criar Conta"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-rose-600 hover:text-rose-700">
                            ← Voltar para o site
                        </Link>
                    </div>
                </div>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-800 text-center">
                        <strong>Demo:</strong> Use as credenciais do seed após rodar as migrations
                    </p>
                </div>
            </div>
        </div>
    );
}
