import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw, FileCode2, Shield, Clock, Hash, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { highlightPython } from "../lib/highlight";

const PASS = import.meta.env.VITE_ADMIN_PASS;

function fmtDate(s) {
  const d = new Date(s);
  const p = (n) => String(n).padStart(2, "0");
  return {
    sana: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    vaqt: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delId, setDelId] = useState(null);
  const navigate = useNavigate();

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setCodes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) {
      fetchCodes();
      const ch = supabase
        .channel("admin-del")
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "codes" }, (p) => {
          setCodes((prev) => prev.filter((c) => c.id !== p.old.id));
        })
        .subscribe();
      return () => supabase.removeChannel(ch);
    }
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pw === PASS) {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
    } else {
      setErr(true);
      setPw("");
      setTimeout(() => navigate("/"), 1200);
    }
  };

  const deleteCode = async (id) => {
    if (!confirm("Ushbu kodni o'chirmoqchimisiz?")) return;
    setDelId(id);
    const { error } = await supabase.from("codes").delete().eq("id", id);
    if (!error) setCodes((prev) => prev.filter((c) => c.id !== id));
    setDelId(null);
  };

  const deleteAll = async () => {
    if (!confirm("BARCHA kodlarni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from("codes").delete().neq("id", 0);
    if (!error) setCodes([]);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthed(false);
    setPw("");
  };

  if (!authed) {
    return (
      <div className="auth-page">
        <form className="auth-box" onSubmit={handleLogin}>
          <Lock size={28} />
          <h2>Admin Panel</h2>
          <p>Kirish uchun parolni kiriting</p>
          <input
            type="password"
            className={`auth-input${err ? " auth-error" : ""}`}
            placeholder="Parol..."
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            autoFocus
          />
          {err && <span className="auth-error-text">Noto'g'ri parol! Yo'naltirilmoqda...</span>}
          <button type="submit" className="auth-btn">Kirish</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <button className="btn-back" onClick={() => { logout(); navigate("/"); }}>
          <ArrowLeft size={16} /><span>Chiqish</span>
        </button>
        <div className="admin-title">
          <Shield size={18} /><span>Admin Panel</span>
          <span className="code-count">{codes.length}</span>
        </div>
        <div className="admin-actions">
          <button className="btn-refresh" onClick={fetchCodes}><RefreshCw size={14} /></button>
          <button className="btn-delete-all" onClick={deleteAll} disabled={codes.length === 0}>
            <Trash2 size={14} /><span>Barchasini o'chirish</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-box"><RefreshCw size={24} className="spin" /><span>Yuklanmoqda...</span></div>
      ) : codes.length === 0 ? (
        <div className="empty-box"><FileCode2 size={48} /><p>Kodlar yo'q</p></div>
      ) : (
        <div className="admin-list">
          {codes.map((item) => {
            const { sana, vaqt } = fmtDate(item.created_at);
            const lc = item.code.split("\n").length;
            return (
              <div key={item.id} className="admin-card">
                <div className="admin-card-top">
                  <div className="admin-card-info">
                    <FileCode2 size={14} />
                    <span className="admin-card-title">{item.title}</span>
                    <span className="lang-badge">Python</span>
                  </div>
                  <button className="btn-delete" onClick={() => deleteCode(item.id)} disabled={delId === item.id}>
                    <Trash2 size={13} />
                    <span>{delId === item.id ? "O'chirilmoqda..." : "O'chirish"}</span>
                  </button>
                </div>
                <div className="admin-card-meta">
                  <span className="meta-item"><Hash size={12} /><span>{lc} qator</span></span>
                  <span className="meta-item"><Clock size={12} /><span>sana: {sana} vaqt: {vaqt}</span></span>
                  <span className="meta-item"><span>ID: {item.id}</span></span>
                </div>
                <div className="admin-code-preview">
                  <div className="code-editor-view">
                    <div className="code-line-numbers">
                      {item.code.split("\n").map((_, i) => (
                        <div key={i} className="line-num">{i + 1}</div>
                      ))}
                    </div>
                    <pre className="code-content">
                      <code dangerouslySetInnerHTML={{ __html: highlightPython(item.code).join("\n") }} />
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Admin;
