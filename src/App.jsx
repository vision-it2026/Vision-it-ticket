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
  const url = new URLSearchParams(window.location.search);
  const serial = url.get("s");
  const token = url.get("token");
  if (serial && token) {
    localStorage.setItem("vision_serial", serial);
    return serial;
  }
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
< truncated lines 101-250 >
  async function closeTicket(id) { await dbUpdate("tickets",{status:"closed",closed_at:new Date().toISOString()},id); setTickets(p=>p.map(t=>t.id===id?{...t,status:"closed"}:t)); }
  async function reopenTicket(id) { await dbUpdate("tickets",{status:"open",closed_at:null},id); setTickets(p=>p.map(t=>t.id===id?{...t,status:"open"}:t)); }
  async function sendReply(id) { if(!replyText.trim())return; setSaving(true); await dbUpdate("tickets",{admin_reply:replyText.trim()},id); setTickets(p=>p.map(t=>t.id===id?{...t,admin_reply:replyText.trim()}:t)); setReplyId(null);setReplyText("");setSaving(false); }
  async function delDevice(id) { if(!window.confirm("تأكيد الحذف؟"))return; await dbDelete("devices",id); setDevices(p=>p.filter(d=>d.id!==id)); }
  let shown = tickets;
  if(filter!=="all") shown=shown.filter(t=>t.status===filter);
  if(search) shown=shown.filter(t=>t.employee_name?.includes(search)||t.title?.includes(search)||t.department?.includes(search));
  const open=tickets.filter(t=>t.status==="open").length; const closed=tickets.filter(t=>t.status==="closed").length;
  const high=tickets.filter(t=>t.priority==="high"&&t.status==="open").length;
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
        {high>0&&<div style={st.urgentBar}>⚠️ عندك <strong>{high}</strong> تيكت عاجل مفتوح</div>}
        <div style={st.tabs}>
          <button style={tab==="tickets"?st.tabOn:st.tab} onClick={()=>setTab("tickets")}>🎫 التيكتات</button>
          <button style={tab==="devices"?st.tabOn:st.tab} onClick={()=>setTab("devices")}>🖥️ الأجهزة ({devices.length})</button>
        </div>
        {tab==="tickets"&&(
          <>
            <input style={st.search} placeholder="🔍 ابحث..." value={search} onChange={e=>setSearch(e.target.value)} />
            <div style={{...st.tabs,marginBottom:18}}>
              {[["all","الكل"],["open","المفتوحة"],["closed","المغلقة"]].map(([v,l])=>(
                <button key={v} style={filter===v?st.tabOn:st.tab} onClick={()=>setFilter(v)}>{l}</button>
              ))}
            </div>
            {loading?<div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div>:shown.length===0?(
              <div style={st.empty}><div style={st.emptyIcon}>📭</div><div style={st.emptyTitle}>لا توجد تيكتات</div></div>
            ):(
              <div>{shown.map(t=>(
                <div key={t.id} style={st.tCard}>
                  <div style={st.tHead}><div style={st.tTitle}>{t.title}</div><div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>{statusBadge(t.status)}{priorityBadge(t.priority)}{badge(t.category,"#14143a","#a855f7")}</div></div>
                  <div style={st.tDesc}>{t.description}</div>
                  {t.admin_reply&&<div style={st.tReply}><div style={st.tReplyLabel}>💬 ردك</div><div style={st.tReplyText}>{t.admin_reply}</div></div>}
                  <div style={st.tFoot}>
                    <div style={st.tMeta}>
                      <span style={st.tUser}>👤 {t.employee_name} — {t.department}</span>
                      {t.project&&<span style={st.tSerial}>💼 {t.project}</span>}
                      <span style={st.tSerial}>🖥️ {t.serial_number}</span>
                      <span style={st.tDate}>{fmtDate(t.created_at)}</span>
                    </div>
                    <div style={st.tActions}>
                      <button style={st.btnGhost} onClick={()=>{setReplyId(replyId===t.id?null:t.id);setReplyText(t.admin_reply||"");}}>💬 {t.admin_reply?"تعديل الرد":"رد"}</button>
                      {t.status==="open"?<button style={st.btnGreen} onClick={()=>closeTicket(t.id)}>✅ إغلاق</button>:<button style={st.btnGhost} onClick={()=>reopenTicket(t.id)}>↩️ إعادة فتح</button>}
                    </div>
                  </div>
                  {replyId===t.id&&(
                    <div style={st.replyBox}>
                      <textarea style={{...st.textarea,minHeight:70}} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." />
                      <div style={st.replyRow}>
                        <button style={st.btnGhost} onClick={()=>setReplyId(null)}>إلغاء</button>
                        <button style={{...st.btn,width:"auto",padding:"7px 14px",fontSize:12,borderRadius:8,opacity:(!replyText.trim()||saving)?0.4:1}} onClick={()=>sendReply(t.id)} disabled={saving||!replyText.trim()}>{saving?"جاري...":"إرسال الرد"}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}</div>
            )}
          </>
        )}
        {tab==="devices"&&(loading?<div style={{textAlign:"center",padding:32,color:"#5a5a78"}}>جاري التحميل...</div>:devices.length===0?(
          <div style={st.empty}><div style={st.emptyIcon}>🖥️</div><div style={st.emptyTitle}>لا توجد أجهزة مسجلة</div></div>
        ):(
          <div>{devices.map(d=>(
            <div key={d.id} style={st.devCard}>
              <div><div style={{fontSize:14,fontWeight:600,marginBottom:3}}>👤 {d.employee_name}</div><div style={{fontSize:12,color:"#5a5a78"}}>{d.department} {d.project?"— 💼 "+d.project:""}</div><div style={{fontSize:10,color:"#3a3a5a",fontFamily:"monospace"}}>🖥️ {d.serial_number}</div></div>
              <button style={st.btnRed} onClick={()=>delDevice(d.id)}>حذف</button>
            </div>
          ))}</div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("loading"); const [user, setUser] = useState(null);
  useEffect(()=>{
    const url = new URLSearchParams(window.location.search);
    if(url.get("admin")==="1"){if(sessionStorage.getItem("vision_admin")==="1")setMode("admin");else setMode("adminLogin");return;}
    try{const s=localStorage.getItem("vision_user");if(s){setUser(JSON.parse(s));setMode("user");}else setMode("setup");}catch{setMode("setup");}
  },[]);
  if(mode==="loading") return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080810",color:"#7c3aed"}}>جاري التحميل...</div>;
  return (
    <>
      {mode==="setup"&&<SetupScreen onDone={u=>{setUser(u);setMode("user");}} />}
      {mode==="user"&&user&&<UserApp user={user} onLogout={()=>{localStorage.removeItem("vision_user");setMode("setup");}} />}
      {mode==="adminLogin"&&<AdminLogin onSuccess={()=>setMode("admin")} />}
      {mode==="admin"&&<AdminApp onLogout={()=>{sessionStorage.removeItem("vision_admin");setMode("adminLogin");}} />}
    </>
  );
}
