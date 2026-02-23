import { useEffect, useMemo, useRef, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";

const RAMADAN_START = new Date(2026, 1, 19);
const TOTAL_DAYS = 30;
const USERS = ["Yusra", "Zaminah"];
const USER_RECORD_KEYS = { Yusra: "yusra", Zaminah: "zaminah" };

const PRESET_ZIKR = [
  { key: "SubhanAllah", ar: "سُبحانَ الله", en: "SubhanAllah" },
  { key: "Alhamdulillah", ar: "الحَمدُ لله", en: "Alhamdulillah" },
  { key: "AllahuAkbar", ar: "اللهُ أكبَر", en: "Allahu Akbar" },
  { key: "Astaghfirullah", ar: "أستَغفِرُ الله", en: "Astaghfirullah" },
];

const DOORS = [
  { id: "zikr", ar: "الذِّكر", en: "Zikr",
    zelC1: "#0f2a50", zelC2: "#1a5a9a", zelC3: "#3a9ad0", zelAcc: "#f5c842",
    panC1: "#162850", panC2: "#0a1830", panStr: "#3a7ab0", panKnk: "#3a8aba",
    glow: "rgba(26,90,154,.95)", glowD: "rgba(10,40,80,.5)" },
  { id: "quran", ar: "القُرآن", en: "Quran",
    zelC1: "#0a2015", zelC2: "#1a5a30", zelC3: "#2aaa60", zelAcc: "#f5c842",
    panC1: "#102818", panC2: "#081508", panStr: "#2a8a40", panKnk: "#2aaa50",
    glow: "rgba(26,90,48,.95)", glowD: "rgba(10,40,20,.5)" },
  { id: "surahs", ar: "السُّوَر", en: "Surahs Recited",
    zelC1: "#200810", zelC2: "#6a1a28", zelC3: "#c05060", zelAcc: "#f5c842",
    panC1: "#3a0e18", panC2: "#200810", panStr: "#a03040", panKnk: "#c04050",
    glow: "rgba(139,34,60,.9)", glowD: "rgba(60,10,20,.5)" },
  { id: "memorize", ar: "الحِفظ", en: "Memorization",
    zelC1: "#100820", zelC2: "#3a1a70", zelC3: "#8060d0", zelAcc: "#f5c842",
    panC1: "#200c40", panC2: "#100820", panStr: "#7050c0", panKnk: "#9070d0",
    glow: "rgba(80,40,150,.9)", glowD: "rgba(30,10,60,.5)" },
  { id: "names", ar: "أسماء الله", en: "Names of Allah",
    zelC1: "#041818", zelC2: "#0a5858", zelC3: "#20c0c0", zelAcc: "#f5c842",
    panC1: "#083030", panC2: "#041818", panStr: "#20a0a0", panKnk: "#30c0c0",
    glow: "rgba(13,115,115,.9)", glowD: "rgba(4,44,44,.5)" },
];

const ROOM_IMAGES = {
  zikr: new URL("./zikr.jpg", import.meta.url).href,
  quran: new URL("./Quran.jpg", import.meta.url).href,
  surahs: new URL("./surah.jpg", import.meta.url).href,
  memorize: new URL("./memorize.jpg", import.meta.url).href,
  names: new URL("./names.jpg", import.meta.url).href,
};

const ROOM_BACKGROUNDS = {
  zikr: `linear-gradient(180deg, rgba(5,15,35,0.72) 0%, rgba(8,18,45,0.82) 100%), url(${ROOM_IMAGES.zikr})`,
  quran: `linear-gradient(180deg, rgba(4,18,8,0.72) 0%, rgba(5,14,6,0.82) 100%), url(${ROOM_IMAGES.quran})`,
  surahs: `linear-gradient(180deg, rgba(20,4,10,0.72) 0%, rgba(14,3,8,0.82) 100%), url(${ROOM_IMAGES.surahs})`,
  memorize: `linear-gradient(180deg, rgba(10,5,25,0.72) 0%, rgba(7,3,18,0.82) 100%), url(${ROOM_IMAGES.memorize})`,
  names: `linear-gradient(180deg, rgba(2,14,14,0.72) 0%, rgba(2,10,10,0.82) 100%), url(${ROOM_IMAGES.names})`,
};

const FLOATING_STARS = [
  { symbol: "✦", left: "8vw", duration: 14, delay: 0, size: 7 },
  { symbol: "✧", left: "26vw", duration: 17, delay: 2.5, size: 12 },
  { symbol: "⋆", left: "44vw", duration: 20, delay: 5, size: 7 },
  { symbol: "·", left: "62vw", duration: 23, delay: 7.5, size: 12 },
  { symbol: "✵", left: "80vw", duration: 26, delay: 10, size: 7 },
];

const today = new Date();
function getDayNumber(date) {
  const start = new Date(RAMADAN_START); start.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return Math.floor((d - start) / 86400000) + 1;
}
const todayNumRaw = getDayNumber(today);
const todayNum = Math.min(Math.max(todayNumRaw, 1), TOTAL_DAYS);

function getDayDate(dayNum) {
  const d = new Date(RAMADAN_START);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CUSTOM_ZIKR_DEFAULT = [{ name: "", count: "" }, { name: "", count: "" }];

function emptyDayData() {
  return {
    zikr: PRESET_ZIKR.reduce((a, z) => ({ ...a, [z.key]: "" }), {}),
    customZikr: [...CUSTOM_ZIKR_DEFAULT],
    additionalZikr: "",
    quranPages: "",
    quranJuz: "",
    quranSurahRecited: "",
    surahsRecited: "",
    surahsMemorizing: "",
    namesOfAllah: "",
  };
}

function getUserData(allData, userName) {
  const key = USER_RECORD_KEYS[userName] || userName?.toLowerCase();
  return allData?.[key] || allData?.[userName] || allData?.[userName?.toLowerCase()] || {};
}

function buildDoorSvg(d) {
  const grooveYs = [70, 82, 94, 106, 130, 150, 170, 190, 210, 230, 250, 270];
  const grooveLines = grooveYs
    .map(y => `<line x1="4" y1="${y}" x2="28" y2="${y}"/><line x1="136" y1="${y}" x2="160" y2="${y}"/>`)
    .join("");

  const rosettes = [120, 165, 210, 255]
    .map(y => `<rect x="7" y="${y - 9}" width="18" height="18" transform="rotate(45 16 ${y})"/>
      <rect x="138" y="${y - 9}" width="18" height="18" transform="rotate(45 147 ${y})"/>`)
    .join("");

  const dots = [26, 46, 66, 86, 106, 126, 146]
    .map(x => `<circle cx="${x}" cy="34" r="2"/>`)
    .join("");

  const thresholdLines = [38, 46, 54, 62, 70, 78, 86, 94, 102, 110, 118, 126]
    .map(x => `<line x1="${x}" y1="281" x2="${x}" y2="290"/>`)
    .join("");

  return `
    <defs>
      <pattern id="zel-${d.id}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="${d.zelC1}"/>
        <polygon points="10,1 13,7 19,7 14,11 16,18 10,14 4,18 6,11 1,7 7,7" fill="${d.zelC2}" stroke="${d.zelAcc}" stroke-width=".45"/>
        <polygon points="10,5 12,9 16,9 13,12 14,16 10,13 6,16 7,12 4,9 8,9" fill="${d.zelC1}" stroke="${d.zelC3}" stroke-width=".35"/>
        <circle cx="10" cy="10" r="2.2" fill="${d.zelC3}" opacity=".75"/>
        <line x1="0" y1="10" x2="20" y2="10" stroke="${d.zelAcc}" stroke-width=".15" opacity=".3"/>
        <line x1="10" y1="0" x2="10" y2="20" stroke="${d.zelAcc}" stroke-width=".15" opacity=".3"/>
      </pattern>
      <clipPath id="aclip-${d.id}"><path d="M 32 285 L 32 120 Q 32 28 82 16 Q 132 28 132 120 L 132 285 Z"/></clipPath>
      <linearGradient id="stuccoH-${d.id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5a3a10"/><stop offset="18%" stop-color="#c8a97a"/>
        <stop offset="50%" stop-color="#e8d5b0"/><stop offset="82%" stop-color="#c8a97a"/>
        <stop offset="100%" stop-color="#5a3a10"/>
      </linearGradient>
      <linearGradient id="stuccoV-${d.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0c898"/><stop offset="40%" stop-color="#c8a97a"/>
        <stop offset="100%" stop-color="#5a3a10"/>
      </linearGradient>
      <linearGradient id="panG-${d.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${d.panC1}"/><stop offset="100%" stop-color="${d.panC2}"/>
      </linearGradient>
    </defs>

    <rect x="0" y="58" width="32" height="232" fill="url(#stuccoV-${d.id})"/>
    <rect x="132" y="58" width="32" height="232" fill="url(#stuccoV-${d.id})"/>

    <g stroke="#8a6030" stroke-width=".6" opacity=".55">${grooveLines}</g>
    <g fill="none" stroke="#c8a97a" stroke-width=".8" opacity=".45">${rosettes}</g>

    <line x1="3" y1="60" x2="3" y2="288" stroke="#c8a97a" stroke-width=".8" opacity=".5"/>
    <line x1="29" y1="60" x2="29" y2="288" stroke="#c8a97a" stroke-width=".8" opacity=".5"/>
    <line x1="135" y1="60" x2="135" y2="288" stroke="#c8a97a" stroke-width=".8" opacity=".5"/>
    <line x1="161" y1="60" x2="161" y2="288" stroke="#c8a97a" stroke-width=".8" opacity=".5"/>

    <rect x="0" y="18" width="164" height="42" fill="url(#stuccoH-${d.id})"/>
    <g fill="none" stroke="#8a6030" stroke-width=".8" opacity=".65">
      <path d="M 6 28 Q 16 20 26 28 Q 36 20 46 28 Q 56 20 66 28 Q 76 20 86 28 Q 96 20 106 28 Q 116 20 126 28 Q 136 20 146 28 Q 156 20 164 28"/>
      <path d="M 6 40 Q 16 32 26 40 Q 36 32 46 40 Q 56 32 66 40 Q 76 32 86 40 Q 96 32 106 40 Q 116 32 126 40 Q 136 32 146 40 Q 156 32 164 40"/>
      <path d="M 6 52 Q 16 44 26 52 Q 36 44 46 52 Q 56 44 66 52 Q 76 44 86 52 Q 96 44 106 52 Q 116 44 126 52 Q 136 44 146 52 Q 156 44 164 52"/>
    </g>
    <g fill="#c8a97a" opacity=".4">${dots}</g>

    <ellipse cx="29" cy="289" rx="10" ry="3" fill="#c8a97a" opacity=".7"/>
    <rect x="24" y="155" width="10" height="134" rx="5" fill="url(#stuccoV-${d.id})" stroke="#c8a97a" stroke-width=".7"/>
    <rect x="26" y="155" width="6" height="134" rx="3" fill="rgba(255,255,255,.1)"/>
    <path d="M 18 157 L 18 152 Q 29 138 40 152 L 40 157 Z" fill="#c8a97a" stroke="#f5c842" stroke-width=".8"/>
    <path d="M 20 151 Q 29 142 38 151" fill="none" stroke="#f5c842" stroke-width=".7"/>
    <path d="M 22 148 Q 29 140 36 148" fill="none" stroke="#e8d5b0" stroke-width=".5" opacity=".6"/>

    <ellipse cx="135" cy="289" rx="10" ry="3" fill="#c8a97a" opacity=".7"/>
    <rect x="130" y="155" width="10" height="134" rx="5" fill="url(#stuccoV-${d.id})" stroke="#c8a97a" stroke-width=".7"/>
    <rect x="132" y="155" width="6" height="134" rx="3" fill="rgba(255,255,255,.1)"/>
    <path d="M 124 157 L 124 152 Q 135 138 146 152 L 146 157 Z" fill="#c8a97a" stroke="#f5c842" stroke-width=".8"/>
    <path d="M 126 151 Q 135 142 144 151" fill="none" stroke="#f5c842" stroke-width=".7"/>
    <path d="M 128 148 Q 135 140 142 148" fill="none" stroke="#e8d5b0" stroke-width=".5" opacity=".6"/>

    <rect x="32" y="120" width="100" height="165" fill="url(#zel-${d.id})" clip-path="url(#aclip-${d.id})"/>

    <path d="M 22 285 L 22 122 Q 22 18 82 6 Q 142 18 142 122 L 142 285" fill="none" stroke="#7a5020" stroke-width="1.2" opacity=".8"/>
    <path d="M 32 285 L 32 120 Q 32 28 82 16 Q 132 28 132 120 L 132 285" fill="none" stroke="#f5c842" stroke-width="2.8"/>
    <path d="M 36 285 L 36 123 Q 36 35 82 24 Q 128 35 128 123 L 128 285" fill="none" stroke="#e8d5b0" stroke-width="1.2" opacity=".6"/>
    <path d="M 40 285 L 40 126 Q 40 42 82 32 Q 124 42 124 126 L 124 285" fill="none" stroke="#c8a97a" stroke-width=".7" opacity=".4"/>

    <path d="M 32 120 Q 32 28 82 16 Q 132 28 132 120 L 128 120 Q 128 34 82 22 Q 36 34 36 120 Z" fill="url(#stuccoH-${d.id})" opacity=".9"/>
    <g fill="#c8a97a" stroke="#8a6030" stroke-width=".7">
      <path d="M 32 119 Q 40 107 48 114 Q 56 102 64 111 Q 72 98 82 106 Q 92 98 100 111 Q 108 102 116 114 Q 124 107 132 119"/>
    </g>
    <g fill="#d8b98a" stroke="#c8a97a" stroke-width=".6">
      <path d="M 36 119 Q 42 110 48 116 Q 54 107 60 114 Q 66 105 72 111 Q 78 103 82 108 Q 86 103 92 111 Q 98 105 104 114 Q 110 107 116 116 Q 122 110 128 119"/>
    </g>
    <g fill="#e8d5b0" stroke="#c8a97a" stroke-width=".5" opacity=".8">
      <path d="M 40 119 Q 45 112 50 117 Q 55 110 60 116 Q 65 108 70 114 Q 75 107 82 112 Q 89 107 94 114 Q 99 108 104 116 Q 109 110 114 117 Q 119 112 124 119"/>
    </g>
    <g fill="#f5c842" opacity=".7">
      <circle cx="48" cy="113" r="1.5"/><circle cx="64" cy="110" r="1.5"/>
      <circle cx="82" cy="105" r="2"/><circle cx="100" cy="110" r="1.5"/>
      <circle cx="116" cy="113" r="1.5"/>
    </g>

    <circle cx="82" cy="14" r="10" fill="#3a2008" stroke="#c8a97a" stroke-width="1"/>
    <polygon points="82,5 84.5,11 91,11 86,15 88,21 82,17 76,21 78,15 73,11 79.5,11" fill="#f5c842" stroke="#e8d5b0" stroke-width=".5"/>
    <circle cx="82" cy="14" r="4" fill="none" stroke="#f5c842" stroke-width=".8"/>
    <circle cx="82" cy="14" r="1.5" fill="#f5c842"/>

    <rect x="30" y="281" width="104" height="9" fill="url(#stuccoH-${d.id})" stroke="#c8a97a" stroke-width=".8"/>
    <rect x="30" y="287" width="104" height="2" fill="#f5c842" opacity=".5"/>
    <rect x="30" y="281" width="104" height="2" fill="#e8d5b0" opacity=".4"/>
    <g fill="none" stroke="${d.zelAcc}" stroke-width=".4" opacity=".3">${thresholdLines}</g>
  `;
}

function buildPanelSvg(d) {
  return `
    <rect width="48" height="175" fill="url(#panG-${d.id})"/>
    <path d="M 4 28 Q 24 4 44 28" fill="none" stroke="${d.panStr}" stroke-width="1.2"/>
    <path d="M 8 33 Q 24 12 40 33" fill="none" stroke="${d.panStr}" stroke-width=".7" opacity=".6"/>
    <polygon points="24,50 26,58 34,58 28,63 30,71 24,66 18,71 20,63 14,58 22,58" fill="none" stroke="${d.panStr}" stroke-width="1.1"/>
    <circle cx="24" cy="60" r="3.5" fill="none" stroke="${d.panStr}" stroke-width=".5" opacity=".4"/>
    <circle cx="24" cy="60" r="1.2" fill="${d.panKnk}" opacity=".6"/>
    <rect x="6" y="82" width="36" height="1.5" fill="${d.panStr}" opacity=".55"/>
    <rect x="6" y="90" width="36" height="1" fill="${d.panStr}" opacity=".35"/>
    <rect x="6" y="112" width="36" height="1.5" fill="${d.panStr}" opacity=".55"/>
    <polygon points="24,128 26,134 32,134 27,138 29,144 24,140 19,144 21,138 16,134 22,134" fill="none" stroke="${d.panStr}" stroke-width=".9"/>
    <line x1="24" y1="75" x2="24" y2="120" stroke="${d.panStr}" stroke-width=".5" opacity=".4"/>
    <circle cx="24" cy="158" r="8" fill="none" stroke="#f5c842" stroke-width="1.8"/>
    <circle cx="24" cy="158" r="4" fill="none" stroke="#c8a97a" stroke-width="1"/>
    <circle cx="24" cy="158" r="1.8" fill="#f5c842" opacity=".8"/> 
  `;
}

export default function App() {
  const [user, setUser] = useState(USERS[0]);
  const [allData, setAllData] = useState({});
  const [localDay, setLocalDay] = useState(emptyDayData());
  const [selectedDay, setSelectedDay] = useState(todayNum);
  const [activeRoom, setActiveRoom] = useState(null);
  const [openDoorId, setOpenDoorId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState("idle");

  const saveTimer = useRef(null);
  const userKey = USER_RECORD_KEYS[user] || user?.toLowerCase();
  const latestDayRef = useRef(localDay);
  const latestUserKeyRef = useRef(userKey);
  const latestSelectedDayRef = useRef(selectedDay);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!db) return;
    const dbRef = ref(db, "tracker");
    const unsub = onValue(dbRef, snap => {
      setAllData(snap.val() || {});
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const dayData = getUserData(allData, user)?.[selectedDay] || emptyDayData();
    setLocalDay(JSON.parse(JSON.stringify(dayData)));
  }, [user, selectedDay, allData]);

  useEffect(() => {
    function flushPendingSave() {
      if (!saveTimer.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      let savePromise = null;
      if (db && latestUserKeyRef.current && latestSelectedDayRef.current) {
        savePromise = set(
          ref(db, `tracker/${latestUserKeyRef.current}/${latestSelectedDayRef.current}`),
          latestDayRef.current,
        );
      }
      const finalize = () => {
        if (isMountedRef.current) {
          setSaving(false);
        }
      };
      if (savePromise) {
        savePromise.finally(finalize);
      } else {
        finalize();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushPendingSave();
      }
    }

    window.addEventListener("pagehide", flushPendingSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flushPendingSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushPendingSave();
    };
  }, [db]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    latestDayRef.current = localDay;
  }, [localDay]);

  useEffect(() => {
    latestUserKeyRef.current = userKey;
    latestSelectedDayRef.current = selectedDay;
  }, [userKey, selectedDay]);

  function persistDay(nextData) {
    setLocalDay(nextData);
    latestDayRef.current = nextData;
    setAllData(prev => {
      const next = { ...prev };
      const userBucket = { ...(next[userKey] || {}) };
      userBucket[selectedDay] = nextData;
      next[userKey] = userBucket;
      return next;
    });

    if (!db) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await set(ref(db, `tracker/${userKey}/${selectedDay}`), nextData);
      saveTimer.current = null;
      setSaving(false);
    }, 800);
  }

  function saveField(field, value) {
    persistDay({ ...localDay, [field]: value });
  }

  function saveZikr(key, value) {
    persistDay({ ...localDay, zikr: { ...localDay.zikr, [key]: value } });
  }

  function saveCustom(index, key, value) {
    const custom = [...(localDay.customZikr || CUSTOM_ZIKR_DEFAULT)];
    custom[index] = { ...custom[index], [key]: value };
    persistDay({ ...localDay, customZikr: custom });
  }

  function openRoom(id) {
    setOpenDoorId(id);
    setTransitionPhase("exit");
    setTimeout(() => {
      setActiveRoom(id);
      setTransitionPhase("room");
    }, 820);
    setTimeout(() => setTransitionPhase("idle"), 1520);
  }

  function closeRoom() {
    setTransitionPhase("enter");
    setActiveRoom(null);
    setTimeout(() => setOpenDoorId(null), 100);
    setTimeout(() => setTransitionPhase("idle"), 600);
  }

  function calcProgress(u) {
    let filled = 0;
    let total = 0;
    for (let d = 1; d <= todayNum; d++) {
      const day = getUserData(allData, u)?.[d];
      if (!day) {
        total += PRESET_ZIKR.length + 2;
        continue;
      }
      PRESET_ZIKR.forEach(z => { total++; if (day.zikr?.[z.key]) filled++; });
      total++; if (day.quranPages) filled++;
      total++; if (day.namesOfAllah) filled++;
    }
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }

  const dayLabel = `Day ${selectedDay} · ${getDayDate(selectedDay)} · ${user}`;

  const roomClass = id => {
    let cls = "room";
    if (activeRoom === id) cls += " active";
    if (activeRoom === id && transitionPhase === "room") cls += " room-enter";
    return cls;
  };

  const roomStyle = id => ({
    backgroundImage: ROOM_BACKGROUNDS[id],
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  });

  let courtyardClass = "courtyard";
  if (transitionPhase === "exit") courtyardClass += " courtyard-exit";
  if (transitionPhase === "enter") courtyardClass += " courtyard-enter";
  if (activeRoom && transitionPhase !== "enter") courtyardClass += " hidden";

  return (
    <>
      <style>{`\n@import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');\n:root{--sand:#c8a97a;--sand-dark:#8a6a3a;--sand-pale:#e8d5b0;--gold:#f5c842;--gold-dim:#c9a030;--ivory:#fdf6e3;--deep:#1a2a1e;--text-bright:#fff8e8;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\nbody{background:var(--deep);color:var(--text-bright);font-family:'Cormorant Garamond',serif;min-height:100vh;overflow-x:hidden;}\n.geo-bg{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.04;}\n.geo-bg svg{width:100%;height:100%;}\n.z-band{width:100%;height:20px;background:repeating-linear-gradient(90deg,#1a5a8a 0,#1a5a8a 16px,#f5c842 16px,#f5c842 18px,#8b2230 18px,#8b2230 34px,#f5c842 34px,#f5c842 36px,#1e8080 36px,#1e8080 52px,#f5c842 52px,#f5c842 54px,#c8a97a 54px,#c8a97a 70px,#f5c842 70px,#f5c842 72px,#fff8e8 72px,#fff8e8 88px,#f5c842 88px,#f5c842 90px);flex-shrink:0;}\n.courtyard{min-height:100vh;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;padding-bottom:80px;}\n.courtyard.hidden{display:none;}\n.courtyard-exit{animation:courtyardOut .6s ease forwards;}\n.courtyard-enter{animation:courtyardIn .6s ease forwards;}\n@keyframes courtyardOut{from{opacity:1;transform:scale(1);filter:blur(0);}to{opacity:0;transform:scale(1.03);filter:blur(6px);}}\n@keyframes courtyardIn{from{opacity:0;transform:scale(1.02);filter:blur(6px);}to{opacity:1;transform:scale(1);filter:blur(0);}}\n.header-arch-svg{width:min(760px,95%);margin:0 auto -10px;display:block;}\n.arabic-main{font-family:'Scheherazade New',serif;font-size:clamp(44px,8vw,82px);color:#fff8e8;text-align:center;display:block;text-shadow:0 0 20px #f5c842,0 0 60px rgba(245,200,66,.5),0 2px 0 #8a6020;animation:shimmer 4s ease-in-out infinite alternate;line-height:1.15;}\n@keyframes shimmer{0%{text-shadow:0 0 15px #f5c842,0 0 40px rgba(245,200,66,.4),0 2px 0 #8a6020;}100%{text-shadow:0 0 40px #f5c842,0 0 90px rgba(245,200,66,.7),0 0 130px rgba(245,200,66,.25),0 2px 0 #8a6020;}}\n.en-title{font-family:'Cinzel Decorative',serif;font-size:clamp(16px,2.5vw,26px);color:var(--gold);letter-spacing:7px;text-align:center;margin-top:6px;text-shadow:0 0 20px rgba(245,200,66,.6);}\n.sub-date{font-size:17px;color:#a0d0c8;letter-spacing:3px;text-align:center;margin-top:5px;}\n.divider{display:flex;align-items:center;gap:10px;margin:22px auto;width:min(420px,85%);}\n.dline{flex:1;height:1px;background:linear-gradient(90deg,transparent,#f5c842,transparent);}\n.dstar{color:#f5c842;font-size:16px;text-shadow:0 0 10px #f5c842;}\n.user-bar{display:flex;gap:0;margin:0 0 28px;border:1.5px solid var(--sand-dark);overflow:hidden;}\n.user-pill{padding:11px 34px;border:none;cursor:pointer;font-family:'Cinzel Decorative',serif;font-size:14px;letter-spacing:2px;background:rgba(8,13,16,.9);color:#b0c8b8;transition:all .3s;border-right:1px solid var(--sand-dark);}\n.user-pill:last-child{border-right:none;}\n.user-pill.active{background:linear-gradient(135deg,#2a1800,#4a2e08);color:var(--gold);text-shadow:0 0 12px rgba(245,200,66,.6);}\n.progress-row{display:flex;gap:28px;margin-bottom:32px;width:min(580px,88%);}\n.pc{flex:1;}\n.pc-name{font-family:'Scheherazade New',serif;font-size:22px;color:#fff8e8;display:flex;justify-content:space-between;margin-bottom:5px;}\n.pc-name span{font-family:'Cinzel Decorative',serif;font-size:14px;color:var(--gold);}\n.pc-track{height:5px;background:#0e1a14;border:1px solid var(--sand-dark);overflow:hidden;}\n.pc-fill{height:100%;transition:width 1.2s ease;}\n.day-strip{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:720px;width:88%;margin-bottom:44px;}\n.dp{background:transparent;border:1px solid #1a2820;color:#3a6050;padding:4px 8px;font-size:13px;cursor:pointer;transition:all .15s;font-family:'Cormorant Garamond',serif;line-height:1.3;text-align:center;}\n.dp:hover{border-color:var(--gold-dim);color:var(--gold);}\n.dp.today{border-color:var(--sand-dark);color:var(--sand);}\n.dp.selected{background:linear-gradient(135deg,#2a1800,#4a2e08);color:var(--gold);border-color:var(--gold);}\n.dp.future{opacity:.2;cursor:default;}\n.enter-ar{font-family:'Scheherazade New',serif;font-size:32px;color:#fff8e8;text-align:center;margin-bottom:4px;text-shadow:0 0 20px rgba(245,200,66,.4);}\n.enter-en{font-family:'Cinzel Decorative',serif;font-size:13px;color:var(--sand);letter-spacing:5px;text-align:center;margin-bottom:38px;}\n.doors-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:40px 28px;max-width:840px;width:88%;}\n.door-wrap{display:flex;flex-direction:column;align-items:center;cursor:pointer;}\n.door-outer{position:relative;width:164px;height:290px;filter:drop-shadow(0 12px 40px rgba(0,0,0,.9));transition:filter .35s;}\n.door-wrap:hover .door-outer{filter:drop-shadow(0 12px 50px rgba(0,0,0,.9)) drop-shadow(0 0 28px rgba(245,200,66,.3));}\n.door-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}\n.door-panels-3d{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;width:100px;height:175px;display:flex;gap:2px;perspective:700px;z-index:5;}\n.dp3{flex:1;height:100%;position:relative;transition:transform 1.15s cubic-bezier(.25,.46,.45,.94);transform-origin:left center;overflow:hidden;backface-visibility:hidden;}\n.dp3.rp{transform-origin:right center;}\n.dp3-face{width:100%;height:100%;}\n.door-wrap:not(.open):hover .dp3{transform:perspective(700px) rotateY(-14deg);}\n.door-wrap:not(.open):hover .dp3.rp{transform:perspective(700px) rotateY(14deg);}\n.door-wrap.open .dp3{transform:perspective(700px) rotateY(-118deg);}\n.door-wrap.open .dp3.rp{transform:perspective(700px) rotateY(118deg);}\n.door-glow{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;width:100px;height:175px;z-index:3;opacity:0;transition:opacity .7s .3s;}\n.door-wrap.open .door-glow{opacity:1;}\n.door-ar-label{font-family:'Scheherazade New',serif;font-size:24px;color:#fff8e8;text-align:center;margin-top:14px;text-shadow:0 0 20px rgba(245,200,66,.7),0 1px 0 #4a2e00;transition:all .3s;}\n.door-en-label{font-family:'Cinzel Decorative',serif;font-size:12px;color:var(--sand);letter-spacing:2px;text-align:center;margin-top:2px;}\n.door-wrap:hover .door-ar-label{color:var(--gold);text-shadow:0 0 30px #f5c842,0 0 60px rgba(245,200,66,.4);}\n
.room{display:none;min-height:100vh;flex-direction:column;z-index:10;animation:roomIn .85s cubic-bezier(.22,1,.36,1) forwards;}\n.room.active{display:flex;}\n.room-enter{animation:roomPushIn .7s cubic-bezier(.22,1,.36,1) forwards;}\n@keyframes roomIn{from{opacity:0;transform:translateY(28px) scale(.97);}to{opacity:1;transform:none;}}\n@keyframes roomPushIn{from{opacity:0;transform:scale(1.05) translateY(16px);filter:blur(6px);}to{opacity:1;transform:scale(1) translateY(0);filter:blur(0);}}\n.room-topbar{display:flex;align-items:center;padding:18px 28px;border-bottom:1px solid rgba(200,169,122,.2);position:relative;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);}\n.back-btn{background:transparent;border:1.5px solid var(--sand-dark);color:var(--gold);padding:9px 18px;cursor:pointer;font-family:'Cinzel Decorative',serif;font-size:12px;letter-spacing:2px;transition:all .2s;flex-shrink:0;position:relative;z-index:1;}\n.back-btn:hover{background:rgba(200,169,122,.12);border-color:var(--gold);}\n.room-title-block{text-align:center;position:absolute;left:50%;transform:translateX(-50%);pointer-events:none;}\n.rtitle-ar{font-family:'Scheherazade New',serif;font-size:clamp(28px,4.5vw,48px);display:block;color:var(--text-bright);text-shadow:0 0 18px rgba(245,200,66,.35);line-height:1.2;}\n.rtitle-en{font-family:'Cinzel Decorative',serif;font-size:clamp(12px,1.8vw,16px);letter-spacing:4px;display:block;margin-top:3px;color:var(--gold);opacity:1;}\n.rday-lbl{font-size:14px;letter-spacing:2px;display:block;margin-top:3px;color:var(--sand);opacity:1;}\n.room-content{flex:1;padding:40px 28px 80px;max-width:720px;margin:0 auto;width:100%;}\n.fsec{margin-bottom:40px;}\n.fsec-title{font-family:'Scheherazade New',serif;font-size:28px;margin-bottom:16px;display:flex;align-items:center;gap:12px;color:var(--text-bright);}\n.fsec-title::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,currentColor 0%,transparent 100%);opacity:.2;}\n.flabel{font-family:'Cinzel Decorative',serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;display:block;color:var(--sand-pale);opacity:1;}\n.zikr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:14px;}\n.zcard{border:1px solid rgba(255,255,255,.08);padding:16px 12px;position:relative;transition:border-color .2s;background:rgba(0,0,0,.3);}\n.zcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}\n.zcard:focus-within{border-color:var(--sand-dark);}\n.zar{font-family:'Scheherazade New',serif;font-size:20px;display:block;margin-bottom:2px;}\n.zen{font-size:13px;opacity:.75;display:block;margin-bottom:10px;font-style:italic;}\n.zinput{background:rgba(0,0,0,.55);border:1.5px solid rgba(255,255,255,.1);color:var(--text-bright);padding:10px;font-size:24px;font-family:'Cormorant Garamond',serif;text-align:center;width:100%;outline:none;transition:all .2s;}\n.zinput:focus{border-color:var(--gold-dim);box-shadow:0 0 12px rgba(245,200,66,.18);}\n.big-input{background:rgba(0,0,0,.5);border:1.5px solid rgba(255,255,255,.1);color:var(--text-bright);padding:18px;font-size:17px;font-family:'Cormorant Garamond',serif;width:100%;outline:none;transition:all .2s;line-height:1.75;}\n.big-input:focus{border-color:var(--gold-dim);box-shadow:0 0 18px rgba(245,200,66,.14);}\ntextarea.big-input{resize:vertical;min-height:120px;}\n.input-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}\n.czwrap{display:flex;gap:10px;}\n.saving-dot{position:fixed;top:8px;right:14px;font-family:'Cinzel Decorative',serif;font-size:12px;letter-spacing:2px;color:var(--gold);opacity:.75;z-index:100;}\n.float-star{position:fixed;pointer-events:none;opacity:0;animation:starUp linear infinite;z-index:0;}\n@keyframes starUp{0%{opacity:0;transform:translateY(100vh);}8%{opacity:.45;}92%{opacity:.45;}100%{opacity:0;transform:translateY(-30px);}}\n`}</style>

      <div className="geo-bg">
        <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="gp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,4 44,28 68,28 48,44 56,68 40,52 24,68 32,44 12,28 36,28" fill="none" stroke="#c8a97a" strokeWidth=".5"/>
              <circle cx="40" cy="40" r="6" fill="none" stroke="#c8a97a" strokeWidth=".4"/>
            </pattern>
          </defs>
          <rect width="600" height="600" fill="url(#gp)"/>
        </svg>
      </div>

      <div id="courtyard" className={courtyardClass}>
        <div className="z-band"></div>

        <svg className="header-arch-svg" viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="archGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent"/>
              <stop offset="20%" stopColor="#c8a97a"/>
              <stop offset="50%" stopColor="#f5c842"/>
              <stop offset="80%" stopColor="#c8a97a"/>
              <stop offset="100%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <rect x="0" y="155" width="760" height="2" fill="url(#archGold)"/>
          <path d="M 40 160 L 40 100 Q 40 10 380 4 Q 720 10 720 100 L 720 160" fill="none" stroke="#c8a97a" strokeWidth="2"/>
          <path d="M 65 160 L 65 105 Q 65 28 380 22 Q 695 28 695 105 L 695 160" fill="none" stroke="#8a6a3a" strokeWidth="1"/>
          <g fill="none" stroke="#c8a97a" strokeWidth="1.3" opacity=".85">
            <path d="M 40 120 Q 55 108 70 120 Q 85 108 100 120 Q 115 108 130 120 Q 145 108 160 120 Q 175 108 190 120 Q 205 108 220 120 Q 235 108 250 120 Q 265 108 280 120 Q 295 108 310 120 Q 325 108 340 120 Q 355 108 370 120 Q 380 114 390 120 Q 405 108 420 120 Q 435 108 450 120 Q 465 108 480 120 Q 495 108 510 120 Q 525 108 540 120 Q 555 108 570 120 Q 585 108 600 120 Q 615 108 630 120 Q 645 108 660 120 Q 675 108 690 120 Q 705 108 720 120"/>
            <path d="M 45 128 Q 56 120 67 128 Q 78 120 89 128 Q 100 120 111 128 Q 122 120 133 128 Q 144 120 155 128 Q 166 120 177 128 Q 188 120 199 128 Q 210 120 221 128 Q 232 120 243 128 Q 254 120 265 128 Q 276 120 287 128 Q 298 120 309 128 Q 320 120 331 128 Q 342 120 353 128 Q 364 120 374 128 Q 380 123 386 128 Q 397 120 408 128 Q 419 120 430 128 Q 441 120 452 128 Q 463 120 474 128 Q 485 120 496 128 Q 507 120 518 128 Q 529 120 540 128 Q 551 120 562 128 Q 573 120 584 128 Q 595 120 606 128 Q 617 120 628 128 Q 639 120 650 128 Q 661 120 672 128 Q 683 120 694 128 Q 705 120 716 128"/>
          </g>
          <g fill="none" stroke="#f5c842" strokeWidth=".9" opacity=".8">
            <circle cx="180" cy="75" r="14"/><circle cx="180" cy="75" r="9"/>
            <polygon points="180,61 183,71 194,71 186,78 189,89 180,82 171,89 174,78 166,71 177,71" opacity=".7"/>
            <circle cx="380" cy="12" r="16"/><circle cx="380" cy="12" r="10"/>
            <polygon points="380,-4 384,8 396,8 387,16 391,28 380,20 369,28 373,16 364,8 376,8" opacity=".7"/>
            <circle cx="580" cy="75" r="14"/><circle cx="580" cy="75" r="9"/>
            <polygon points="580,61 583,71 594,71 586,78 589,89 580,82 571,89 574,78 566,71 577,71" opacity=".7"/>
          </g>
          <rect x="20" y="90" width="18" height="70" fill="rgba(200,169,122,.15)" stroke="#c8a97a" strokeWidth="1"/>
          <rect x="722" y="90" width="18" height="70" fill="rgba(200,169,122,.15)" stroke="#c8a97a" strokeWidth="1"/>
        </svg>

        <div style={{ padding: "0 20px", textAlign: "center" }}>
          <span className="arabic-main">رَمَضَان مُبَارَك</span>
          <div className="en-title">Ramadan Mubarak · 1447 H</div>
          <div className="sub-date">19 Feb – 20 Mar · 2026</div>
        </div>

        <div className="divider">
          <div className="dline"></div><span className="dstar">✦</span>
          <div className="dline"></div><span className="dstar">✧</span>
          <div className="dline"></div><span className="dstar">✦</span>
          <div className="dline"></div>
        </div>

        <div className="user-bar">
          {USERS.map(u => (
            <button
              key={u}
              className={`user-pill ${u === user ? "active" : ""}`} 
              onClick={() => setUser(u)}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="progress-row">
          {USERS.map(u => {
            const pct = calcProgress(u);
            return (
              <div className="pc" key={u}>
                <div className="pc-name">{u === "Yusra" ? "يُسرى" : "زمينة"} <span>{pct}%</span></div>
                <div className="pc-track">
                  <div
                    className="pc-fill"
                    style={{
                      background: u === "Yusra" ? "linear-gradient(90deg,#8a6020,#f5c842)" : "linear-gradient(90deg,#1a6a4a,#4adea0)",
                      width: `${pct}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="day-strip">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(d => {
            const isFuture = d > todayNum;
            const isToday = d === todayNum;
            const isSelected = d === selectedDay;
            return (
              <button
                key={d}
                className={`dp${isSelected ? " selected" : ""}${isToday ? " today" : ""}${isFuture ? " future" : ""}`} 
                onClick={() => !isFuture && setSelectedDay(d)}
              >
                <div>{getDayDate(d)}</div>
                <div style={{ fontWeight: 600 }}>{d}</div>
              </button>
            );
          })}
        </div>

        <div className="enter-ar">ادخل حجرة</div>
        <div className="enter-en">Enter a Chamber</div>

        <div className="doors-grid">
          {DOORS.map(d => (
            <div
              key={d.id}
              className={`door-wrap ${openDoorId === d.id ? "open" : ""}`} 
              id={`door-${d.id}`}
              onClick={() => openRoom(d.id)}
            >
              <div className="door-outer">
                <svg
                  className="door-svg"
                  viewBox="0 0 164 290"
                  xmlns="http://www.w3.org/2000/svg"
                  dangerouslySetInnerHTML={{ __html: buildDoorSvg(d) }}
                />
                <div className="door-glow" style={{ background: `radial-gradient(ellipse,${d.glow},${d.glowD},transparent)` }} />
                <div className="door-panels-3d">
                  <div className="dp3">
                    <svg className="dp3-face" viewBox="0 0 48 175" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: buildPanelSvg(d) }} />
                  </div>
                  <div className="dp3 rp">
                    <svg className="dp3-face" viewBox="0 0 48 175" xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: buildPanelSvg(d) }} />
                  </div>
                </div>
              </div>
              <span className="door-ar-label">{d.ar}</span>
              <span className="door-en-label">{d.en}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="room-zikr" className={roomClass("zikr")} style={roomStyle("zikr")}>
        <div className="z-band" />
        <div className="room-topbar">
          <button className="back-btn" onClick={closeRoom}>← Back</button>
          <div className="room-title-block">
            <span className="rtitle-ar">الذِّكر</span>
            <span className="rtitle-en">Zikr</span>
            <span className="rday-lbl">{dayLabel}</span>
          </div>
        </div>
        {saving && <div className="saving-dot">Saving…</div>}
        <div className="room-content">
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#3a9ad0" }}>الأذكار اليومية</div>
            <div className="zikr-grid">
              {PRESET_ZIKR.map(z => (
                <div className="zcard" key={z.key} style={{ borderTopColor: "#3a9ad0" }}>
                  <span className="zar">{z.ar}</span>
                  <span className="zen">{z.en}</span>
                  <input
                    className="zinput"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={localDay.zikr?.[z.key] || ""}
                    onChange={e => saveZikr(z.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#3a9ad0" }}>أذكار مخصصة</div>
            {(localDay.customZikr || CUSTOM_ZIKR_DEFAULT).map((cz, i) => (
              <div className="czwrap" key={i} style={{ marginBottom: 12 }}>
                <input
                  className="big-input"
                  type="text"
                  placeholder="Dhikr name…"
                  value={cz.name}
                  onChange={e => saveCustom(i, "name", e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  className="big-input"
                  type="number"
                  min="0"
                  placeholder="Count"
                  value={cz.count}
                  onChange={e => saveCustom(i, "count", e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <label className="flabel">Additional Zikr</label>
              <textarea
                className="big-input"
                rows={4}
                placeholder="Any additional dhikr or free-form notes…"
                value={localDay.additionalZikr || ""}
                onChange={e => saveField("additionalZikr", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="room-quran" className={roomClass("quran")} style={roomStyle("quran")}>
        <div className="z-band" />
        <div className="room-topbar">
          <button className="back-btn" onClick={closeRoom}>← Back</button>
          <div className="room-title-block">
            <span className="rtitle-ar">القُرآن</span>
            <span className="rtitle-en">Quran</span>
            <span className="rday-lbl">{dayLabel}</span>
          </div>
        </div>
        {saving && <div className="saving-dot">Saving…</div>}
        <div className="room-content">
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#2aaa60" }}>القراءة اليومية</div>
            <div className="input-row">
              <div>
                <label className="flabel">Pages Read</label>
                <input
                  className="big-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={localDay.quranPages || ""}
                  onChange={e => saveField("quranPages", e.target.value)}
                />
              </div>
              <div>
                <label className="flabel">Juz Completed</label>
                <input
                  className="big-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={localDay.quranJuz || ""}
                  onChange={e => saveField("quranJuz", e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="flabel">Surah Recited</label>
              <textarea
                className="big-input"
                rows={4}
                placeholder="Which surah(s) did you recite today?"
                value={localDay.quranSurahRecited || ""}
                onChange={e => saveField("quranSurahRecited", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="room-surahs" className={roomClass("surahs")} style={roomStyle("surahs")}>
        <div className="z-band" />
        <div className="room-topbar">
          <button className="back-btn" onClick={closeRoom}>← Back</button>
          <div className="room-title-block">
            <span className="rtitle-ar">السُّوَر</span>
            <span className="rtitle-en">Surahs Recited</span>
            <span className="rday-lbl">{dayLabel}</span>
          </div>
        </div>
        {saving && <div className="saving-dot">Saving…</div>}
        <div className="room-content">
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#c05060" }}>السور المقروءة</div>
            <label className="flabel">Surahs Recited Today</label>
            <textarea
              className="big-input"
              rows={6}
              placeholder="List the surahs you recited today…"
              value={localDay.surahsRecited || ""}
              onChange={e => saveField("surahsRecited", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div id="room-memorize" className={roomClass("memorize")} style={roomStyle("memorize")}>
        <div className="z-band" />
        <div className="room-topbar">
          <button className="back-btn" onClick={closeRoom}>← Back</button>
          <div className="room-title-block">
            <span className="rtitle-ar">الحِفظ</span>
            <span className="rtitle-en">Memorization</span>
            <span className="rday-lbl">{dayLabel}</span>
          </div>
        </div>
        {saving && <div className="saving-dot">Saving…</div>}
        <div className="room-content">
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#8060d0" }}>الحِفظ والمراجعة</div>
            <label className="flabel">Surah Being Memorized</label>
            <textarea
              className="big-input"
              rows={6}
              placeholder="Note the surah or ayahs you are memorizing…"
              value={localDay.surahsMemorizing || ""}
              onChange={e => saveField("surahsMemorizing", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div id="room-names" className={roomClass("names")} style={roomStyle("names")}>
        <div className="z-band" />
        <div className="room-topbar">
          <button className="back-btn" onClick={closeRoom}>← Back</button>
          <div className="room-title-block">
            <span className="rtitle-ar">أسماء الله</span>
            <span className="rtitle-en">Names of Allah</span>
            <span className="rday-lbl">{dayLabel}</span>
          </div>
        </div>
        {saving && <div className="saving-dot">Saving…</div>}
        <div className="room-content">
          <div className="fsec">
            <div className="fsec-title" style={{ color: "#20c0c0" }}>أسماء الله الحُسنى</div>
            <label className="flabel">Names Learned Today</label>
            <textarea
              className="big-input"
              rows={6}
              placeholder="Write the names of Allah you reflected on today…"
              value={localDay.namesOfAllah || ""}
              onChange={e => saveField("namesOfAllah", e.target.value)}
            />
          </div>
        </div>
      </div>
      {FLOATING_STARS.map((s, i) => (
        <div
          key={i}
          className="float-star"
          style={{
            left: s.left,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            fontSize: `${s.size}px`,
            color: "#f5c842",
          }}
        >
          {s.symbol}
        </div>
      ))}
    </>
  );
}
