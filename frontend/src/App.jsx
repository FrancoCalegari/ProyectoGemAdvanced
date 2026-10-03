import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
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
            <Route path="/mi-historia" element={<MiHistoria />} />
            <Route path="/mis-certificados" element={<MisCertificados />} />
            <Route path="/mis-mesas" element={<MisMesas />} />
            <Route path="/justificar-ausencia" element={<JustificarAusencia />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;