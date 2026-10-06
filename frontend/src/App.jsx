import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { homePathFor, RUTAS_CELADOR } from './utils/roles';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estadisticas from './pages/Estadisticas';
import MiPerfil from './pages/MiPerfil';
import MisSolicitudes from './pages/MisSolicitudes';
import MisLicencias from './pages/MisLicencias';
import MisCursadas from './pages/MisCursadas';
import Titulos from './pages/Titulos';
import Alumnos from './pages/Alumnos';
import HistorialAlumnos from './pages/HistorialAlumnos';
import Cursadas from './pages/Cursadas';
import Asistencia from './pages/Asistencia';
import MesasExamen from './pages/MesasExamen';
import CertificadosPresentados from './pages/CertificadosPresentados';
import Certificados from './pages/Certificados';
import Usuarios from './pages/Usuarios';
import Profesores from './pages/Profesores';
import ProfesorDetalle from './pages/ProfesorDetalle';
import MiHistoria from './pages/MiHistoria';
import MisCertificados from './pages/MisCertificados';
import MisMesas from './pages/MisMesas';
import JustificarAusencia from './pages/JustificarAusencia';
import MisHorarios from './pages/MisHorarios';
import MisJustificativos from './pages/MisJustificativos';
import Empleados from './pages/Empleados';
import EmpleadoDetalle from './pages/EmpleadoDetalle';
import Personal from './pages/Personal';

// Redirige a la pagina inicial que corresponde al rol del usuario
function HomeRedirect() {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={homePathFor(usuario?.rol)} replace />;
}

// Envuelve el Layout: exige sesion y, si el rol es CELADOR, lo mantiene
// dentro de su panel personal (default-deny tambien del lado del cliente).
function LayoutProtegido() {
  const { usuario, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) return null;
  if (!usuario) return <Navigate to="/login" replace />;

  if (usuario.rol === 'CELADOR' && !RUTAS_CELADOR.includes(pathname)) {
    return <Navigate to="/mis-horarios" replace />;
  }

  return <Layout />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<LayoutProtegido />}>
            <Route path="/mi-perfil" element={<MiPerfil />} />
            <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
            <Route path="/mis-licencias" element={<MisLicencias />} />
            <Route path="/mis-cursadas" element={<MisCursadas />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/titulos" element={<Titulos />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/historial-alumnos" element={<HistorialAlumnos />} />
            <Route path="/cursadas" element={<Cursadas />} />
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/mesas-examen" element={<MesasExamen />} />
            <Route path="/certificados-presentados" element={<CertificadosPresentados />} />
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/profesores" element={<Profesores />} />
            <Route path="/profesores/:id" element={<ProfesorDetalle />} />
            <Route path="/personal" element={<Personal />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/empleados/:id" element={<EmpleadoDetalle />} />
            <Route path="/mi-historia" element={<MiHistoria />} />
            <Route path="/mis-certificados" element={<MisCertificados />} />
            <Route path="/mis-mesas" element={<MisMesas />} />
            <Route path="/justificar-ausencia" element={<JustificarAusencia />} />
            <Route path="/mis-horarios" element={<MisHorarios />} />
            <Route path="/mis-justificativos" element={<MisJustificativos />} />
            <Route path="/" element={<HomeRedirect />} />
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;