
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
    onLogin: (user: { id: string; email: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegistering) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user) onLogin({ id: data.user.id, email: data.user.email! });
                else alert('Check your email for confirmation link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) onLogin({ id: data.user.id, email: data.user.email! });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05070a] relative overflow-hidden">
            <div className="mesh-gradient" />

            <div className="glass-panel w-full max-w-md p-10 border-white/5 shadow-2xl animate-fade-in relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-500/20 mb-6 rotate-3">
                        L
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Nexus CRM</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Intelligent Protocol Entry</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-8 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Identity</label>
                        <input
                            type="email"
                            required
                            placeholder="email@nexus.com"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500 outline-none transition-all font-bold"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500 outline-none transition-all font-bold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 uppercase text-xs tracking-widest mt-8 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : isRegistering ? 'Create Master Account' : 'Authorize Access'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {isRegistering ? 'Already have account? Sign In' : 'Need authorization? Register'}
                    </button>
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                        "Everything should be made as simple as possible, but not simpler."
                    </p>
                </div>
            </div>
        </div>
    );
};
