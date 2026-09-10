import { useState, useEffect } from "react";
import { supabase } from "./supabase"; // 🔌 Notre pont Supabase
import { 
  dDate, maxPromo, PROMS, isFamsExempt, SPORTS, Sp, DEV_EMAIL,
  NW0, GR0, BUR0, LOCS0, MUSCU0, INV0, FB0,
  dn, isDev, isCap, S, btnStyle 
} from "./config";
import { Lbl, FamsSelect, Av, UserProfileModal } from "./components/Shared";

import PlanningTab from "./tabs/PlanningTab";
import MatchesTab from "./tabs/MatchesTab";
import NewsTab from "./tabs/NewsTab";
import InfoTab from "./tabs/InfoTab";
import GroupesTab from "./tabs/GroupesTab";
import AdminTab from "./tabs/AdminTab";
import AccountTab from "./tabs/AccountTab";

function AuthScreen({users, setUsers, onLogin}) {
  const [mode, setMode] = useState("login");
  const [showP, setShowP] = useState(false);
  const [f, setF] = useState({email:"",password:"",nom:"",prenom:"",bucque:"",fams:[],proms:String(maxPromo),sexe:"Homme",sports:[],phone:"", rgpd:false});
  const [err, setErr] = useState("");
  const [remember, setRemember] = useState(true);
  const [resetContact, setResetContact] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const up = (k,v) => setF(p => ({...p,[k]:v}));
  const tog = id => setF(p => ({...p, sports: p.sports.includes(id) ? p.sports.filter(x=>x!==id) : [...p.sports,id]}));
  
  const sportsSorted = [...SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras")];

  const login = () => {
    const u = users.find(u => u.email===f.email && u.password===f.password);
    if(u) { onLogin(u); if(remember) localStorage.setItem("uai_user", u.id); } 
    else setErr("Email ou mot de passe incorrect");
  };

  const register = async () => {
    if (!f.nom||!f.prenom||!f.email||!f.password||!f.sexe||!f.bucque||!f.phone||!f.proms) return setErr("Remplissez tous les champs obligatoires *");
    if (!isFamsExempt(f.proms) && f.fams.length===0) return setErr(`La Fam's est obligatoire (sauf pour la Bo ${maxPromo} jusqu'au 7 Nov)`);
    if (!f.rgpd) return setErr("Vous devez accepter les conditions d'utilisation des données.");

    const role = f.email.toLowerCase()===DEV_EMAIL ? "developer" : "user";
    
    const nu = {
      id: Date.now(),
      email: f.email,
      password: f.password,
      nom: f.nom,
      prenom: f.prenom,
      bucque: f.bucque,
      fams: f.fams,
      proms: f.proms,
      sexe: f.sexe,
      sports: f.sports,
      bannedsports: [],
      adminsports: [],
      role: role,
      phone: f.phone,
      bio: "",
      licence: false,
      mutedchats: []
    };

    try {
      const { error } = await supabase.from('users').insert([nu]);
      
      if (error) {
        if (error.code === '23505') return setErr("Cet email est déjà utilisé.");
        throw error;
      }

      const localNu = {...nu, bannedSports:[], adminSports:[], mutedChats:[]};
      setUsers(p => [...p, localNu]); 
      onLogin(localNu);
      
    } catch (err) {
      console.error(err);
      setErr("Erreur de connexion au serveur.");
    }
  };

  const sendReset = () => { if(!resetContact) return setErr("Entrez une information valide"); setResetSent(true); setErr(""); }
  const handleKeyDown = (e) => { if (e.key === "Enter") { if (mode === "login") login(); else if (mode === "register") register(); else if (mode==="forgot") sendReset(); } }

  return (
    <div style={{minHeight:"100dvh",background:S.bg,display:"flex",flexDirection:"column",fontFamily:"'Barlow',sans-serif",overflow:"hidden"}}>
      <div className="fade-in no-scrollbar" style={{flex:1, display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8vh 20px 40px", overflowY:"auto"}}>
        <div style={{marginBottom:30,textAlign:"center"}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:80,fontWeight:900,color:S.red,lineHeight:1,letterSpacing:-3, textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 2px 0 #000, 2px 0px 0 #000"}}>UAI</div>
          <div style={{width:52,height:3,background:S.red,margin:"6px auto 10px",borderRadius:2}} />
          <div style={{fontSize:11,color:"#555",letterSpacing:1.5,textTransform:"uppercase", padding:"0 10px"}}>Union Athlétique Intergadzarique</div>
          <div style={{fontSize:10,color:"#2a2a2a",letterSpacing:3,textTransform:"uppercase",marginTop:1}}>Bordel's</div>
        </div>

        {mode==="forgot" ? (
          <div style={{width:"100%",maxWidth:380}}>
            <button onClick={()=>{setMode("login");setResetSent(false);setErr("");}} style={{background:"none",border:"none",color:S.red,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700,marginBottom:20,padding:0}}>← Retour</button>
            {!resetSent ? (
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:900,color:"white",marginBottom:4}}>Mot de passe oublié</div>
                <div><Lbl t="Email ou Numéro de téléphone"/><input style={S.inp} placeholder="06 XX XX XX XX ou email" value={resetContact} onChange={e=>{setResetContact(e.target.value);setErr("");}} onKeyDown={handleKeyDown} /></div>
                {err && <div style={{color:"#EF4444",fontSize:13,textAlign:"center",padding:"6px 12px",background:"#EF444411",borderRadius:8}}>{err}</div>}
                <button onClick={sendReset} style={{...btnStyle(),marginTop:4}}>Réinitialiser</button>
              </div>
            ) : (
              <div className="fade-in" style={{textAlign:"center",padding:"24px 0"}}>
                <div style={{fontSize:44,marginBottom:16}}>📩</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:900,color:"white",marginBottom:12}}>Demande envoyée !</div>
                <div style={{fontSize:13,color:"#666",lineHeight:1.75,marginBottom:24}}>Si le contact <span style={{color:S.red}}>{resetContact}</span> existe, un lien vous sera envoyé.</div>
                <button onClick={()=>{setMode("login");setResetSent(false);setResetContact("");}} style={btnStyle()}>Retour à la connexion</button>
              </div>
            )}
          </div>
        ) : (
          <div className="fade-in" style={{width:"100%",maxWidth:380,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",background:"#111",borderRadius:12,padding:4}}>
              {[["login","Connexion"],["register","Inscription"]].map(([m,l]) => (
                <button key={m} onClick={() => {setMode(m);setErr("");}} style={{flex:1,padding:"10px 0",background:mode===m?S.red:"transparent",color:mode===m?"white":"#555",border:"none",borderRadius:9,cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1.5}}>{l}</button>
              ))}
            </div>

            {mode==="register" && (
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><Lbl t="Nom *"/><input style={S.inp} placeholder="Predon" value={f.nom} onChange={e=>up("nom",e.target.value)} onKeyDown={handleKeyDown}/></div><div><Lbl t="Prénom *"/><input style={S.inp} placeholder="Robin" value={f.prenom} onChange={e=>up("prenom",e.target.value)} onKeyDown={handleKeyDown}/></div></div>
                <div><Lbl t="Bucque *"/><input style={S.inp} placeholder="Ki'Shot" value={f.bucque} onChange={e=>up("bucque",e.target.value)} onKeyDown={handleKeyDown}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                   <div><Lbl t="Sexe *"/><select style={S.inp} value={f.sexe} onChange={e=>up("sexe",e.target.value)}><option value="Homme">Homme</option><option value="Femme">Femme</option></select></div>
                   <div><Lbl t="Prom's *"/><select style={S.inp} value={f.proms} onChange={e=>up("proms",e.target.value)}><option value="">Bo...</option>{PROMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
                <div style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                   <div style={{flex:1}}><Lbl t={`Fam's${isFamsExempt(f.proms)?" (Optionnel)":" *"}`}/><FamsSelect value={f.fams} onChange={v=>up("fams",v)} /></div>
                   <div style={{flex:1}}><Lbl t="Téléphone *"/><input style={S.inp} placeholder="07 82 30 26 03" value={f.phone} onChange={e=>up("phone",e.target.value)} onKeyDown={handleKeyDown}/></div>
                </div>
                <div>
                  <Lbl t={`Sports (${f.sports.length})`}/>
                  <div style={{background:"#0e0e0e",borderRadius:12,border:"1px solid #1e1e1e",padding:10,maxHeight:180,overflowY:"auto"}} className="no-scrollbar">
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {sportsSorted.map(s => { const on = f.sports.includes(s.id); return <button key={s.id} onClick={(e) => {e.preventDefault(); tog(s.id);}} style={{padding:"8px 9px",borderRadius:9,border:"1px solid",cursor:"pointer",fontFamily:"inherit",textAlign:"left",background:on?S.redFaint:"transparent",borderColor:on?S.red:"#222",color:on?S.red:"#555"}}><div style={{fontSize:12,fontWeight:700}}>{s.l}</div></button>; })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="fade-in"><Lbl t="Email *"/><input style={S.inp} type="email" placeholder="mail perso" value={f.email} onChange={e=>up("email",e.target.value)} onKeyDown={handleKeyDown}/></div>
            <div className="fade-in">
              <Lbl t="Mot de passe *"/>
              <div style={{position:"relative", display:"flex", alignItems:"center"}}>
                <input style={{...S.inp, paddingRight:40}} type={showP?"text":"password"} placeholder="..." value={f.password} onChange={e=>up("password",e.target.value)} onKeyDown={handleKeyDown}/>
                <button onClick={()=>setShowP(!showP)} style={{position:"absolute", right:5, background:"transparent", border:"none", color:"#666", cursor:"pointer", fontSize:18}}>👁️</button>
              </div>
            </div>
            
            {mode==="register" && (
              <label className="fade-in" style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:11,color:"#aaa",cursor:"pointer", marginTop:4}}>
                 <input type="checkbox" checked={f.rgpd} onChange={e=>up("rgpd",e.target.checked)} style={{accentColor:S.red, marginTop:2}}/>
                 <span>J'accepte que mes données soient utilisées par l'UAI Bordel's dans le cadre de l'application. *</span>
              </label>
            )}

            {mode==="login" && (
              <div className="fade-in" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#888",cursor:"pointer"}}>
                   <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{accentColor:S.red}}/> Se souvenir
                </label>
                <button onClick={()=>{setMode("forgot");setErr("");}} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:12,fontFamily:"inherit",textDecoration:"underline"}}>Mot de passe oublié ?</button>
              </div>
            )}

            {err && <div className="fade-in" style={{color:"#EF4444",fontSize:13,textAlign:"center",padding:"6px 12px",background:"#EF444411",borderRadius:8}}>{err}</div>}
            <button className="fade-in" onClick={mode==="login"?login:register} style={{...btnStyle(),marginTop:2}}>{mode==="login"?"Se connecter":"Créer mon compte"}</button>
          </div>
        )}
      </div>
      
      <div style={{padding:"20px 0", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center", lineHeight: 1.6, borderTop:"1px solid #1a1a1a", background:"#080808", marginTop:"auto"}}>
        Since Bo 225<br/><span style={{color:"#444", fontSize: 10}}>Usiné par Ki'Shot 91</span>
      </div>
    </div>
  );
}

function Header({user, onAvatarClick, notifs}) {
  const [showNotif, setShowNotif] = useState(false);
  return (
    <div style={{padding:"11px 18px",background:"#0c0c0c",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <img src="/logo.png" alt="Logo" style={{width: 48, height: 48, objectFit:"cover", borderRadius:"50%"}} onError={(e)=>{e.target.style.display='none'}} />
        <div>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,color:S.red,letterSpacing:-1, textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 2px 0 #000, 2px 0px 0 #000"}}>UAI</span>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:18,fontWeight:900,color:S.red,letterSpacing:1,marginLeft:6,textTransform:"uppercase",verticalAlign:"1px", textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 2px 0 #000, 2px 0px 0 #000"}}>Bordel's</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"relative"}}>
           <button onClick={()=>setShowNotif(!showNotif)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",padding:0}}>🔔</button>
           {notifs.length>0 && <div style={{position:"absolute",top:-2,right:-2,width:10,height:10,background:S.red,borderRadius:"50%",border:"2px solid #0c0c0c"}}></div>}
           {showNotif && (
             <div className="fade-in" style={{position:"absolute",top:30,right:0,width:260,background:S.card,border:`1px solid ${S.cardBorder}`,borderRadius:12,padding:12,boxShadow:"0 10px 20px rgba(0,0,0,0.8)",maxHeight:300,overflowY:"auto"}}>
               <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:"white"}}>NOTIFICATIONS</div>
               {notifs.length===0?<div style={{fontSize:11,color:"#666"}}>Aucune notification</div>:notifs.map((n,i)=><div key={i} style={{fontSize:12,padding:"8px",borderBottom:"1px solid #1a1a1a",color:"#ccc"}}>{n.msg}</div>)}
             </div>
           )}
        </div>
        <Av src={user.avatar} name={dn(user)} size={36} onClick={() => onAvatarClick(user.id)} />
      </div>
    </div>
  );
}

function BottomNav({active, onChange, user}) {
  let tabs = [{id:"planning",l:"Planning",ic:"📅"},{id:"matches",l:"Matchs",ic:"🏆"},{id:"news",l:"Actus",ic:"📰"},{id:"info",l:"Infos",ic:"ℹ️"},{id:"groupes",l:"Groupes",ic:"🛡️"},{id:"account",l:"Compte",ic:"👤"}];
  if(isDev(user)) tabs.push({id:"admin",l:"Admin",ic:"⚙️"});

  return (
    <div className="no-scrollbar" style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #1a1a1a",display:"flex",zIndex:100,height:62,overflowX:"auto"}}>
      <div style={{display:"flex", width:"100%", minWidth: tabs.length * 60}}>
        {tabs.map(t => {
          const on = active===t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,color:on?S.red:"#3a3a3a",position:"relative",paddingTop:5}}>
              {on && <div style={{position:"absolute",top:0,left:"22%",right:"22%",height:2,background:S.red,borderRadius:"0 0 3px 3px"}} />}
              <span style={{fontSize:18}}>{t.ic}</span>
              <span style={{fontSize:9,fontWeight:on?800:500,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.l}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function UAIApp() {
  const [users, setUsers] = useState([]); 
  const [events, setEvents] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  useEffect(() => {
    async function fetchDatabase() {
      try {
        const { data: dbUsers } = await supabase.from('users').select('*');
        const { data: dbEvents } = await supabase.from('events').select('*');
        const { data: dbMatches } = await supabase.from('matches').select('*');

        if (dbUsers) {
          const formattedUsers = dbUsers.map(u => ({
            ...u,
            bannedSports: u.bannedsports || [],
            adminSports: u.adminsports || [],
            licenceNum: u.licencenum || "",
            licenceFile: u.licencefile || null,
            mutedChats: u.mutedchats || []
          }));
          setUsers(formattedUsers);

          const savedId = localStorage.getItem("uai_user");
          if (savedId) {
            const found = formattedUsers.find(user => String(user.id) === savedId);
            if (found) setCur(found);
          }
        }

        if (dbEvents) {
          setEvents(dbEvents.map(e => ({ ...e, sportId: e.sportid })));
        }

        if (dbMatches) {
          setMatches(dbMatches.map(m => ({
            ...m, sportId: m.sportid, planningId: m.planningid,
            scoreBordels: m.scorebordels, scoreOpponent: m.scoreopponent,
            likedBy: m.likedby || []
          })));
        }
      } catch (error) {
        console.error("Erreur Supabase:", error);
      } finally {
        setIsDbLoading(false);
      }
    }
    
    fetchDatabase();
    
    document.title = "UAI Bordel's";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = '/logo.png';
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
    const style = document.createElement("style");
    style.innerHTML = `
      body, html { margin: 0; padding: 0; background: #080808; overflow-x: hidden; }
      .app-container { max-width: 1400px; width: 100%; margin: 0 auto; position: relative; min-height: 100vh; background: #080808; box-sizing: border-box; overflow-x: hidden; display: flex; flex-direction: column;}
      .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .agenda-day { flex: 1; min-width: 0; }
      .fade-in { animation: fadeIn 0.3s ease-out forwards; }
      .slide-left { animation: slideLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      .slide-right { animation: slideRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
      @media (min-width: 768px) { .app-container { padding: 0 2vw; border-left: 1px solid #161616; border-right: 1px solid #161616;} }
    `;
    document.head.appendChild(style); return () => { document.head.removeChild(l); document.head.removeChild(style); }
  }, []);

  const [cur, setCur] = useState(null);
  const [tab, setTab] = useState("planning"); const [slideDir, setSlideDir] = useState("fade-in");
  const [viewProfileId, setViewProfileId] = useState(null); 
  
  const [news, setNews] = useState(NW0); 
  const [bureau, setBureau] = useState(BUR0); const [locations, setLocations] = useState(LOCS0);
  const [partners, setPartners] = useState([{id:1, name:"Boulangerie Le Fournil", msg:"Merci pour les viennoiseries lors des tournois !", offer:"-10% sur présentation de la licence UAI"}]);
  const [groups, setGroups] = useState(GR0); const [chat, setChat] = useState({});
  const [muscuList, setMuscuList] = useState(MUSCU0); const [inventory, setInventory] = useState(INV0);
  const [teams, setTeams] = useState([{id:1, name:"Les Anciens", sportId:"pitate", captainId:1, members:[]}]);
  const [challenges, setChallenges] = useState([]); const [feedbacks, setFeedbacks] = useState(FB0);

  const user = cur ? users.find(u => u.id===cur.id)||cur : null;
  const tabsList = ["planning", "matches", "news", "info", "groupes", "account", ...(user && isDev(user) ? ["admin"] : [])];
  
  const changeTab = (newTab) => {
     if(newTab === tab) return;
     const oldIdx = tabsList.indexOf(tab); const newIdx = tabsList.indexOf(newTab);
     setSlideDir(newIdx > oldIdx ? "slide-left" : "slide-right"); setTab(newTab);
     window.scrollTo(0,0);
  };

  const [touchStart, setTouchStart] = useState(null);
  const onTouchStart = (e) => { 
    if(e.target.closest('.no-swipe') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return; 
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY, time: Date.now() }); 
  };
  
  const onTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEndObj = e.changedTouches[0];
    const distanceX = touchStart.x - touchEndObj.clientX;
    const distanceY = touchStart.y - touchEndObj.clientY;
    const timeDiff = Date.now() - touchStart.time;

    if (timeDiff < 800 && Math.abs(distanceX) > 30 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
      const currentIndex = tabsList.indexOf(tab);
      if (distanceX > 0 && currentIndex < tabsList.length - 1) { changeTab(tabsList[currentIndex + 1]); }
      if (distanceX < 0 && currentIndex > 0) { changeTab(tabsList[currentIndex - 1]); }
    }
    setTouchStart(null);
  };

  const notifs = [];
  if (user) {
    if (dDate.getMonth() === 10 && dDate.getDate() >= 15 && (!user.fams || user.fams.length === 0)) {
       notifs.push({msg:`⚠️ Action requise : Renseigner votre Fam's dans l'onglet Compte.`});
    }
    if (isDev(user)) {
       const unreadFb = feedbacks.filter(f => !f.isRead);
       if (unreadFb.length > 0) notifs.push({msg:`🚀 Vous avez ${unreadFb.length} nouveau(x) feedback(s) !`});
    }

    const dToday = new Date(); const todayStr = dToday.toISOString().slice(0,10);
    const dYesterday = new Date(dToday); dYesterday.setDate(dYesterday.getDate() - 1);
    const yesterdayStr = dYesterday.toISOString().slice(0,10);
    const nowHour = dToday.getHours();

    (matches||[]).forEach(m => {
       if(!m.time || !m.date) return;
       const [mh] = m.time.split(':').map(Number);
       const sportName = Sp && Sp[m.sportId] ? Sp[m.sportId].l : m.sportId;

       if (m.date === todayStr && mh >= nowHour) notifs.push({msg:`📅 Match de ${sportName} aujourd'hui à ${m.time} !`});
       if ((m.date === todayStr && mh < nowHour) || m.date === yesterdayStr) {
          if (m.scoreBordels != null) {
            if(m.scoreBordels > m.scoreOpponent) notifs.push({msg:`🏆 Victoire des Bordel's en ${sportName} (${m.scoreBordels}-${m.scoreOpponent}) !`});
            if(m.scoreBordels < m.scoreOpponent) notifs.push({msg:`❌ Défaite des Bordel's en ${sportName} (${m.scoreBordels}-${m.scoreOpponent}).`});
          } else {
             const isInBurs = bureau?.some(b => b.userId === user.id && ['zident','vizident','re','com','log','muscu','ziblec'].includes(b.role));
             const isKptn = (user.adminSports||[]).includes(m.sportId);
             if (isInBurs || isKptn) notifs.push({msg:`📝 N'oubliez pas d'inscrire le score du match de ${sportName} !`});
          }
       }
    });
  }

  if (isDbLoading) return (
    <div style={{minHeight:"100dvh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",color:S.red,fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,letterSpacing:2}}>
      CHARGEMENT...
    </div>
  );

  if (!user) return <AuthScreen users={users} setUsers={setUsers} onLogin={u=>{setCur(u);setTab("planning");}}/>;

  return (
    <div style={{fontFamily:"'Barlow',sans-serif",background:S.bg,minHeight:"100vh",color:"white"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="app-container">
        <Header user={user} onAvatarClick={setViewProfileId} notifs={notifs} />
        {viewProfileId && <UserProfileModal uid={viewProfileId} users={users} bureau={bureau} onClose={() => setViewProfileId(null)} />}
        <div key={tab} className={slideDir} style={{flex: 1, paddingBottom: 68}}>
          {tab==="planning"&&<PlanningTab events={events} setEvents={setEvents} matches={matches} setMatches={setMatches} user={user} locations={locations} setLocations={setLocations} bureau={bureau} isMobile={typeof window!=="undefined"?window.innerWidth<768:false} winH={typeof window!=="undefined"?window.innerHeight:800}/>}
          {tab==="matches"&&<MatchesTab matches={matches} setMatches={setMatches} events={events} setEvents={setEvents} user={user} locations={locations} setLocations={setLocations} bureau={bureau}/>}
          {tab==="news"&&<NewsTab news={news} setNews={setNews} user={user} bureau={bureau}/>}
          {tab==="info"&&<InfoTab bureau={bureau} users={users} user={user} partners={partners} setPartners={setPartners} muscuList={muscuList} setMuscuList={setMuscuList} inventory={inventory} setInventory={setInventory} onViewProfile={setViewProfileId} />}
          {tab==="groupes"&&<GroupesTab groups={groups} setGroups={setGroups} users={users} setUsers={setUsers} user={user} chat={chat} setChat={setChat} teams={teams} setTeams={setTeams} challenges={challenges} setChallenges={setChallenges} bureau={bureau} events={events} setEvents={setEvents}/>}
          {tab==="admin"&&<AdminTab users={users} setUsers={setUsers} bureau={bureau} setBureau={setBureau} feedbacks={feedbacks} setFeedbacks={setFeedbacks} />}
          {tab==="account"&&<AccountTab user={user} setCurrentUser={setCur} users={users} setUsers={setUsers} feedbacks={feedbacks} setFeedbacks={setFeedbacks} />}
          
          <div style={{padding:"20px 0 40px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center", lineHeight: 1.6}}>
            Since Bo 225<br/><span style={{color:"#444", fontSize: 10}}>Usiné par Ki'Shot 91</span>
          </div>
        </div>
        <BottomNav active={tab} onChange={changeTab} user={user} />
      </div>
    </div>
  );
}