import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al iniciar sesion';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              Plataforma Academica
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Inicia sesion para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Contrasena"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={cargando}
            >
              {cargando ? 'Iniciando sesion...' : 'Iniciar sesion'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground text-center mb-2 uppercase tracking-wider">
              Credenciales de prueba
            </p>
            <div className="text-xs text-foreground/80 space-y-1.5 font-medium bg-accent/40 p-3 rounded-lg border border-border">
              <p><strong>Admin:</strong> admin@plataforma.edu.ar / admin123</p>
              <p><strong>Secretaria:</strong> secretaria@plataforma.edu.ar / secretaria123</p>
              <p><strong>Alumno:</strong> alumno0@plataforma.edu.ar / alumno123</p>
              <p><strong>Profesor:</strong> roberto.fernandez@plataforma.edu.ar / profesor123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}