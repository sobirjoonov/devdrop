import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddCode from "./pages/AddCode";
import ViewCodes from "./pages/ViewCodes";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddCode />} />
          <Route path="/codes" element={<ViewCodes />} />
          <Route path="/codes/admin/root0123jjllnsdojapd103jladl313jad81j38ajdk218u" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
