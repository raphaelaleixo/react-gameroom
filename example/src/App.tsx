import { Routes, Route } from "react-router-dom";
import { DocsLayout } from "./docs/DocsLayout";
import { DocsHome } from "./docs/DocsHome";
import { GuidePage } from "./docs/GuidePage";
import { ApiPage } from "./docs/ApiPage";
import { ExamplesPage } from "./docs/ExamplesPage";
import { HomePage } from "./pages/HomePage";
import { JoinGamePage } from "./pages/JoinGamePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PlayerPage } from "./pages/PlayerPage";

export function App() {
  return (
    <Routes>
      {/* Documentation */}
      <Route element={<DocsLayout />}>
        <Route path="/" element={<DocsHome />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/examples" element={<ExamplesPage />} />
      </Route>

      {/* Live RPS game */}
      <Route path="/play" element={<HomePage />} />
      <Route path="/play/join" element={<JoinGamePage />} />
      <Route path="/play/room/:roomId" element={<LobbyPage />} />
      <Route path="/play/room/:roomId/player/:playerId" element={<PlayerPage />} />
    </Routes>
  );
}
