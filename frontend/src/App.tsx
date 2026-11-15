import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import Painel from "./pages/Painel";
import CadastroEstudante from "./pages/CadastroEstudante";
import Reservar from "./pages/Reservar";

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/kalango.jpeg" alt="Kalango" />
          <div>
            <strong>SearchHouse</strong>
            <span>República Kalango</span>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>Painel</NavLink>
          <NavLink to="/cadastro">Cadastrar estudante</NavLink>
          <NavLink to="/reservar">Reservar visita</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/cadastro" element={<CadastroEstudante />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
