import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://gmmnlnftpapnzmqlfdia.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbW5sbmZ0cGFwbnptcWxmZGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDA4MTksImV4cCI6MjA5NzA3NjgxOX0.aeOyS3gK4SZRlfnOnlc6dcce5U-H8uLf1tghyOCktb0";
const ADMIN_PASS = "vision2025";

const H = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };
const JH = { ...H, "Content-Type": "application/json", Prefer: "return=representation" };

async function dbSelect(table, filter) {
  filter = filter || "";
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?select=*" + filter, { headers: H });
  return r.json();
}
async function dbInsert(table, data) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table, { method: "POST", headers: JH, body: JSON.stringify(data) });
  return r.json();
}
async function dbUpdate(table, data, id) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?id=eq." + id, { method: "PATCH", headers: JH, body: JSON.stringify(data) });
  return r.json();
}
async function dbDelete(table, id) {
  await fetch(SUPABASE_URL + "/rest/v1/" + table + "?id=eq." + id, { method: "DELETE", headers: H });
}

function getSerial() {
  let s = localStorage.getItem("vision_serial");
  if (!s) {
    s = "SIM-" + Array.from({ length: 12 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
    localStorage.setItem("vision_serial", s);
  }
  return s;
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ar-SA") + " " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function initials(n) { return (n || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

const st = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080810", padding: 24 },
  card: { background: "#0e0e1a", border: "1px solid #1c1c30", borderRadius: 20, padding: "44px 36px", width: "100%", maxWidth: 400 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  logoIcon: { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoName: { fontSize: 20, fontWeight: 700, color: "#e2e2f0" },
  tag: { fontSize: 10, color: "#7c3aed", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 700, color: "#e2e2f0", marginBottom: 4 },
  sub: { fontSize: 13, color: "#5a5a78", marginBottom: 28, lineHeight: 1.6 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#8080a0", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", padding: "11px 14px", background: "#14141f", border: "1px solid #22223a", borderRadius: 10, color: "#e2e2f0", fontSize: 14, fontFamily: "inherit", outline: "none", direction: "rtl", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", background: "#14141f", border: "1px solid #22223a", borderRadius: 10, color: "#e2e2f0", fontSize: 14, fontFamily: "inherit", outline: "none", direction: "rtl", resize: "vertical", minHeight: 88, lineHeight: 1.6, boxSizing: "border-box" },
  select: { width: "100%", padding: "11px 14px", background: "#14141f", border: "1px solid #22223a", borderRadius: 10, color: "#e2e2f0", fontSize: 14, fontFamily: "inherit", outline: "none", direction: "rtl", boxSizing: "border-box" },
  btn: { width: "100%", padding: 13, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnGhost: { background: "#14141f", border: "1px solid #22223a", color: "#8080a0", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  btnGreen: { background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  btnRed: { background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  serialChip: { background: "#0a0a14", border: "1px dashed #22223a", borderRadius: 8, padding: "9px 13px", fontSize: 11, color: "#5a5a78", fontFamily: "monospace" },
  err: { color: "#ef4444", fontSize: 12, marginTop: 6 },
  topbar: { background: "#0e0e1a", borderBottom: "1px solid #1c1c30", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
  topL: { display: "flex", alignItems: "center", gap: 10 },
  topLogo: { fontSize: 15, fontWeight: 700, color: "#e2e2f0" },
  topBadge: { fontSize: 9, fontWeight: 700, letterSpacing: 2, background: "linear-gradient(135deg,#7c3aed,#a855f7)", padding: "3px 8px", borderRadius: 20, color: "#fff" },
  topR: { display: "flex", alignItems: "center", gap: 10 },
  chip: { display: "flex", alignItems: "center", gap: 7, background: "#14141f", border: "1px solid #22223a", padding: "5px 11px", borderRadius: 20, fontSize: 12, color: "#e2e2f0" },
  avatar: { width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 },
  iconBtn: { background: "none", border: "1px solid #22223a", color: "#5a5a78", padding: "5px 11px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "inherit" },
  page: { maxWidth: 860, margin: "0 auto", padding: "28px 20px" },
  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 },
  stat: { background: "#0e0e1a", border: "1px solid #1c1c30", borderRadius: 14, padding: "18px 20px" },
  statN: { fontSize: 30, fontWeight: 700, lineHeight: 1, marginBottom: 5 },
  statL: { fontSize: 11, color: "#5a5a78", fontWeight: 500 },
  tabs: { display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" },
  tab: { padding: "7px 16px", borderRadius: 8, border: "1px solid #1c1c30", background: "none", color: "#5a5a78", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" },
  tabOn: { padding: "7px 16px", borderRadius: 8, border: "1px solid #7c3aed", background: "#14141f", color: "#a855f7", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" },
  card2: { background: "#0e0e1a", border: "1px solid #1c1c30", borderRadius: 16, padding: 24, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#e2e2f0", marginBottom: 20 },
  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  tCard: { background: "#0e0e1a", border: "1px solid #1c1c30", borderRadius: 14, padding: "18px 20px", marginBottom: 10 },
  tHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 },
  tTitle: { fontSize: 14, fontWeight: 600, color: "#e2e2f0", lineHeight: 1.4 },
  tDesc: { fontSize: 13, color: "#8080a0", lineHeight: 1.6, marginBottom: 12 },
  tFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  tMeta: { display: "flex", flexDirection: "column", gap: 3 },
  tUser: { fontSize: 11, color: "#7c3aed", fontWeight: 600 },
  tSerial: { fontSize: 10, color: "#3a3a5a", fontFamily: "monospace" },
  tDate: { fontSize: 10, color: "#3a3a5a" },
  tActions: { display: "flex", gap: 6, flexWrap: "wrap" },
  tReply: { background: "#0a1a14", border: "1px solid #0d3322", borderRadius: 8, padding: "10px 13px", marginBottom: 12 },
  tReplyLabel: { fontSize: 10, color: "#10b981", fontWeight: 700, marginBottom: 4 },
  tReplyText: { fontSize: 13, color: "#c0e8d0", lineHeight: 1.5 },
  replyBox: { marginTop: 12, borderTop: "1px solid #1c1c30", paddingTop: 12 },
  replyRow: { display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" },
  empty: { textAlign: "center", padding: "52px 20px", background: "#0e0e1a", border: "1px dashed #1c1c30", borderRadius: 14 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: "#e2e2f0", marginBottom: 5 },
  emptySub: { fontSize: 12, color: "#5a5a78" },
  successBox: { textAlign: "center", padding: "32px 20px" },
  search: { width: "100%", padding: "10px 14px", background: "#14141f", border: "1px solid #22223a", borderRadius: 10, color: "#e2e2f0", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 16, direction: "rtl", boxSizing: "border-box" },
  devCard: { background: "#0e0e1a", border: "1px solid #1c1c30", borderRadius: 12, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  urgentBar: { background: "#1f0505", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#fca5a5" },
};

function badge(label, bg, color) {
  return <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: bg, color: color, whiteSpace: "nowrap" }}>{label}</span>;
}
function statusBadge(status) {
  return status === "open" ? badge("🟡 مفتوح", "#1f1200", "#f59e0b") : badge("✅ مغلق", "#022c17", "#10b981");
}
function priorityBadge(p) {
  if (p === "high") return badge("عاجل", "#1f0505", "#ef4444");
  if (p === "medium") return badge("متوسط", "#1f1200", "#f59e0b");
  return badge("عادي", "#022c17", "#10b981");
}

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
      const ex = await dbSelect("devices", "&serial_number=eq." + serial);
      if (ex && ex.length > 0) {
        localStorage.setItem("vision_user", JSON.stringify(ex[0]));
        onDone(ex[0]); return;
      }
      const res = await dbInsert("devices", { serial_number: serial, employee_name: name.trim(), department: dept.trim(), project: project.trim() });
      if (res && res[0]) { localStorage.setItem("vision_user", JSON.stringify(res[0])); onDone(res[0]); }
      else setErr("حدث خطأ، حاول مرة ثانية");
    } catch { setErr("تعذر الاتصال بالخادم"); }
    setLoading(false);
  }

  return (
    <div style={st.wrap}>
      <div style={st.card}>
        <div style={st.logo}><div style={st.logoIcon}>👁️</div><div style={st.logoName}>VISION IT</div></div>
        <div style={st.tag}>Ticket System</div>
        <div style={st.title}>أهلاً بك! 👋</div>
        <div style={st.sub}>سجّل بياناتك مرة وحدة وما تحتاج تسجل مرة ثانية</div>
        <div style={{ marginBottom: 16 }}><label style={st.label}>الاسم الكامل</label><input style={st.input} value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد العمري" /></div>
        <div style={{ marginBottom: 16 }}><label style={st.label}>القسم</label><input style={st.input} value={dept} onChange={e => setDept(e.target.value)} placeholder="مثال: المحاسبة" /></div>
        <div style={{ marginBottom: 16 }}><label style={st.label}>المشروع الحالي</label><input style={st.input} value={project} onChange={e => setProject(e.target.value)} placeholder="مثال: مشروع التحول الرقمي" /></div>
        <div style={{ marginBottom: 16 }}><label style={st.label}>معرّف الجهاز</label><div style={st.serialChip}>🖥️ {serial}</div></div>
        {err && <div style={st.err}>⚠️ {err}</div>}
        <div style={{ marginTop: 16 }}><button style={{ ...st.btn, opacity: (!name.trim() || loading) ? 0.4 : 1 }} onClick={submit} disabled={!name.trim() || loading}>{loading ? "جاري التسجيل..." : "ابدأ الاستخدام ←"}</button></div>
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
    const d = await dbSelect("tickets", "&serial_number=eq." + user.serial_number);
    setTickets(Array.isArray(d) ? d : []);
    setLoading(false);
  }, [user.serial_number]);

  useEffect(() => { if (tab === "my") loadTickets(); }, [tab, loadTickets]);

  async function submitTicket() {
    if (!title.trim() || !desc.trim()) return;
    setSending(true);
    await dbInsert("tickets", { serial_number: user.serial_number, employee_name: user.employee_name, department: user.department, project: user.project, title: title.trim(), description: desc.trim(), category: cat, priority, status: "open" });
    setTitle(""); setDesc(""); setPriority("medium"); setCat("جهاز");
    setSending(false); setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTab("my"); }, 1800);
  }

  const open = tickets.filter(t => t.status === "open").length;
  const closed = tickets.filter(t => t.status === "closed").length;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e2e2f0", fontFamily: "system-ui,sans-serif", direction: "rtl" }}>
      <div style={st.topbar}>
        <div style={st.topL}><span style={{ fontSize: 18 }}>👁️</span><span style={st.topLogo}>VISION IT</span><span style={st.topBadge}>TICKET</span></div>
        <div style={st.topR}><div style={st.chip}><div style={st.avatar}>{initials(user.employee_name)}</div><span>{user.employee_name}</span></div><button style={st.iconBtn} onClick={onLogout}>خروج</button></div>
      </div>
      <div style={st.page}>
        <div style={st.stats}>
          <div style={st.stat}><div style={{ ...st.statN, color: "#a855f7" }}>{tickets.length}</div><div style={st.statL}>إجمالي تيكتاتي</div></div>
          <div style={st.stat}><div style={{ ...st.statN, color: "#f59e0b" }}>{open}</div><div style={st.statL}>مفتوحة</div></div>
          <div style={st.stat}><div style={{ ...st.statN, color: "#10b981" }}>{closed}</div><div style={st.statL}>مغلقة</div></div>
        </div>
        <div style={st.tabs}>
          <button style={tab === "new" ? st.tabOn : st.tab} onClick={() => setTab("new")}>➕ تيكت جديد</button>
          <button style={tab === "my" ? st.tabOn : st.tab} onClick={() => setTab("my")}>📋 تيكتاتي</button>
        </div>
        {tab === "new" && (
          <div style={st.card2}>
            <div style={st.cardTitle}>رفع تيكت جديد</div>
            {submitted ? (
              <div style={st.successBox}><div style={{ fontSize: 44, marginBottom: 12 }}>✅</div><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>تم رفع تيكتك!</div><div style={{ fontSize: 13, color: "#5a5a78" }}>سيتواصل معك الدعم التقني قريباً</div></div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}><label style={st.label}>عنوان المشكلة</label><input style={st.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: الطابعة لا تعمل" /></div>
                <div style={{ marginBottom: 16 }}><label style={st.label}>الفئة</label>
                  <select style={st.select} value={cat} onChange={e => setCat(e.target.value)}>
                    {["جهاز","شبكة","برنامج","طابعة","إيميل","أخرى"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}><label style={st.label}>وصف المشكلة</label><textarea style={st.textarea} value={desc} onChange={e => setDesc(e.target.value)} placeholder="اشرح المشكلة بالتفصيل..." /></div>
                <div style={{ marginBottom: 16 }}><label style={st.label}>الأولوية</label>
                  <div style={st.pills}>
                    {[["low","🟢 عادي","#022c17","#10b981"],["medium","🟡 متوسط","#1f1200","#f59e0b"],["high","🔴 عاجل","#1f0505","#ef4444"]].map(([v,l,bg,c]) => (
                      <button key={v} onClick={() => setPriority(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: priority===v ? bg : "#14141f", color: priority===v ? c : "#5a5a78", border: priority===v ? "1.5px solid "+c : "1.5px solid #22223a" }}>{l}</button>
                    ))}
                  </div>
                </div>
                <button style={{ ...st.btn, marginTop: 8, opacity: (!title.trim()||!desc.trim()||sending)?0.4:1 }} onClick={submitTicket} disabled={!title.trim()||!desc.trim()||sending}>{sending?"جاري الإرسال...":"إرسال التيكت 🚀"}</button>
              </>
            )}
          </div>
        )}
        {tab === "my" && (loading ? <div style={{ textAlign:"center", padding: 32, color: "#5a5a78" }}>جاري التحميل...</div> :
          tickets.length === 0 ? (
            <div style={st.empty}><div style={st.emptyIcon}>📭</div><div style={st.emptyTitle}>لا توجد تيكتات بعد</div><div style={st.emptySub}>ارفع تيكتك الأول من التبويب أعلاه</div></div>
          ) : (
            <div>{tickets.map(t => (
              <div key={t.id} style={st.tCard}>
                <div style={st.tHead}><div style={st.tTitle}>{t.title}</div><div style={{ display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>{statusBadge(t.status)}{badge(t.category,"#14143a","#a855f7")}</div></div>
                <div style={st.tDesc}>{t.description}</div>
                {t.admin_reply && <div style={st.tReply}><div style={st.tReplyLabel}>💬 رد الدعم التقني</div><div style={st.tReplyText}>{t.admin_reply}</div></div>}
                <div style={st.tDate}>{fmtDate(t.created_at)}</div>
              </div>
            ))}</div>
          )
        )}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  function tryLogin() { if (pass === ADMIN_PASS) { sessionStorage.setItem("vision_admin","1"); onSuccess(); } else { setErr(true); setTimeout(()=>setErr(false),2000); } }
  return (
    <div style={st.wrap}>
      <div style={st.card}>
        <div style={st.logo}><div style={st.logoIcon}>🔐</div><div style={st.logoName}>VISION IT</div></div>
        <div style={st.tag}>Admin Panel</div>
        <div style={st.title}>دخول المشرف</div>
        <div style={st.sub}>أدخل كلمة مرور المشرف</div>
        <div style={{ marginBottom: 16 }}><label style={st.label}>كلمة المرور</label>
          <input type="password" style={{ ...st.input, ...(err?{border:"1px solid #ef4444"}:{}) }} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="••••••••" />
        </div>
        {err && <div style={st.err}>❌ كلمة المرور غير صحيحة</div>}
        <div style={{ marginTop: 16 }}><button style={st.btn} onClick={tryLogin}>دخول ←</button></div>
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
    const t = await dbSelect("tickets");
    const d = await dbSelect("devices");
    setTickets(Array.isArray(t)?t:[]);
    setDevices(Array.isArray(d)?d:[]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function closeTicket(id) {
    await dbUpdate("tickets", { status: "closed", closed_at: new Date().toISOString() }, id);
    setTickets(p => p.map(t => t.id === id ? { ...t, status: "closed" } : t));
  }
  async function reopenTicket(id) {
    await dbUpdate("tickets", { status: "open", closed_at: null }, id);
    setTickets(p => p.map(t => t.id === id ? { ...t, status: "open" } : t));
  }
  async function sendReply(id) {
    if (!replyText.trim()) return;
    setSaving(true);
    await dbUpdate("tickets", { admin_reply: replyText.trim() }, id);
    setTickets(p => p.map(t => t.id === id ? { ...t, admin_reply: replyText.trim() } : t));
    setReplyId(null); setReplyText(""); setSaving(false);
  }
  async function delDevice(id) {
    if (!window.confirm("تأكيد الحذف؟")) return;
    await dbDelete("devices", id);
    setDevices(p => p.filter(d => d.id !== id));
  }

  let shown = tickets;
  if (filter !== "all") shown = shown.filter(t => t.status === filter);
  if (search) shown = shown.filter(t => t.employee_name?.includes(search) || t.title?.includes(search) || t.department?.includes(search));

  const open = tickets.filter(t => t.status === "open").length;
  const closed = tickets.filter(t => t.status === "closed").length;
  const high = tickets.filter(t => t.priority === "high" && t.status === "open").length;

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#e2e2f0", fontFamily:"system-ui,sans-serif", direction:"rtl" }}>
      <div style={st.topbar}>
        <div style={st.topL}><span style={{fontSize:18}}>👁️</span><span style={st.topLogo}>VISION IT</span><span style={st.topBadge}>ADMIN</span></div>
        <div style={st.topR}><div style={st.chip}><div style={st.avatar}>AD</div><span>المشرف</span></div><button style={st.iconBtn} onClick={loadAll}>🔄</button><button style={st.iconBtn} onClick={onLogout}>خروج</button></div>
      </div>
      <div style={st.page}>
        <div style={st.stats}>
          <div style={st.stat}><div style={{...st.statN,color:"#a855f7"}}>{tickets.length}</div><div style={st.statL}>إجمالي التيكتات</div></div>
          <div style={st.stat}><div style={{...st.statN,color:"#f59e0b"}}>{open}</div><div style={st.statL}>مفتوحة</div></div>
          <div style={st.stat}><div style={{...st.statN,color:"#10b981"}}>{closed}</div><div style={st.statL}>مغلقة</div></div>
        </div>
        {high>0 && <div style={st.urgentBar}>⚠️ عندك <strong>{high}</strong> تيكت عاجل مفتوح</div>}
        <div style={st.tabs}>
          <button style={tab==="tickets"?st.tabOn:st.tab} onClick={()=>setTab("tickets")}>🎫 التيكتات</button>
          <button style={tab==="devices"?st.tabOn:st.tab} onClick={()=>setTab("devices")}>🖥️ الأجهزة ({devices.length})</button>
        </div>
        {tab==="tickets" && (
          <>
            <input style={st.search} placeholder="🔍 ابحث..." value={search} onChange={e=>setSearch(e.target.value)} />
            <div style={{...st.tabs,marginBottom:18}}>
              {[["all","الكل"],["open","المفتوحة"],["closed","المغلقة"]].map(([v,l]) => (
                <button key={v} style={filter===v?st.tabOn:st.tab} onClick={()=>setFilter(v)}>{l}</button>
              ))}
            </div>
            {loading ? <div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div> : shown.length===0 ? (
              <div style={st.empty}><div style={st.emptyIcon}>📭</div><div style={st.emptyTitle}>لا توجد تيكتات</div></div>
            ) : (
              <div>{shown.map(t => (
                <div key={t.id} style={st.tCard}>
                  <div style={st.tHead}>
                    <div style={st.tTitle}>{t.title}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>{statusBadge(t.status)}{priorityBadge(t.priority)}{badge(t.category,"#14143a","#a855f7")}</div>
                  </div>
                  <div style={st.tDesc}>{t.description}</div>
                  {t.admin_reply && <div style={st.tReply}><div style={st.tReplyLabel}>💬 ردك</div><div style={st.tReplyText}>{t.admin_reply}</div></div>}
                  <div style={st.tFoot}>
                    <div style={st.tMeta}>
                      <span style={st.tUser}>👤 {t.employee_name} — {t.department}</span>
                      {t.project && <span style={st.tSerial}>💼 {t.project}</span>}
                      <span style={st.tSerial}>🖥️ {t.serial_number}</span>
                      <span style={st.tDate}>{fmtDate(t.created_at)}</span>
                    </div>
                    <div style={st.tActions}>
                      <button style={st.btnGhost} onClick={() => { setReplyId(replyId===t.id?null:t.id); setReplyText(t.admin_reply||""); }}>💬 {t.admin_reply ? "تعديل الرد" : "رد"}</button>
                      {t.status==="open" ? <button style={st.btnGreen} onClick={() => closeTicket(t.id)}>✅ إغلاق</button> : <button style={st.btnGhost} onClick={() => reopenTicket(t.id)}>↩️ إعادة فتح</button>}
                    </div>
                  </div>
                  {replyId===t.id && (
                    <div style={st.replyBox}>
                      <textarea style={{...st.textarea,minHeight:70}} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." />
                      <div style={st.replyRow}>
                        <button style={st.btnGhost} onClick={() => setReplyId(null)}>إلغاء</button>
                        <button style={{...st.btn,width:"auto",padding:"7px 14px",fontSize:12,borderRadius:8,opacity:(!replyText.trim()||saving)?0.4:1}} onClick={() => sendReply(t.id)} disabled={saving||!replyText.trim()}>{saving?"جاري...":"إرسال الرد"}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}</div>
            )}
          </>
        )}
        {tab==="devices" && (loading ? <div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div> : devices.length===0 ? (
          <div style={st.empty}><div style={st.emptyIcon}>🖥️</div><div style={st.emptyTitle}>لا توجد أجهزة مسجلة</div></div>
        ) : (
          <div>{devices.map(d => (
            <div key={d.id} style={st.devCard}>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>👤 {d.employee_name}</div>
                <div style={{fontSize:12,color:"#5a5a78"}}>{d.department} {d.project ? "— 💼 "+d.project : ""}</div>
                <div style={{fontSize:10,color:"#3a3a5a",fontFamily:"monospace"}}>🖥️ {d.serial_number}</div>
              </div>
              <button style={st.btnRed} onClick={() => delDevice(d.id)}>حذف</button>
            </div>
          ))}</div>
        ))}
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
      const s = localStorage.getItem("vision_user");
      if (s) { setUser(JSON.parse(s)); setMode("user"); }
      else setMode("setup");
    } catch { setMode("setup"); }
  }, []);

  if (mode === "loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810",color:"#7c3aed"}}>جاري التحميل...</div>;

  return (
    <>
      {mode==="setup" && <SetupScreen onDone={u=>{setUser(u);setMode("user");}} />}
      {mode==="user" && user && <UserApp user={user} onLogout={()=>{localStorage.removeItem("vision_user");setMode("setup");}} />}
      {mode==="adminLogin" && <AdminLogin onSuccess={()=>setMode("admin")} />}
      {mode==="admin" && <AdminApp onLogout={()=>{sessionStorage.removeItem("vision_admin");setMode("adminLogin");}} />}
    </>
  );
}
