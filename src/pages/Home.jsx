import { useNavigate } from "react-router-dom";
import { Code2, Eye } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-card">
        <div className="home-logo">
          <Code2 size={48} strokeWidth={1.5} />
        </div>
        <h1>devdrop</h1>
        <p>Kodlaringizni saqlang va boshqalar bilan almashing</p>
        <div className="home-buttons">
          <button className="btn btn-view" onClick={() => navigate("/codes")}>
            <Eye size={20} />
            <span>Kodlarni Ko'rish</span>
          </button>
          <button className="btn btn-add" onClick={() => navigate("/add")}>
            <Code2 size={20} />
            <span>Kod Qo'shish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
