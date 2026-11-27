import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EstudantesPage } from "./pages/EstudantesPage";
import { NaoEncontradaPage } from "./pages/NaoEncontradaPage";
import { NovaRepublicaPage } from "./pages/NovaRepublicaPage";
import { PainelPage } from "./pages/PainelPage";
import { RepublicaDetalhePage } from "./pages/RepublicaDetalhePage";
import { RepublicasPage } from "./pages/RepublicasPage";
import { VisitasPage } from "./pages/VisitasPage";

/** Ao trocar de página: volta ao topo e leva o foco ao conteúdo (ajuda quem usa leitor de tela). */
function AoTrocarDePagina() {
  const { pathname } = useLocation();
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById("conteudo")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <AoTrocarDePagina />
      <Layout>
        <Routes>
          <Route path="/" element={<PainelPage />} />
          <Route path="/republicas" element={<RepublicasPage />} />
          <Route path="/republicas/nova" element={<NovaRepublicaPage />} />
          <Route path="/republicas/:id" element={<RepublicaDetalhePage />} />
          <Route path="/visitas" element={<VisitasPage />} />
          <Route path="/estudantes" element={<EstudantesPage />} />
          <Route path="*" element={<NaoEncontradaPage />} />
        </Routes>
      </Layout>
    </>
  );
}
