import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login(email, password);
            setAuth(response.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#17191C] text-slate-100 antialiased font-sans">
            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-md px-6 py-12">
                <div className="flex flex-col items-center mb-8">
                    {/* Logo area */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#0052CC] rounded-[4px] p-[4px] flex gap-[2px]">
                            <div className="flex-1 bg-[#1d2125] rounded-[2px] h-[80%]"></div>
                            <div className="flex-1 bg-[#1d2125] rounded-[2px]"></div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">TaskFlow</h1>
                    </div>
                    <p className="text-slate-300 font-medium">Inicia sesión para continuar</p>
                </div>

                {/* Card */}
                <div className="bg-[#1d2125] border border-[#38414a] rounded-sm shadow-xl p-10">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-[3px] text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-200" htmlFor="email">Correo</label>
                            <div className="relative">
                                <input
                                    className="w-full h-10 bg-[#22272b] border-2 border-[#38414a] rounded-[3px] px-3 text-[#b6c2cf] placeholder:text-[#8c9bab] focus:outline-none focus:border-[#388bff] transition-all"
                                    id="email"
                                    name="email"
                                    placeholder="Introduce tu correo electrónico"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-200" htmlFor="password">Contraseña</label>
                            <div className="relative">
                                <input
                                    className="w-full h-10 bg-[#22272b] border-2 border-[#38414a] rounded-[3px] px-3 text-[#b6c2cf] placeholder:text-[#8c9bab] focus:outline-none focus:border-[#388bff] transition-all"
                                    id="password"
                                    name="password"
                                    placeholder="Introduce tu contraseña"
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button className="w-full h-10 bg-[#0052CC] hover:bg-[#0747a6] text-white font-bold rounded-[3px] transition-colors" type="submit">
                            Iniciar sesión
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-6 pt-6 border-t border-[#38414a] text-center">
                        <p className="text-slate-400 text-sm">¿No tienes una cuenta? <Link className="text-[#388bff] hover:underline" to="/register">Crear una cuenta</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
