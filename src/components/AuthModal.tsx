import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, gender: 'hombre' | 'mujer') => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onGoogleLogin, onEmailLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'hombre' | 'mujer'>('hombre');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await onEmailLogin(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        await onRegister(email, password, gender);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400"></div>
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
                </h2>
                <p className="text-gray-500">
                  {isLogin ? 'Bienvenido a Florería Magaly' : 'Únete a nuestra comunidad floral'}
                </p>
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                  <input 
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                  <input 
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all"
                    required
                  />
                </div>
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <input 
                          type="password"
                          placeholder="Repetir contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setGender('hombre')}
                          className={`flex-1 py-2 rounded-xl font-semibold border-2 transition-all ${gender === 'hombre' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600'}`}
                        >
                          Hombre
                        </button>
                        <button 
                          type="button"
                          onClick={() => setGender('mujer')}
                          className={`flex-1 py-2 rounded-xl font-semibold border-2 transition-all ${gender === 'mujer' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600'}`}
                        >
                          Mujer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-2xl font-semibold hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20"
                >
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
                </button>
              </form>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-medium">O continúa con</span>
                </div>
              </div>

              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onGoogleLogin();
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="ml-2 text-rose-600 font-bold hover:underline"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
