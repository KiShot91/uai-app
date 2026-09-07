import { useState, useEffect, useRef } from "react";
import { dL, Sp, canEdit, S, MTYPES, fmtDate, handleLike, btnStyle, SPORTS, isDev, isBurs, isCap } from "../config";
import { Card, SecTitle, AddBtn, Lbl, LocationSelect, Tag, LocationLink, Comments } from "../components/Shared";

const MTC = {Championnat:"#DC2626",Finale:"#F59E0B",Coupe:"#8B5CF6",Amical:"#3B82F6",Tournoi:"#10B981"};

export default function MatchesTab({matches, setMatches, events, setEvents, user, locations, setLocations, bureau}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editMId, setEditMId] = useState(null);
  const [form, setForm] = useState({sportId:"pitate",opponent:"",date:"",time:"",location:"",type:"Amical",home:true,scoreBordels:"",scoreOpponent:""});
  
  const canAdd = canEdit(user, "__any__", bureau);
  const up = (k,v) => setForm(p=>({...p,[k]:v}));
  
  const safeMatches = Array.isArray(matches) ? matches : [];
  const sorted = [...safeMatches].sort((a,b)=>(a.date || "").localeCompare(b.date || ""));
  const pastMatches = sorted.filter(m => dL(m.date) < 0);
  const futureMatches = sorted.filter(m => dL(m.date) >= 0);
  
  const todayRef = useRef(null);

  useEffect(() => { 
    if (todayRef.current) {
        setTimeout(() => {
            todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); 
        }, 150);
    }
  }, []);

  // 🎯 SYNCHRONISATION PLANNING -> Le Match se crée aussi dans le planning
  const handleSaveM = () => {
    if (!form.opponent||!form.date||!form.time||!form.location||!canEdit(user,form.sportId,bureau)) return;
    const sB = form.scoreBordels === "" ? null : Number(form.scoreBordels);
    const sO = form.scoreOpponent === "" ? null : Number(form.scoreOpponent);
    const mId = editMId || Date.now();
    
    const newM = {...form, scoreBordels:sB, scoreOpponent:sO, id:mId};

    if (editMId) {
       setMatches(p => p.map(m => m.id===editMId ? {...m, ...newM} : m));
    } else {
       setMatches(p=>[...p, {...newM, likes:0, likedBy:[], comments:[]}]);
    }

    if (setEvents) {
       setEvents(p => {
          const exists = p.find(e => e.id === mId || e.matchId === mId);
          const title = form.type === "Tournoi" ? `Tournoi ${form.opponent}` : `Match vs ${form.opponent}`;
          const type = form.type === "Tournoi" ? "tournament" : "match";
          if (exists) {
             return p.map(e => (e.id === mId || e.matchId === mId) ? {...e, sportId: form.sportId, date: form.date, time: form.time, location: form.location, type, title} : e);
          } else {
             return [...p, {id: mId, matchId: mId, sportId: form.sportId, date: form.date, time: form.time, dur: 90, location: form.location, type, title}];
          }
       });
    }

    setShowAdd(false); setEditMId(null);
  };

  const openEdit = (m) => { setForm({...m, scoreBordels:m.scoreBordels??"", scoreOpponent:m.scoreOpponent??""}); setEditMId(m.id); setShowAdd(true); window.scrollTo(0,0); };
  
  const delM = (id) => { 
    if(confirm("Supprimer ce match ?")) {
       setMatches(p=>p.filter(m=>m.id!==id)); 
       if(setEvents) setEvents(p=>p.filter(e=>e.id!==id && e.matchId!==id));
    }
  };

  const avSpOptions = (isDev(user) || isBurs(user, bureau)) 
    ? SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras")
    : SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras" && isCap(user, s.id));

  const renderMatch = (m) => {
    if (!m) return null; 
    const d = dL(m.date);
    const sp = Sp[m.sportId] || {l: m.sportId};
    const tc = MTC[m.type] || "#666";
    const liked = Array.isArray(m.likedBy) && m.likedBy.includes(user.id);
    const isAd = canEdit(user, m.sportId, bureau);
    
    let bgGrad = "linear-gradient(135deg,#1a0808,#141414)"; 
    let resColor = S.red; 
    let glowStyle = {};
    let opColor = "#999"; 

    if (d < 0) {
      if (Number(m.scoreBordels) > Number(m.scoreOpponent)) {
          bgGrad = "linear-gradient(135deg,#3a0808,#1a0303)"; 
          resColor = "#ef4444";
          glowStyle = m.type === "Finale" 
            ? { boxShadow: "0 0 60px rgba(255,50,50,0.9), inset 0 0 30px rgba(255,50,50,0.5)", border: "2px solid #ff4444" }
            : { boxShadow: "0 0 30px rgba(220,38,38,0.5), inset 0 0 15px rgba(220,38,38,0.2)", border: "1px solid #991b1b" };
      } else if (Number(m.scoreBordels) < Number(m.scoreOpponent)) {
          bgGrad = "linear-gradient(135deg,#1c1c1c,#111)";
          resColor = "#666";
      } else {
          bgGrad = "linear-gradient(135deg,#222,#111)";
      }
    }

    return (
      <div key={m.id} style={{opacity: d<0 ? 0.95 : 1, marginBottom: 24}}>
        <Card style={{background: bgGrad, ...glowStyle}}>
          <div style={{padding:"12px 16px 10px",borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,color:"white",lineHeight:1}}>{sp.l}</div>
              <div style={{fontSize:14,color:d<=0?"#444":d<=3?"#EF4444":"#444",fontWeight:700,marginTop:4}}>{d<0?"Terminé":d===0?"Aujourd'hui":d===1?"Demain":`J-${d}`}</div>
            </div>
            {isAd && (
               <button onClick={()=>openEdit(m)} style={{background:"none",border:"none",color:"#8B5CF6",fontSize:16,cursor:"pointer"}}>✏️</button>
            )}
          </div>
          <div style={{padding:"20px 14px"}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
              <div style={{flex:1,textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center"}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:26,fontWeight:900,color:resColor,marginBottom:12}}>Bordel's</div>
                {d < 0 && <div style={{fontSize:42, fontWeight:900, color:resColor, lineHeight:1}}>{m.scoreBordels!=null ? m.scoreBordels : "-"}</div>}
              </div>
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"0 10px", position:"relative"}}>
                 <div style={{fontSize:32, position:"absolute", top: d<0?-5:-15, opacity:0.8}}>⚡</div>
                 <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:900,color:"#333",marginTop: d<0?40:15, background:bgGrad, padding:"2px 8px", zIndex:2}}>VS</div>
              </div>
              <div style={{flex:1,textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center"}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:26,fontWeight:900,color:opColor,marginBottom:12}}>{m.opponent}</div>
                {d < 0 && <div style={{fontSize:42, fontWeight:900, color:opColor, lineHeight:1}}>{m.scoreOpponent!=null ? m.scoreOpponent : "-"}</div>}
              </div>
            </div>

            <div style={{display:"flex",gap:5,marginBottom:12,justifyContent:"center"}}><Tag label={m.type} color={tc}/></div>
            <div style={{fontSize:12,color:"#888",display:"flex",flexDirection:"column",gap:4,textAlign:"center"}}>
              <span>{fmtDate(m.date)} - {m.time} - {m.home?"Domicile":"Extérieur"}</span>
              <span style={{color:"#4B9FFF",fontSize:12}}>📍 <LocationLink location={m.location} /></span>
            </div>
            <div style={{display:"flex", justifyContent:"flex-end", marginTop:14, paddingTop:14, borderTop:"1px solid #1a1a1a"}}>
              <button onClick={() => handleLike(m.id, setMatches, user)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:liked?S.red:"#555", display:"flex", alignItems:"center", gap:6}}>
                {liked?"❤️":"🤍"} <span style={{fontWeight:700,fontSize:14}}>{m.likes||0}</span>
              </button>
            </div>
          </div>
          <Comments itemId={m.id} comments={m.comments} setList={setMatches} user={user} />
        </Card>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <SecTitle title="Matchs" action={canAdd&&<AddBtn label="+" onClick={()=>{setForm({sportId:"pitate",opponent:"",date:"",time:"",location:"",type:"Amical",home:true,scoreBordels:"",scoreOpponent:""});setEditMId(null);setShowAdd(v=>!v);}}/>}/>
      
      {showAdd&&(
        <div style={{margin:"0 20px 14px",maxWidth:800,margin:"0 auto 16px",background:"#111",borderRadius:14,padding:18,border:`1px solid ${S.redBorder}`}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:16}}>{editMId?"MODIFIER LE MATCH":"NOUVEAU MATCH"}</div>
          <Lbl t="Sport"/><select style={{...S.inp,marginBottom:10}} value={form.sportId} onChange={e=>up("sportId",e.target.value)}>{avSpOptions.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
          <Lbl t="Adversaire"/><input style={{...S.inp,marginBottom:10}} value={form.opponent} onChange={e=>up("opponent",e.target.value)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl t="Date"/><input type="date" style={S.inp} value={form.date} onChange={e=>up("date",e.target.value)}/></div>
            <div><Lbl t="Heure"/><input type="time" style={S.inp} value={form.time} onChange={e=>up("time",e.target.value)}/></div>
          </div>
          <Lbl t="Lieu"/><LocationSelect value={form.location} onChange={v => up("location", v)} locations={locations} setLocations={setLocations} />
          <Lbl t="Type"/><select style={{...S.inp,marginBottom:12}} value={form.type} onChange={e=>up("type",e.target.value)}>{MTYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>
          <div style={{display:"flex",gap:8,marginBottom:14}}>{["Domicile","Extérieur"].map((l,i)=>{const on=(i===0&&form.home)||(i===1&&!form.home);return(<button key={l} onClick={()=>up("home",i===0)} style={{flex:1,padding:"9px 0",borderRadius:9,border:"1px solid",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600,borderColor:on?S.red:"#2a2a2a",background:on?S.redFaint:"transparent",color:on?S.red:"#555"}}>{l}</button>);})}</div>
          
          <div style={{borderTop:"1px solid #222", marginTop:10, paddingTop:14, marginBottom:14}}>
             <Lbl t="Score (Optionnel, si match terminé)"/>
             <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl t="Bordel's"/><input type="number" style={S.inp} value={form.scoreBordels} onChange={e=>up("scoreBordels",e.target.value)}/></div>
                <div><Lbl t="Adversaire"/><input type="number" style={S.inp} value={form.scoreOpponent} onChange={e=>up("scoreOpponent",e.target.value)}/></div>
             </div>
          </div>

          <div style={{display:"flex",gap:10}}>
             <button onClick={()=>{setShowAdd(false); setEditMId(null);}} style={{flex:1,...btnStyle("#1c1c1c","#888"),border:"1px solid #2a2a2a"}}>Annuler</button>
             {editMId && <button onClick={()=>{delM(editMId);setShowAdd(false);setEditMId(null);}} style={{flex:1,...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Supprimer</button>}
             <button onClick={handleSaveM} style={{flex:2,...btnStyle()}}>Enregistrer</button>
          </div>
        </div>
      )}

      <div style={{padding:"0 20px", maxWidth: 800, margin:"0 auto"}}>
        {pastMatches.length === 0 && <div style={{textAlign:"center", color:"#333", fontSize:12, margin:"20px 0"}}>Aucun historique.</div>}
        
        {pastMatches.map(m => renderMatch(m))}
        
        <div ref={todayRef} style={{display:"flex", justifyContent:"space-between", margin:"40px 0", borderBottom:`2px dashed ${S.red}`, position:"relative", zIndex:0}}>
           <span style={{background:S.bg, padding:"0 14px", color:S.red, fontWeight:900, fontFamily:"'Barlow Condensed'", fontSize:18, letterSpacing:2, position:"relative", top:12}}>▼ À VENIR</span>
           <span style={{background:S.bg, padding:"0 14px", color:S.red, fontWeight:900, fontFamily:"'Barlow Condensed'", fontSize:18, letterSpacing:2, position:"relative", top:12}}>PASSÉ ▲</span>
        </div>
        
        {futureMatches.length === 0 && <div style={{textAlign:"center", color:"#333", fontSize:12, margin:"20px 0"}}>Aucun match à venir.</div>}
        {futureMatches.map(m => renderMatch(m))}
      </div>
    </div>
  );
}