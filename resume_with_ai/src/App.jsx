import "./App.css";
import Admin from "./components/Admin/Admin";
import Dashboard from "./components/Dashboard/Dashboard";
import History from "./components/History/History";
import SideBar from "./components/sideBar/sideBar";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <SideBar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
