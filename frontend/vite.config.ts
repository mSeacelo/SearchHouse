import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento (npm run dev), /api é encaminhado para o backend local.
// Em produção (docker), quem faz isso é o nginx (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // Back-end desligado: responde 503 para a tela mostrar "back-end fora do ar".
        configure: (proxy) => {
          proxy.on("error", (_erro, _req, res) => {
            if ("writeHead" in res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "O back-end está fora do ar. Rode `docker compose up` na raiz do projeto." }));
            }
          });
        },
      },
    },
  },
});
