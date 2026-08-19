import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Copy, Check, FileCode2, Terminal, Clock, Hash } from "lucide-react";
import { supabase } from "../lib/supabase";
import { highlightPython } from "../lib/highlight";

function fmtDate(s) {
  const d = new Date(s);
  const p = (n) => String(n).padStart(2, "0");
  return {
    sana: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    vaqt: `${p(d.getHours())}:${p(d.getMinutes())}`,
  };
}

function ViewCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
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
    fetchCodes();
    const ch = supabase
      .channel("codes-del")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "codes" }, (p) => {
        setCodes((prev) => prev.filter((c) => c.id !== p.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const copyCode = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="view-page">
        <div className="view-header">
          <button className="btn-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /><span>Orqaga</span>
          </button>
          <div className="view-title"><Terminal size={18} /><span>Barcha Kodlar</span></div>
        </div>
        <div className="loading-box"><RefreshCw size={24} className="spin" /><span>Yuklanmoqda...</span></div>
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="view-page">
        <div className="view-header">
          <button className="btn-back" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /><span>Orqaga</span>
          </button>
          <div className="view-title"><Terminal size={18} /><span>Barcha Kodlar</span></div>
          <button className="btn-refresh" onClick={fetchCodes}><RefreshCw size={14} /><span>Yangilash</span></button>
        </div>
        <div className="empty-box">
          <FileCode2 size={48} />
          <p>Hozircha kodlar yo'q</p>
          <button className="btn btn-add-sm" onClick={() => navigate("/add")}>Kod Qo'shish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-page">
      <div className="view-header">
        <button className="btn-back" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /><span>Orqaga</span>
        </button>
        <div className="view-title">
          <Terminal size={18} /><span>Barcha Kodlar</span>
          <span className="code-count">{codes.length}</span>
        </div>
        <button className="btn-refresh" onClick={fetchCodes}><RefreshCw size={14} /><span>Yangilash</span></button>
      </div>
      <div className="codes-list">
        {codes.map((item) => {
          const hl = highlightPython(item.code);
          const lc = item.code.split("\n").length;
          const { sana, vaqt } = fmtDate(item.created_at);
          return (
            <div key={item.id} className="code-card">
              <div className="code-card-topbar">
                <div className="code-card-tab">
                  <FileCode2 size={13} />
                  <span>{item.title}</span>
                  <span className="lang-badge">Python</span>
                </div>
                <div className="code-card-meta">
                  <span className="meta-item"><Hash size={12} /><span>{lc} qator</span></span>
                  <span className="meta-item"><Clock size={12} /><span>sana: {sana} vaqt: {vaqt}</span></span>
                  <button
                    className={`btn-copy${copiedId === item.id ? " copied" : ""}`}
                    onClick={() => copyCode(item.id, item.code)}
                  >
                    {copiedId === item.id
                      ? <><Check size={13} /><span>Nusxalandi</span></>
                      : <><Copy size={13} /><span>Nusxalash</span></>}
                  </button>
                </div>
              </div>
              <div className="code-editor-view">
                <div className="code-line-numbers">
                  {item.code.split("\n").map((_, i) => (
                    <div key={i} className="line-num">{i + 1}</div>
                  ))}
                </div>
                <pre className="code-content">
                  <code dangerouslySetInnerHTML={{ __html: hl.join("\n") }} />
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ViewCodes;
