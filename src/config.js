// src/config.js

export const dDate = new Date();
export const currentYear = dDate.getFullYear();
export const currentMonth = dDate.getMonth();
export const maxPromo = (currentYear % 100) + 200 + (currentMonth >= 8 ? 0 : -1); 
export const PROMS = Array.from({length: maxPromo - 165}, (_, i) => String(maxPromo - i));

export const isFamsExempt = (promoStr) => {
  if (promoStr !== String(maxPromo)) return false;
  const limitDate = new Date(2000 + (maxPromo - 200), 10, 8); 
  return dDate < limitDate;
};

export const SPORTS = [
  {id:"general",  l:"Général",     r:"Toutes les équipes", fh:"Mixte", ff:"Mixte"},
  {id:"ultra",    l:"Ultra",       r:"Supporter",     fh:"Mixte",    ff:"Mixte"},
  {id:"zamain",   l:"Zamain",      r:"Handball",      fh:"Équipe H", ff:"Zamain Fum's"},
  {id:"volls",    l:"Voll’s",      r:"Volley-ball",   fh:"Équipe H", ff:"Voll’s Fum's"},
  {id:"rubs",     l:"Rub’s",       r:"Rugby",         fh:"Équipe H", ff:"Rub’s Fum's"},
  {id:"pitate",   l:"Pitate",      r:"Football",      fh:"Équipe H", ff:"Pitate Fum's"},
  {id:"muscu",    l:"Musculation", r:"Musculation",   fh:"Mixte",    ff:"Mixte"},
  {id:"athlets",  l:"Athlét’s",    r:"Athlétisme",    fh:"Mixte",    ff:"Mixte"},
  {id:"basket",   l:"Basket",      r:"Basket",        fh:"Équipe H", ff:"Basket Fum's"},
  {id:"rocks",    l:"Rock's",      r:"Rock",          fh:"Mixte",    ff:"Mixte"},
  {id:"pom2",     l:"(Pom)\u00b2", r:"Pom pom girl",  fh:"Mixte",    ff:"(Pom)\u00b2 Fum's"},
  {id:"ems",      l:"Em’s",        r:"Em’s",          fh:"Mixte",    ff:"Mixte"},
  {id:"gamers",   l:"Gamer’s",     r:"Jeux vidéo",    fh:"Mixte",    ff:"Mixte"},
  {id:"escalads", l:"Escalad’s",   r:"Escalade",      fh:"Mixte",    ff:"Mixte"},
  {id:"patate",   l:"Patate",      r:"Boxe",          fh:"Mixte",    ff:"Mixte"},
  {id:"judal",    l:"Judal",       r:"Judo",          fh:"Mixte",    ff:"Mixte"},
  {id:"surfs",    l:"Surf’s",      r:"Surf",          fh:"Mixte",    ff:"Mixte"},
  {id:"voilzart", l:"Voilz’Art",   r:"La Voile",      fh:"Mixte",    ff:"Mixte"},
  {id:"skats",    l:"Skat’s",      r:"Skate",         fh:"Mixte",    ff:"Mixte"},
  {id:"tennis",   l:"Tenni's",     r:"Tennis",        fh:"Équipe H", ff:"Tenni's Fum's"},
  {id:"bads",     l:"Bad’s",       r:"Badminton",     fh:"Équipe H", ff:"Bad’s Fum's"},
  {id:"pingpong", l:"PingPong",    r:"Ping-Pong",     fh:"Mixte",    ff:"Mixte"},
  {id:"plouf",    l:"Ploüf",       r:"Natation",      fh:"Mixte",    ff:"Mixte"},
  {id:"streets_workout", l:"Street’s Workout", r:"Street Workout", fh:"Mixte", ff:"Mixte"},
  {id:"zavelo",   l:"ZaVélo",      r:"Vélo",          fh:"Mixte",    ff:"Mixte"},
  {id:"zaglace",  l:"ZaGlace",     r:"Patin à glace", fh:"Mixte",    ff:"Mixte"},
  {id:"orients",  l:"Orient’s",    r:"Course orient.",fh:"Mixte",    ff:"Mixte"},
  {id:"tuverras", l:"Tu verras",   r:"Surprise",      fh:"Mixte",    ff:"Mixte"},
];
SPORTS.forEach(s => { if (!s.dt && s.id !== "general") s.dt = ["Général","Équipe 1","Équipe 2"]; });
export const Sp = Object.fromEntries(SPORTS.map(s => [s.id, s]));

export const TC = {training:"#3B82F6", match:"#DC2626", tournament:"#F59E0B", event:"#8B5CF6"};
export const TL = {training:"Entraînement", match:"Match", tournament:"Tournoi", event:"Événement"};
export const MTYPES = ["Championnat","Coupe","Finale","Amical","Tournoi"];

export const ROLES = [
  {id:"zident", label:"ZiUAI", full:"Président"}, {id:"vizident", label:"ViZiUAI", full:"Vice-Président"},
  {id:"re", label:"RE UAI", full:"Relations Extérieures"}, {id:"com", label:"COM UAI", full:"Communication"},
  {id:"log", label:"LOG UAI", full:"Logistique"}, {id:"muscu", label:"ZiMuscu", full:"Musculation"},
  {id:"ziblec", label:"Zibl'&'C", full:"Responsable Blessures & Soins"}
];
// 🛡️ FIX : Zibl'&'C retiré du Bureau, il passera automatiquement dans "Autres Rôles" en rouge !
export const BURS_ROLE_IDS = ["zident", "vizident", "re", "com", "log", "muscu"];
export const DEV_EMAIL = "robin.predon@gmail.com";

export const FAMS_OPTIONS = Array.from({length:201}, (_,i) => {
  if(i===69) return "68 bis";
  if(i===169) return "168 bis";
  return String(i);
});

export const parseFams = (famsData) => {
  if (Array.isArray(famsData)) return famsData;
  if (typeof famsData === "string" && famsData.trim() !== "") return [famsData.trim()];
  return [];
};

export const U0 = [
  {id:1,email:"capitaine@ensam.eu",password:"gensam",nom:"Dubois",prenom:"Thomas",bucque:"Toto",fams:["12"],proms:"224",sexe:"Homme",sports:["pitate","volls"],bannedSports:[],adminSports:["pitate"],role:"user",phone:"06 12 34 56 78",bio:"ZiPitate UAI",avatar:null,licenceNum:"2024-ENSAM-001",licence:true,licenceFile:null,mutedChats:[]},
  {id:2,email:"eleve@ensam.eu",password:"ensam",nom:"Laurent",prenom:"Marie",bucque:"Laulu",fams:["68 bis", "113"],proms:"225",sexe:"Femme",sports:["basket","ultra"],bannedSports:[],adminSports:[],role:"user",phone:"06 98 76 54 32",bio:"",avatar:null,licenceNum:"",licence:false,licenceFile:null,mutedChats:[]},
  {id:3,email:DEV_EMAIL,password:"uai2024",nom:"Predon",prenom:"Robin",bucque:"Ki'Shot",fams:["91"],proms:"225",sexe:"Homme",sports:["zamain","escalads","volls","basket"],bannedSports:[],adminSports:["zamain"],role:"developer",phone:"07 82 30 26 03",bio:"Développeur UAI & Zibl'&'C",avatar:null,licenceNum:"",licence:true,licenceFile:null,mutedChats:[]},
];

export const fmtD = (offset) => { const d = new Date(dDate); d.setDate(d.getDate() + offset); return d.toISOString().slice(0,10); };

export const EV0 = [
  {id:1,sportId:"zamain",date:fmtD(0),time:"18:00",dur:120,location:"Halle des Sports",type:"training", title:"Entraînement Zamain"},
  {id:2,sportId:"volls",date:fmtD(0),time:"18:30",dur:90,location:"Gymnase A ENSAM",type:"match", title:"Match vs STAPS"},
  {id:3,sportId:"escalads",date:fmtD(0),time:"19:00",dur:120,location:"Mur Roc Altitude",type:"event", title:"Sortie Voie"},
  {id:4,sportId:"basket",date:fmtD(1),time:"18:00",dur:90,location:"Foyer",type:"training", title:"Training Basket"},
];

export const NW0 = [{id:1,sportId:"general",title:"Victoire du WE",content:"Toutes nos équipes ont performé ce weekend ! Quelle fierté.",date:fmtD(-1),authorId:3,authorName:"Ki'Shot",likes:42,likedBy:[],comments:[],photos:[]}];
export const MA0 = [
  {id:1,sportId:"rubs",opponent:"Université Bordeaux",date:fmtD(-5),time:"16:00",location:"Stade Moga",type:"Championnat",home:false,likes:4,likedBy:[],comments:[],scoreBordels:12,scoreOpponent:24},
  {id:4,sportId:"volls",opponent:"STAPS",date:fmtD(-3),time:"14:00",location:"Gymnase B",type:"Coupe",home:true,likes:10,likedBy:[],comments:[],scoreBordels:3,scoreOpponent:1},
  {id:2,sportId:"basket",opponent:"ENSEIRB",date:fmtD(0),time:"14:00",location:"Gymnase A",type:"Finale",home:true,likes:15,likedBy:[],comments:[],scoreBordels:78,scoreOpponent:65},
];

export const GR0 = SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras").map(s => ({sportId: s.id, members: U0.filter(u => (u.sports||[]).includes(s.id) || (u.adminSports||[]).includes(s.id)).map(u => u.id), requests: [], subcoms: [...s.dt], adminId: U0.find(u => (u.adminSports||[]).includes(s.id))?.id || null}));
export const BUR0 = [{id:1,role:"zident",userId:1},{id:2,role:"ziblec",userId:3}];

export const LOCS0 = ["Foyer", "Gymnase A ENSAM", "Gymnase B Campus Talence", "Stade municipal Talence", "Terrain Rugby ENSAM"];
export const MUSCU0 = [{id:1, cat:"Machines", name:"Presse à cuisses", desc:"Quadriceps."}, {id:2, cat:"Poids libres", name:"Dév. Couché", desc:"Pectoraux."}];
export const INV0 = [{id:1, sportId:"pitate", name:"Ballons T5", qty:10, desc:"Bon état"}];
export const FB0 = [{id:1, userId:2, userName:"Laulu", text:"Super appli, merci les devs !", date:new Date().toISOString(), isRead:false}];

export const SANTE_DATA = {
  echauffement: { title: "🔥 S'échauffer", content: "1. Cardio (5-10 min) : Footing léger.\n2. Mobilité articulaire : Cercles de bras, chevilles.\n3. Gammes athlétiques : Montées de genoux, talons-fesses.\n4. Spécifique : Passes, tirs selon votre sport." },
  etirements: { title: "🧘 S'étirer", content: "Avant l'effort : Étirements dynamiques.\nAprès l'effort : Étirements statiques (30 secondes par position). Respirez." },
  pratiques: { title: "✅ Bonnes pratiques", content: "Hydratation : 500ml 2h avant l'effort, petites gorgées pendant.\nSommeil : 8h minimum.\nAlimentation : Glucides lents 3h avant un match." },
  blessures: { title: "🚑 Blessures & Soins", content: "Crampes : Étirez doucement, buvez de l'eau.\nEntorse : Protocole GREC (Glace, Repos, Élévation, Compression). Bombe de froid 15 min max." }
};

export const fmtDate = s => { try { return new Date(s+"T00:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}); } catch(e) { return s||""; } };
export const dL = s => { if(!s) return 0; return Math.ceil((new Date(s+"T00:00:00").getTime() - new Date().setHours(0,0,0,0)) / 86400000); };
export const ini = n => ((n||"?").split(" ").map(x => x[0]||"").join("")).slice(0,2).toUpperCase();
export const dn = u => u?.bucque || `${u?.prenom||""} ${u?.nom||""}`.trim();

export const isDev = u => u?.role === "developer";
export const isBurs = (u, bureau) => isDev(u) || bureau?.some(b => b.userId === u?.id && BURS_ROLE_IDS.includes(b.role));
export const isCap = (u, sid) => (u?.adminSports||[]).includes(sid);
export const canEdit = (u, sid, bureau=[]) => {
  if (isDev(u) || isBurs(u, bureau)) return true;
  if (sid === "__any__") return (u?.adminSports?.length || 0) > 0;
  return isCap(u, sid);
};

export const getTeamName = (sid, sexe) => { const s=Sp[sid]; if(!s) return ""; return sexe==="Femme"?s.ff:s.fh; };
export const ziLabel = (sid) => { const s=Sp[sid]; if(!s) return "Capitaine"; return `Zi${s.l||sid}`.trim(); };
export const readFile = (file, cb) => { const r = new FileReader(); r.onload = e => cb(e.target.result); r.readAsDataURL(file); };
export const getWeekStart = (offset = 0) => { const t = new Date(dDate); t.setDate(t.getDate() + offset * 7); const d = t.getDay(); const m = new Date(t); m.setDate(t.getDate() + (d===0?-6:1-d)); m.setHours(0,0,0,0); return m; };
export const endTimeStr = (t, dur) => {
  if(!t) return "00:00";
  const [h, m] = t.split(':').map(Number);
  const totalM = h*60 + m + Number(dur||90);
  return `${String(Math.floor(totalM/60)).padStart(2,'0')}:${String(totalM%60).padStart(2,'0')}`;
};

export const handleLike = (id, setList, user) => setList(p => p.map(item => {
  if (item.id !== id) return item;
  const ok = (item.likedBy || []).includes(user.id);
  const likes = item.likes || 0, likedBy = item.likedBy || [];
  return {...item, likes: ok?likes-1:likes+1, likedBy: ok?likedBy.filter(x=>x!==user.id):[...likedBy,user.id]};
}));
export const handleComment = (id, txt, setList, user) => {
  if (!txt.trim()) return;
  const c = {id:Date.now(), userId:user.id, userName:dn(user), text:txt.trim(), time:new Date().toISOString(), reactions:{}};
  setList(p => p.map(item => item.id === id ? {...item, comments: [...(item.comments||[]), c]} : item));
};

export const S = {
  bg: "#080808", card: "#161616", cardBorder: "#1f1f1f",
  red: "#DC2626", redFaint: "#DC262215", redBorder: "#DC262244",
  blue: "#2563EB", darkGreen: "#15803d",
  inp: {width:"100%",padding:"11px 14px",background:"#111",border:"1px solid #252525",borderRadius:10,color:"white",fontSize:14,boxSizing:"border-box",fontFamily:"inherit",outline:"none", minHeight:44},
};
export const btnStyle = (bg="#DC2626",c="white") => ({width:"100%",padding:"12px 0",background:bg,color:c,border:"none",borderRadius:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,letterSpacing:1.5,textTransform:"uppercase"});