import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth, guestId } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Registrarse';
        return () => { document.title = 'Trello Clone'; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            const response = await register(email, password);
            setAuth(response.data.user);

            // Clear guestId after successful registration
            localStorage.removeItem('guestId');

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Error al registrarse');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#17191C] text-slate-100 antialiased font-sans">
            {/* Register Card Container */}
            <div className="relative z-10 w-full max-w-md px-6 py-12">
                <div className="flex flex-col items-center mb-8">
                    {/* Logo area */}
                    <Link to="/" className="mb-4">
                        <img 
                            src="/Logo Trello Clone.png" 
                            alt="Trello Clone Logo" 
                            className="h-12 w-auto object-contain select-none"
                            draggable="false"
                        />
                    </Link>
                    <p className="text-slate-300 font-medium">Regístrate para continuar</p>
                </div>

                {/* Card */}
                <div className="bg-[#1d2125] border border-[#38414a] rounded-sm shadow-xl p-10">
                    {guestId && (
                        <div className="mb-6 px-4 py-3 bg-[#132A52] border border-[#2b5ba3] rounded-[3px] text-[#80afff] text-sm font-medium flex items-center justify-center gap-2">
                            <span className="material-icons-outlined text-[18px]">info</span>
                            Tus tableros actuales se guardarán automáticamente
                        </div>
                    )}

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
                                    placeholder="Introduce una contraseña"
                                    required
                                    minLength={6}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-200" htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <div className="relative">
                                <input
                                    className="w-full h-10 bg-[#22272b] border-2 border-[#38414a] rounded-[3px] px-3 text-[#b6c2cf] placeholder:text-[#8c9bab] focus:outline-none focus:border-[#388bff] transition-all"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Repite tu contraseña"
                                    required
                                    minLength={6}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Register Button */}
                        <button 
                            disabled={isLoading}
                            className={`w-full h-10 bg-[#0052CC] hover:bg-[#0747a6] text-white font-bold rounded-[3px] transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                            type="submit"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinner size="sm" color="text-white" />
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                'Registrarse'
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-6 pt-6 border-t border-[#38414a] text-center">
                        <p className="text-slate-400 text-sm">¿Ya tienes cuenta? <Link className="text-[#388bff] hover:underline" to="/login">Inicia sesión</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
