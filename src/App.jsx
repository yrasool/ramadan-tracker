import { useState, useEffect } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "./firebase";

const RAMADAN_START = new Date(2026, 1, 19);
const TOTAL_DAYS = 30;
const USERS = ["Yusra", "Zaminah"];
const PRESET_ZIKR = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah"];

const today = new Date(2026, 1, 20);
function getDayNumber(date) {
  const start = new Date(RAMADAN_START); start.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return Math.floor((d - start) / 86400000) + 1;
}
const todayNum = getDayNumber(today);

function getDayDate(dayNum) {
  const d = new Date(RAMADAN_START);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function emptyDayData() {
  return {
    zikr: PRESET_ZIKR.reduce((a, z) => ({ ...a, [z]: "" }), {}),
    customZikr: [{ name: "", count: "" }, { name: "", count: "" }],
    quranPages: "",
    quranJuz: "",
    surahsRecited: "",
    surahsMemorizing: "",
    namesOfAllah: "",
  };
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function TrackerView({ data }) {
  const d = data || emptyDayData();
  return (
    <div style={s.form}>
      <Section title="📿 Zikr Count">
        <div style={s.zikrGrid}>
          {PRESET_ZIKR.map(z => (
            <div key={z} style={s.zikrItem}>
              <label style={s.zikrLabel}>{z}</label>
              <div style={s.viewValue}>{d.zikr?.[z] || "—"}</div>
            </div>
          ))}
          {(d.customZikr || []).map((cz, i) => cz?.name ? (
            <div key={i} style={s.zikrItem}>
              <label style={s.zikrLabel}>{cz.name}</label>
              <div style={s.viewValue}>{cz.count || "—"}</div>
            </div>
          ) : null)}
        </div>
      </Section>
      <Section title="📖 Quran">
        <div style={s.row2}>
          <div style={s.field}><label style={s.label}>Pages</label><div style={s.viewValue}>{d.quranPages || "—"}</div></div>
          <div style={s.field}><label style={s.label}>Juz</label><div style={s.viewValue}>{d.quranJuz || "—"}</div></div>
        </div>
      </Section>
      <Section title="📜 Surahs Recited"><div style={s.viewText}>{d.surahsRecited || "—"}</div></Section>
      <Section title="🧠 Surahs Memorizing"><div style={s.viewText}>{d.surahsMemorizing || "—"}</div></Section>
      <Section title="✨ Names of Allah Learned"><div style={s.viewText}>{d.namesOfAllah || "—"}</div></Section>
    </div>
  );
}

function TrackerForm({ data, onChange, disabled }) {
  const d = data || emptyDayData();
  function updateZikr(key, val) { onChange({ ...d, zikr: { ...d.zikr, [key]: val } }); }
  function updateCustom(idx, key, val) {
    const cz = [...(d.customZikr || [{name:"",count:""},{name:"",count:""}])];
    cz[idx] = { ...cz[idx], [key]: val };
    onChange({ ...d, customZikr: cz });
  }
  return (
    <div style={s.form}>
      <Section title="📿 Zikr Count">
        <div style={s.zikrGrid}>
          {PRESET_ZIKR.map(z => (
            <div key={z} style={s.zikrItem}>
              <label style={s.zikrLabel}>{z}</label>
              <input type="number" min="0" placeholder="0" value={d.zikr?.[z] || ""} onChange={e => updateZikr(z, e.target.value)} disabled={disabled} style={s.zikrInput} />
            </div>
          ))}
          {(d.customZikr || [{name:"",count:""},{name:"",count:""}]).map((cz, i) => (
            <div key={i} style={s.zikrItem}>
              <input type="text" placeholder={`Custom ${i+1} name`} value={cz.name||""} onChange={e => updateCustom(i,"name",e.target.value)} disabled={disabled} style={{...s.zikrInput,fontSize:12,marginBottom:4}} />
              <input type="number" min="0" placeholder="0" value={cz.count||""} onChange={e => updateCustom(i,"count",e.target.value)} disabled={disabled} style={s.zikrInput} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="📖 Quran">
        <div style={s.row2}>
          <div style={s.field}><label style={s.label}>Pages Read</label><input type="number" min="0" placeholder="0" value={d.quranPages||""} onChange={e=>onChange({...d,quranPages:e.target.value})} disabled={disabled} style={s.input} /></div>
          <div style={s.field}><label style={s.label}>Juz #</label><input type="number" min="1" max="30" placeholder="1" value={d.quranJuz||""} onChange={e=>onChange({...d,quranJuz:e.target.value})} disabled={disabled} style={s.input} /></div>
        </div>
      </Section>
      <Section title="📜 Surahs Recited Today">
        <textarea placeholder="e.g. Al-Fatiha, Al-Baqarah 1–5..." value={d.surahsRecited||""} onChange={e=>onChange({...d,surahsRecited:e.target.value})} disabled={disabled} style={s.textarea} rows={2} />
      </Section>
      <Section title="🧠 Surahs Memorizing / Learned">
        <textarea placeholder="e.g. Al-Mulk (reviewing), Al-Kahf v1-10 (new)..." value={d.surahsMemorizing||""} onChange={e=>onChange({...d,surahsMemorizing:e.target.value})} disabled={disabled} style={s.textarea} rows={2} />
      </Section>
      <Section title="✨ Names of Allah Learned">
        <textarea placeholder="e.g. Ar-Rahman, Ar-Raheem, Al-Malik..." value={d.namesOfAllah||""} onChange={e=>onChange({...d,namesOfAllah:e.target.value})} disabled={disabled} style={s.textarea} rows={2} />
      </Section>
      {disabled && <div style={s.futureBanner}>🌙 This day hasn't arrived yet</div>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState({});
  const [localDay, setLocalDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(todayNum);
  const [viewUser, setViewUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);

  // Live sync from Firebase
  useEffect(() => {
    const dbRef = ref(db, "tracker");
    const unsub = onValue(dbRef, snap => {
      setAllData(snap.val() || {});
    });
    return () => unsub();
  }, []);

  // When selecting a day, load into local state for editing
  useEffect(() => {
    if (user) {
      const d = allData?.[user]?.[selectedDay] || emptyDayData();
      setLocalDay(JSON.parse(JSON.stringify(d)));
    }
  }, [selectedDay, user]);

  // Debounced save to Firebase
  function handleChange(newData) {
    setLocalDay(newData);
    if (saveTimer) clearTimeout(saveTimer);
    setSaving(true);
    const t = setTimeout(async () => {
      await set(ref(db, `tracker/${user}/${selectedDay}`), newData);
      setSaving(false);
    }, 800);
    setSaveTimer(t);
  }

  function calcProgress(u) {
    let filled = 0, total = 0;
    for (let d = 1; d <= todayNum; d++) {
      const day = allData?.[u]?.[d];
      if (!day) { total += PRESET_ZIKR.length + 2; continue; }
      PRESET_ZIKR.forEach(z => { total++; if (day.zikr?.[z]) filled++; });
      total++; if (day.quranPages) filled++;
      total++; if (day.namesOfAllah) filled++;
    }
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }

  if (!user) return (
    <div style={s.splash}>
      <div style={s.splashInner}>
        <div style={s.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
        <div style={s.splashMoon}>🌙</div>
        <h1 style={s.splashTitle}>Ramadan 1447</h1>
        <p style={s.splashSub}>Feb 19 – Mar 20, 2026 · Day {todayNum} Today</p>
        <p style={s.splashPrompt}>Who are you?</p>
        <div style={s.userBtns}>
          {USERS.map(u => (
            <button key={u} style={s.userBtn} onClick={() => { setUser(u); setViewUser(u); }}>
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const friendUser = USERS.find(u => u !== user);
  const friendDay = allData?.[friendUser]?.[selectedDay] || emptyDayData();

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerArabic}>رمضان مبارك</span>
          <span style={s.headerEn}>Ramadan 1447 · {saving ? "Saving..." : "✓ Saved"}</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.loggedAs}>Logged in as <b>{user}</b></span>
          <button style={s.switchBtn} onClick={() => setUser(null)}>Switch</button>
        </div>
      </div>

      <div style={s.progressRow}>
        {USERS.map(u => {
          const pct = calcProgress(u);
          return (
            <div key={u} style={s.progressCard}>
              <div style={s.progressLabel}>{u}</div>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: `${pct}%`, background: u === "Yusra" ? "#c9a96e" : "#7eb89a" }} />
              </div>
              <div style={s.progressPct}>{pct}%</div>
            </div>
          );
        })}
      </div>

      <div style={s.dayGrid}>
        {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(d => {
          const isToday = d === todayNum;
          const isFuture = d > todayNum;
          const isSelected = d === selectedDay;
          return (
            <button key={d} onClick={() => !isFuture && setSelectedDay(d)} style={{
              ...s.dayBtn,
              ...(isSelected ? s.dayBtnSelected : {}),
              ...(isToday && !isSelected ? s.dayBtnToday : {}),
              ...(isFuture ? s.dayBtnFuture : {}),
            }}>
              <div style={s.dayNum}>{d}</div>
              <div style={s.dayDate}>{getDayDate(d)}</div>
            </button>
          );
        })}
      </div>

      <div style={s.trackerWrap}>
        <div style={s.viewToggle}>
          <button style={{ ...s.viewBtn, ...(viewUser === user ? s.viewBtnActive : {}) }} onClick={() => setViewUser(user)}>
            {user}'s Log
          </button>
          <button style={{ ...s.viewBtn, ...(viewUser === friendUser ? s.viewBtnActive : {}) }} onClick={() => setViewUser(friendUser)}>
            {friendUser}'s Log
          </button>
        </div>

        <div style={s.dayHeader}>
          <span style={s.dayHeaderTitle}>Day {selectedDay} · {getDayDate(selectedDay)}</span>
          {viewUser !== user && <span style={s.readonlyBadge}>👁 Viewing {viewUser}</span>}
        </div>

        {viewUser === user ? (
          <TrackerForm data={localDay} onChange={handleChange} disabled={selectedDay > todayNum} />
        ) : (
          <TrackerView data={friendDay} />
        )}
      </div>
    </div>
  );
}

const s = {
  app: { minHeight: "100vh", background: "#0f1a14", color: "#e8dcc8", paddingBottom: 60 },
  splash: { minHeight: "100vh", background: "linear-gradient(160deg,#0f1a14 60%,#1a2d1e)", display: "flex", alignItems: "center", justifyContent: "center" },
  splashInner: { textAlign: "center", padding: 40 },
  bismillah: { fontSize: 22, color: "#c9a96e", marginBottom: 16, letterSpacing: 2 },
  splashMoon: { fontSize: 72, marginBottom: 8 },
  splashTitle: { fontSize: 38, color: "#e8dcc8", margin: "0 0 6px", fontWeight: "normal" },
  splashSub: { color: "#7eb89a", fontSize: 14, marginBottom: 32 },
  splashPrompt: { color: "#c9a96e", fontSize: 18, marginBottom: 20 },
  userBtns: { display: "flex", gap: 20, justifyContent: "center" },
  userBtn: { background: "transparent", border: "2px solid #c9a96e", color: "#c9a96e", padding: "14px 48px", fontSize: 20, borderRadius: 8, cursor: "pointer" },
  header: { background: "#0a120d", borderBottom: "1px solid #2a3d2e", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { display: "flex", flexDirection: "column" },
  headerArabic: { fontSize: 18, color: "#c9a96e", letterSpacing: 2 },
  headerEn: { fontSize: 11, color: "#5a7a5e", marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  loggedAs: { fontSize: 13, color: "#7eb89a" },
  switchBtn: { background: "transparent", border: "1px solid #3a5a3e", color: "#7eb89a", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 },
  progressRow: { display: "flex", gap: 16, padding: "14px 24px", background: "#0a120d", borderBottom: "1px solid #1a2d1e" },
  progressCard: { flex: 1, display: "flex", alignItems: "center", gap: 10 },
  progressLabel: { fontSize: 13, color: "#c9a96e", minWidth: 60 },
  progressBar: { flex: 1, height: 8, background: "#1a2d1e", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  progressPct: { fontSize: 12, color: "#5a7a5e", minWidth: 32, textAlign: "right" },
  dayGrid: { display: "flex", flexWrap: "wrap", gap: 6, padding: "16px 24px", background: "#0d1810", borderBottom: "1px solid #1a2d1e" },
  dayBtn: { background: "#1a2d1e", border: "1px solid #2a3d2e", color: "#7eb89a", borderRadius: 6, padding: "6px 8px", cursor: "pointer", minWidth: 52, textAlign: "center" },
  dayBtnSelected: { background: "#c9a96e", color: "#0a120d", border: "1px solid #c9a96e" },
  dayBtnToday: { border: "2px solid #c9a96e" },
  dayBtnFuture: { opacity: 0.3, cursor: "default" },
  dayNum: { fontSize: 15, fontWeight: "bold" },
  dayDate: { fontSize: 9, opacity: 0.7 },
  trackerWrap: { maxWidth: 700, margin: "24px auto", padding: "0 16px" },
  viewToggle: { display: "flex", gap: 8, marginBottom: 16 },
  viewBtn: { flex: 1, background: "#1a2d1e", border: "1px solid #2a3d2e", color: "#7eb89a", padding: 10, borderRadius: 6, cursor: "pointer", fontSize: 14 },
  viewBtnActive: { background: "#2a3d2e", border: "1px solid #c9a96e", color: "#c9a96e" },
  dayHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  dayHeaderTitle: { fontSize: 20, color: "#c9a96e" },
  readonlyBadge: { fontSize: 12, color: "#5a7a5e", background: "#1a2d1e", padding: "4px 10px", borderRadius: 20 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  section: { background: "#111d14", border: "1px solid #2a3d2e", borderRadius: 10, padding: 18 },
  sectionTitle: { fontSize: 14, color: "#c9a96e", marginBottom: 14 },
  zikrGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 12 },
  zikrItem: { display: "flex", flexDirection: "column", gap: 4 },
  zikrLabel: { fontSize: 12, color: "#7eb89a" },
  zikrInput: { background: "#0a120d", border: "1px solid #2a3d2e", color: "#e8dcc8", borderRadius: 6, padding: "8px 10px", fontSize: 16, outline: "none", width: "100%" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, color: "#7eb89a" },
  input: { background: "#0a120d", border: "1px solid #2a3d2e", color: "#e8dcc8", borderRadius: 6, padding: "10px 12px", fontSize: 16, outline: "none" },
  textarea: { background: "#0a120d", border: "1px solid #2a3d2e", color: "#e8dcc8", borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%", resize: "vertical", lineHeight: 1.6 },
  viewValue: { fontSize: 22, color: "#c9a96e", fontWeight: "bold" },
  viewText: { fontSize: 14, color: "#e8dcc8", lineHeight: 1.7, minHeight: 40 },
  futureBanner: { textAlign: "center", color: "#5a7a5e", fontSize: 14, padding: 16 },
};
