import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileCode2 } from "lucide-react";
import { supabase } from "../lib/supabase";

function AddCode() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const lineCount = code.split("\n").length;

  const handleSubmit = async () => {
    if (!code.trim()) return alert("Kodni kiriting!");
    setLoading(true);
    const { error } = await supabase
      .from("codes")
      .insert([{ title: title || "Nomsiz kod", code }]);
    setLoading(false);
    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      navigate("/codes");
    }
  };

  return (
    <div className="add-page">
      <div className="editor-container">
        <div className="editor-topbar">
          <button className="btn-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>Orqaga</span>
          </button>
          <div className="editor-tab">
            <FileCode2 size={14} />
            <span>{title || "papka"}</span>
          </div>
          <div className="editor-actions">
            <button className="btn-save" onClick={handleSubmit} disabled={loading}>
              <Save size={14} />
              <span>{loading ? "Saqlanmoqda..." : "Saqlash"}</span>
            </button>
          </div>
        </div>
        <div className="editor-body">
          <div className="line-numbers">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div key={i} className="line-num">{i + 1}</div>
            ))}
          </div>
          <div className="editor-input-area">
            <input
              className="code-title-input"
              type="text"
              placeholder="# Kod nomi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="code-textarea"
              placeholder="# Kodni shu yerga yozing yoki joylashtiring..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="editor-statusbar">
          <span>Python</span>
          <span>{lineCount} qator</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}

export default AddCode;
