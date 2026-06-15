import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://gmmnlnftpapnzmqlfdia.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbW5sbmZ0cGFwbnptcWxmZGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDA4MTksImV4cCI6MjA5NzA3NjgxOX0.aeOyS3gK4SZRlfnOnlc6dcce5U-H8uLf1tghyOCktb0";

const db = {
  async select(table, filters = "") {
    const res = await fetch(${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${filters}, {
      headers: { apikey: SUPABASE_KEY, Authorization: Bearer ${SUPABASE_KEY} },
    });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(${SUPABASE_URL}/rest/v1/${table}, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: Bearer ${SUPABASE_KEY},
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async update(table, data, match) {
    const query = Object.entries(match).map(([k, v]) => ${k}=eq.${v}).join("&");
    const res = await fetch(${SUPABASE_URL}/rest/v1/${table}?${query}, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: Bearer ${SUPABASE_KEY},
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async delete(table, match) {
    const query = Object.entries(match).map(([k, v]) => ${k}=eq.${v}).join("&");
    await fetch(${SUPABASE_URL}/rest/v1/${table}?${query}, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: Bearer ${SUPABASE_KEY} },
    });
  },
};

function getSerial() {
  let s = localStorage.getItem("vision_serial");
  if (!s) {
    s = "SIM-" + Array.from({ length: 12 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
    localStorage.setItem("vision_serial", s);
  }
  return s;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA", { day: "2-digit", month: "short", year: "numeric" }) +
    " — " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function initials(name) {
  return (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const ADMIN_PASS = "vision2025";

const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'IBM Plex Sans Arabic', sans-serif; background: #080810; color: #e2e2f0; direction: rtl; }
.app { min-height: 100vh; }
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 60% 0%, #1a0a2e 0%, #080810 60%); padding: 24px; }
.auth-card { background: #0e0e1a; border: 1px solid #1c1c30; border-radius: 20px; padding: 44px 36px; width: 100%; max-width: 400px; box-shadow: 0 0 80px rgba(139,92,246,0.07); }
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.brand-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
.brand-tag { font-size: 10px; color: #7c3aed; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 32px; }
.auth-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.auth-sub { font-size: 13px; color: #5a5a78; margin-bottom: 28px; line-height: 1.6; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; color: #8080a0; }
.field input, .field select, .field textarea { width: 100%; padding: 11px 14px; background: #14141f; border: 1px solid #22223a; border-radius: 10px; color: #e2e2f0; font-size: 14px; font-family: inherit; outline: none; transition: border 0.15s; direction: rtl; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #7c3aed; }
.field textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
.field select option { background: #14141f; }
.serial-chip { background: #0a0a14; border: 1px dashed #22223a; border-radius: 8px; padding: 9px 13px; font-size: 11px; color: #5a5a78; font-family: monospace; letter-spacing: 1px; }
.btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s, transform 0.1s; letter-spacing: 0.3px; }
.btn:hover { opacity: 0.88; }
.btn:active { transform: scale(0.985); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn.ghost { background: #14141f; border: 1px solid #22223a; color: #8080a0; }
.btn.ghost:hover { border-color: #7c3aed; color: #a855f7; opacity: 1; }
.btn.green { background: linear-gradient(135deg, #059669, #10b981); }
.btn.red { background: linear-gradient(135deg, #dc2626, #ef4444); }
.btn.sm { padding: 7px 14px; font-size: 12px; width: auto; border-radius: 8px; }
.topbar { background: #0e0e1a; border-bottom: 1px solid #1c1c30; height: 60px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
.topbar-l { display: flex; align-items: center; gap: 10px; }
.topbar-logo { font-size: 15px; font-weight: 700; }
.topbar-badge { font-size: 9px; font-weight: 700; letter-spacing: 2px; background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 3px 8px; border-radius: 20px; color: #fff; }
.topbar-r { display: flex; align-items: center; gap: 10px; }
.chip { display: flex; align-items: center; gap: 7px; background: #14141f; border: 1px solid #22223a; padding: 5px 11px; border-radius: 20px; font-size: 12px; }
.avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.icon-btn { background: none; border: 1px solid #22223a; color: #5a5a78; padding: 5px 11px; border-radius: 8px; cursor: pointer; font-size: 11px; font-family: inherit; transition: all 0.15s; }
.icon-btn:hover { border-color: #7c3aed; color: #a855f7; }
.page { max-width: 860px; margin: 0 auto; padding: 28px 20px; }
.stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 28px; }
.stat { background: #0e0e1a; border: 1px solid #1c1c30; border-radius: 14px; padding: 18px 20px; }
.stat-n { font-size: 30px; font-weight: 700; line-height: 1; margin-bottom: 5px; }
.stat-l { font-size: 11px; color: #5a5a78; font-weight: 500; }
.c-purple { color: #a855f7; } .c-amber { color: #f59e0b; } .c-green { color: #10b981; } .c-red { color: #ef4444; }
.tabs { display: flex; gap: 6px; margin-bottom: 22px; flex-wrap: wrap; }
.tab { padding: 7px 16px; border-radius: 8px; border: 1px solid #1c1c30; background: none; color: #5a5a78; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.15s; }
.tab:hover { border-color: #7c3aed; color: #a855f7; }
.tab.on { background: #14141f; border-color: #7c3aed; color: #a855f7; }
.card { background: #0e0e1a; border: 1px solid #1c1c30; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.card-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; }
.pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #22223a; background: #14141f; color: #5a5a78; transition: all 0.15s; font-family: inherit; }
.pill.p-low { background: #022c17; color: #10b981; border-color: #10b981; }
.pill.p-medium { background: #1f1200; color: #f59e0b; border-color: #f59e0b; }
.pill.p-high { background: #1f0505; color: #ef4444; border-color: #ef4444; }
.tickets { display: flex; flex-direction: column; gap: 10px; }
.t-card { background: #0e0e1a; border: 1px solid #1c1c30; border-radius: 14px; padding: 18px 20px; transition: border-color 0.15s; }
.t-card:hover { border-color: #2a2a44; }
.t-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.t-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
.badges { display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }
.badge { padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; white-space: nowrap; }
.b-open { background: #1f1200; color: #f59e0b; } .b-closed { background: #022c17; color: #10b981; }
.b-low { background: #022c17; color: #10b981; } .b-medium { background: #1f1200; color: #f59e0b; } .b-high { background: #1f0505; color: #ef4444; } .b-cat { background: #14143a; color: #a855f7; }
.t-desc { font-size: 13px; line-height: 1.6; margin-bottom: 12px; color: #8080a0; }
.t-reply { background: #0a1a14; border: 1px solid #0d3322; border-radius: 8px; padding: 10px 13px; margin-bottom: 12px; }
.t-reply-label { font-size: 10px; color: #10b981; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }
.t-reply-text { font-size: 13px; color: #c0e8d0; line-height: 1.5; }
.t-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.t-meta { display: flex; flex-direction: column; gap: 3px; }
.t-user { font-size: 11px; color: #7c3aed; font-weight: 600; }
.t-serial { font-size: 10px; color: #3a3a5a; font-family: monospace; }
.t-date { font-size: 10px; color: #3a3a5a; }
.t-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.reply-box { margin-top: 12px; border-top: 1px solid #1c1c30; padding-top: 12px; }
.reply-box textarea { width: 100%; padding: 9px 12px; background: #14141f; border: 1px solid #22223a; border-radius: 8px; color: #e2e2f0; font-size: 13px; font-family: inherit; outline: none; resize: vertical; min-height: 70px; direction: rtl; line-height: 1.5; }
.reply-box textarea:focus { border-color: #7c3aed; }
.reply-row { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }
.empty { text-align: center; padding: 52px 20px; background: #0e0e1a; border: 1px dashed #1c1c30; border-radius: 14px; }
.empty-icon { font-size: 36px; margin-bottom: 10px; }
.empty-title { font-size: 15px; font-weight: 600; margin-bottom: 5px; }
.empty-sub { font-size: 12px; color: #5a5a78; }
.success-box { text-align: center; padding: 32px 20px; }
.success-icon { font-size: 44px; margin-bottom: 12px; }
.success-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.success-sub { font-size: 13px; color: #5a5a78; }
.dev-card { background: #0e0e1a; border: 1px solid #1c1c30; border-radius: 12px; padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dev-info { display: flex; flex-direction: column; gap: 3px; }
.dev-name { font-size: 14px; font-weight: 600; }
.dev-dept { font-size: 12px; color: #5a5a78; }
.dev-serial { font-size: 10px; color: #3a3a5a; font-family: monospace; }
.search { width: 100%; padding: 10px 14px; background: #14141f; border: 1px solid #22223a; border-radius: 10px; color: #e2e2f0; font-size: 13px; font-family: inherit; outline: none; margin-bottom: 16px; direction: rtl; }
.search:focus { border-color: #7c3aed; }
.loading { display: flex; align-items: center; justify-content: center; height: 100vh; color: #7c3aed; font-size: 14px; }
.spinner { width: 20px; height: 20px; border: 2px solid #1c1c30; border-top-color: #7c3aed; border-radius: 50%; animation: spin 0.7s linear infinite; margin-left: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.err-msg { color: #ef4444; font-size: 12px; margin-top: 6px; }
@media (max-width: 600px) { .stats { grid-template-columns: 1fr 1fr; } .page { padding: 16px 14px; } .auth-card { padding: 32px 22px; } }
`;

function SetupScreen({ onDone }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [project, setProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const serial = getSerial();

  async function submit() {
    if (!name.trim()) return;
    setLoading(true); setErr("");
    try {
      const existing = await db.select("devices", &serial_number=eq.${serial});
      if (existing && existing.length > 0) {
        localStorage.setItem("vision_user", JSON.stringify(existing[0]));
        onDone(existing[0]); return;
      }
      const user = { serial_number: serial, employee_name: name.trim(), department: dept.trim(), project: project.trim() };
      const res = await db.insert("devices", user);
      if (res && res[0]) {
        localStorage.setItem("vision_user", JSON.stringify(res[0]));
        onDone(res[0]);
      } else { setErr("حدث خطأ، حاول مرة ثانية"); }
    } catch { setErr("تعذر الاتصال بالخادم"); }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><div className="brand-icon">👁️</div><div className="brand-name">VISION IT</div></div>
        <div className="brand-tag">Ticket System</div>
        <div className="auth-title">أهلاً بك! 👋</div>
        <div className="auth-sub">سجّل بياناتك مرة وحدة وما تحتاج تسجل مرة ثانية</div>
        <div className="field"><label>الاسم الكامل *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد العمري" /></div>
        <div className="field"><label>القسم</label><input value={dept} onChange={e => setDept(e.target.value)} placeholder="مثال: المحاسبة" /></div>
        <div className="field"><label>المشروع الحالي</label><input value={project} onChange={e => setProject(e.target.value)} placeholder="مثال: مشروع التحول الرقمي" /></div>
        <div className="field"><label>معرّف الجهاز</label><div className="serial-chip">🖥️ {serial}</div></div>
        {err && <div className="err-msg">⚠️ {err}</div>}
        <br />
        <button className="btn" onClick={submit} disabled={!name.trim() || loading}>
          {loading ? "جاري التسجيل..." : "ابدأ الاستخدام ←"}
        </button>
      </div>
    </div>
  );
}

function UserApp({ user, onLogout }) {
  const [tab, setTab] = useState("new");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("جهاز");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const data = await db.select("tickets", &serial_number=eq.${user.serial_number});
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [user.serial_number]);

  useEffect(() => { if (tab === "my") loadTickets(); }, [tab, loadTickets]);

  async function submitTicket() {
    if (!title.trim() || !desc.trim()) return;
    setSending(true);
    await db.insert("tickets", {
      serial_number: user.serial_number, employee_name: user.employee_name,
      department: user.department, project: user.project,
      title: title.trim(), description: desc.trim(), category: cat, priority, status: "open",
    });
    setTitle(""); setDesc(""); setPriority("medium"); setCat("جهاز");
    setSending(false); setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTab("my"); }, 1800);
  }

  const open = tickets.filter(t => t.status === "open").length;
  const closed = tickets.filter(t => t.status === "closed").length;

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-l"><span style={{fontSize:18}}>👁️</span><span className="topbar-logo">VISION IT</span><span className="topbar-badge">TICKET</span></div>
        <div className="topbar-r">
          <div className="chip"><div className="avatar">{initials(user.employee_name)}</div><span>{user.employee_name}</span></div>
          <button className="icon-btn" onClick={onLogout}>خروج</button>
        </div>
      </div>
      <div className="page">
        <div className="stats">
          <div className="stat"><div className="stat-n c-purple">{tickets.length}</div><div className="stat-l">إجمالي تيكتاتي</div></div>
          <div className="stat"><div className="stat-n c-amber">{open}</div><div className="stat-l">مفتوحة</div></div>
          <div className="stat"><div className="stat-n c-green">{closed}</div><div className="stat-l">مغلقة</div></div>
        </div>
        <div className="tabs">
          <button className={tab ${tab==="new"?"on":""}} onClick={() => setTab("new")}>➕ تيكت جديد</button>
          <button className={tab ${tab==="my"?"on":""}} onClick={() => setTab("my")}>📋 تيكتاتي</button>
        </div>
        {tab === "new" && (
          <div className="card">
            <div className="card-title">رفع تيكت جديد</div>
            {submitted ? (
              <div className="success-box"><div className="success-icon">✅</div><div className="success-title">تم رفع تيكتك!</div><div className="success-sub">سيتواصل معك الدعم التقني قريباً</div></div>
            ) : (
              <>
                <div className="field"><label>عنوان المشكلة *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: الطابعة لا تعمل" /></div>
                <div className="field"><label>الفئة</label>
                  <select value={cat} onChange={e => setCat(e.target.value)}>
                    {["جهاز","شبكة","برنامج","طابعة","إيميل","أخرى"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field"><label>وصف المشكلة *</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="اشرح المشكلة بالتفصيل..." /></div>
                <div className="field"><label>الأولوية</label>
                  <div className="pills">
                    {[["low","🟢 عادي"],["medium","🟡 متوسط"],["high","🔴 عاجل"]].map(([v,l]) => (
                      <button key={v} className={pill ${priority===v?`p-${v}:""}`} onClick={() => setPriority(v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <br/>
                <button className="btn" onClick={submitTicket} disabled={!title.trim()||!desc.trim()||sending}>
                  {sending ? "جاري الإرسال..." : "إرسال التيكت 🚀"}
                </button>
              </>
            )}
          </div>
        )}
        {tab === "my" && (
          loading ? <div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div> :
          tickets.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">لا توجد تيكتات بعد</div><div className="empty-sub">ارفع تيكتك الأول من التبويب أعلاه</div></div>
          ) : (
            <div className="tickets">
              {tickets.map(t => (
                <div key={t.id} className="t-card">
                  <div className="t-head"><div className="t-title">{t.title}</div>
                    <div className="badges">
                      <span className={badge ${t.status==="open"?"b-open":"b-closed"}}>{t.status==="open"?"🟡 مفتوح":"✅ مغلق"}</span>
                      <span className={badge b-${t.priority}}>{t.category}</span>
                    </div>
                  </div>
                  <div className="t-desc">{t.description}</div>
                  {t.admin_reply && (<div className="t-reply"><div className="t-reply-label">💬 رد الدعم التقني</div><div className="t-reply-text">{t.admin_reply}</div></div>)}
                  <div className="t-foot"><div className="t-meta"><span className="t-date">{formatDate(t.created_at)}</span></div></div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  function tryLogin() {
    if (pass === ADMIN_PASS) { sessionStorage.setItem("vision_admin","1"); onSuccess(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><div className="brand-icon">🔐</div><div className="brand-name">VISION IT</div></div>
        <div className="brand-tag">Admin Panel</div>
        <div className="auth-title">دخول المشرف</div>
        <div className="auth-sub">أدخل كلمة مرور المشرف</div>
        <div className="field"><label>كلمة المرور</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && tryLogin()} placeholder="••••••••" style={err?{borderColor:"#ef4444"}:{}} />
        </div>
        {err && <div className="err-msg">❌ كلمة المرور غير صحيحة</div>}
        <br/><button className="btn" onClick={tryLogin}>دخول ←</button>
      </div>
    </div>
  );
}

function AdminApp({ onLogout }) {
  const [tab, setTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [t, d] = await Promise.all([db.select("tickets"), db.select("devices", "")]);
    setTickets(Array.isArray(t) ? t : []);
    setDevices(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function closeTicket(id) {
    await db.update("tickets", { status: "closed", closed_at: new Date().toISOString() }, { id });
    setTickets(prev => prev.map(t => t.id===id ? {...t, status:"closed"} : t));
  }

  async function reopenTicket(id) {
    await db.update("tickets", { status: "open", closed_at: null }, { id });
    setTickets(prev => prev.map(t => t.id===id ? {...t, status:"open"} : t));
  }

  async function sendReply(id) {
    if (!replyText.trim()) return;
    setSaving(true);
    await db.update("tickets", { admin_reply: replyText.trim() }, { id });
    setTickets(prev => prev.map(t => t.id===id ? {...t, admin_reply: replyText.trim()} : t));
    setReplyId(null); setReplyText(""); setSaving(false);
  }

  async function deleteDevice(id) {
    if (!window.confirm("تأكيد حذف الجهاز؟")) return;
    await db.delete("devices", { id });
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  let shown = tickets;
  if (filter !== "all") shown = shown.filter(t => t.status === filter);
  if (search) shown = shown.filter(t =>
    t.employee_name?.includes(search) || t.title?.includes(search) ||
    t.department?.includes(search) || t.serial_number?.includes(search)
  );

  const open = tickets.filter(t => t.status==="open").length;
  const closed = tickets.filter(t => t.status==="closed").length;
  const high = tickets.filter(t => t.priority==="high" && t.status==="open").length;

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-l"><span style={{fontSize:18}}>👁️</span><span className="topbar-logo">VISION IT</span><span className="topbar-badge">ADMIN</span></div>
        <div className="topbar-r">
          <div className="chip"><div className="avatar">AD</div><span>المشرف</span></div>
          <button className="icon-btn" onClick={loadAll}>🔄 تحديث</button>
          <button className="icon-btn" onClick={onLogout}>خروج</button>
        </div>
      </div>
      <div className="page">
        <div className="stats">
          <div className="stat"><div className="stat-n c-purple">{tickets.length}</div><div className="stat-l">إجمالي التيكتات</div></div>
          <div className="stat"><div className="stat-n c-amber">{open}</div><div className="stat-l">مفتوحة</div></div>
          <div className="stat"><div className="stat-n c-green">{closed}</div><div className="stat-l">مغلقة</div></div>
        </div>
        {high > 0 && (
          <div style={{background:"#1f0505",border:"1px solid #7f1d1d",borderRadius:10,padding:"10px 16px",marginBottom:20,fontSize:13,color:"#fca5a5"}}>
            ⚠️ عندك <strong>{high}</strong> تيكت عاجل مفتوح
          </div>
        )}
        <div className="tabs">
          <button className={tab ${tab==="tickets"?"on":""}} onClick={() => setTab("tickets")}>🎫 التيكتات</button>
          <button className={tab ${tab==="devices"?"on":""}} onClick={() => setTab("devices")}>🖥️ الأجهزة ({devices.length})</button>
        </div>
        {tab === "tickets" && (
          <>
            <input className="search" placeholder="🔍 ابحث باسم الموظف أو المشكلة..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="tabs" style={{marginBottom:18}}>
              {[["all","الكل"],["open","المفتوحة"],["closed","المغلقة"]].map(([v,l]) => (
                <button key={v} className={tab ${filter===v?"on":""}} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
            {loading ? <div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div> :
              shown.length === 0 ? (
                <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">لا توجد تيكتات</div><div className="empty-sub">ستظهر هنا عندما يرفع الموظفون طلبات الدعم</div></div>
              ) : (
                <div className="tickets">
                  {shown.map(t => (
                    <div key={t.id} className="t-card">
                      <div className="t-head"><div className="t-title">{t.title}</div>
                        <div className="badges">
                          <span className={badge ${t.status==="open"?"b-open":"b-closed"}}>{t.status==="open"?"🟡 مفتوح":"✅ مغلق"}</span>
                          <span className={badge b-${t.priority}}>{t.priority==="high"?"عاجل":t.priority==="medium"?"متوسط":"عادي"}</span>
                          <span className="badge b-cat">{t.category}</span>
                        </div>
                      </div>
                      <div className="t-desc">{t.description}</div>
                      {t.admin_reply && (<div className="t-reply"><div className="t-reply-label">💬 ردك</div><div className="t-reply-text">{t.admin_reply}</div></div>)}
                      <div className="t-foot">
                        <div className="t-meta">
                          <span className="t-user">👤 {t.employee_name} — {t.department}</span>
                          {t.project && <span className="t-serial">💼 {t.project}</span>}
                          <span className="t-serial">🖥️ {t.serial_number}</span>
                          <span className="t-date">{formatDate(t.created_at)}</span>
                        </div>
                        <div className="t-actions">
                          <button className="btn sm ghost" onClick={() => { setReplyId(replyId===t.id?null:t.id); setReplyText(t.admin_reply||""); }}>
                            💬 {t.admin_reply ? "تعديل الرد" : "رد"}
                          </button>
                          {t.status==="open"
                            ? <button className="btn sm green" onClick={() => closeTicket(t.id)}>✅ إغلاق</button>
                            : <button className="btn sm ghost" onClick={() => reopenTicket(t.id)}>↩️ إعادة فتح</button>
                          }
                        </div>
                      </div>
                      {replyId === t.id && (
                        <div className="reply-box">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." />
                          <div className="reply-row">
                            <button className="btn sm ghost" onClick={() => setReplyId(null)}>إلغاء</button>
                            <button className="btn sm" onClick={() => sendReply(t.id)} disabled={saving||!replyText.trim()}>{saving?"جاري الإرسال...":"إرسال الرد"}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </>
        )}
        {tab === "devices" && (
          loading ? <div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div> :
          devices.length === 0 ? (
            <div className="empty"><div className="empty-icon">🖥️</div><div className="empty-title">لا توجد أجهزة مسجلة</div><div className="empty-sub">ستظهر هنا عندما يفتح الموظفون البرنامج لأول مرة</div></div>
          ) : (
            devices.map(d => (
              <div key={d.id} className="dev-card">
                <div className="dev-info">
                  <div className="dev-name">👤 {d.employee_name}</div>
                  <div className="dev-dept">{d.department} {d.project ? — 💼 ${d.project} : ""}</div>
                  <div className="dev-serial">🖥️ {d.serial_number}</div>
                  <div className="t-date">{formatDate(d.registered_at)}</div>
                </div>
                <button className="btn sm red" onClick={() => deleteDevice(d.id)}>حذف</button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    if (url.get("admin") === "1") {
      if (sessionStorage.getItem("vision_admin") === "1") setMode("admin");
      else setMode("adminLogin");
      return;
    }
    try {
      const saved = localStorage.getItem("vision_user");
      if (saved) { setUser(JSON.parse(saved)); setMode("user"); }
      else setMode("setup");
    } catch { setMode("setup"); }
  }, []);

  if (mode === "loading") return (
    <><style>{css}</style><div className="loading">جاري التحميل <div className="spinner"/></div></>
  );

  return (
    <>
      <style>{css}</style>
      {mode === "setup" && <SetupScreen onDone={u => { setUser(u); setMode("user"); }} />}
      {mode === "user" && user && <UserApp user={user} onLogout={() => { localStorage.removeItem("vision_user"); setMode("setup"); }} />}
      {mode === "adminLogin" && <AdminLogin onSuccess={() => setMode("admin")} />}
      {mode === "admin" && <AdminApp onLogout={() => { sessionStorage.removeItem("vision_admin"); setMode("adminLogin"); }} />}
    </>
  );
}
