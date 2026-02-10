import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import Results from "./pages/Results";
import BoothQR from "./pages/BoothQR";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/play" element={<Game />} />
      <Route path="/results" element={<Results />} />
      <Route path="/booth" element={<BoothQR />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
