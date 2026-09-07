import { useState, useEffect, useRef } from "react";
import { canEdit, isDev, isBurs, isCap, SPORTS, Sp, S, btnStyle } from "../config";
import { SecTitle, AddBtn, Lbl, LocationSelect, LocationLink } from "../components/Shared";

const LOCAL_TC = {training:"#3B82F6", match:"#DC2626", tournament:"#F59E0B", event:"#8B5CF6", defis:"#EC4899"};
const LOCAL_TL = {training:"Entraînement", match:"Match", tournament:"Tournoi", event:"Événement", defis:"Défi ⚔️"};

const getWeekStart = (offset = 0) => {
    const d = new Date(); const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    return new Date(d.setDate(diff));
};
const getLocalDateStr = (d) => {
    const z = n => ('0'+n).slice(-2);
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
};
const fmtDateLocal = (dStr) => {
    if (!dStr) return ""; const [y, m, d] = dStr.split("-"); return `${d}/${m}`;
};
const endTimeStrLocal = (time, dur) => {
    if (!time) return ""; const [h, m] = time.split(":").map(Number);
    const totalM = h * 60 + m + Number(dur || 90);
    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
};

function useDragScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let isDown = false; let startX; let scrollLeft;
    const md = e => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
    const ml = () => { isDown = false; }; const mu = () => { isDown = false; };
    const mm = e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; const walk = (x - startX) * 2; el.scrollLeft = scrollLeft - walk; };
    el.addEventListener('mousedown', md); el.addEventListener('mouseleave', ml); el.addEventListener('mouseup', mu); el.addEventListener('mousemove', mm);
    return () => { el.removeEventListener('mousedown', md); el.removeEventListener('mouseleave', ml); el.removeEventListener('mouseup', mu); el.removeEventListener('mousemove', mm); };
  }, []);
  return ref;
}

export default function PlanningTab({events, setEvents, matches, setMatches, user, locations, setLocations, bureau, winH, isMobile}) {
  const [showMatch, setShowMatch] = useState(true);
  const [showTrain, setShowTrain] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);
  const [sportFlt, setSportFlt] = useState([]); 
  const [locFlt, setLocFlt] = useState([]);     
  const [showAdd, setShowAdd] = useState(false);
  const [editEv, setEditEv] = useState(null);
  const [viewEv, setViewEv] = useState(null); 
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({sportId:"pitate",date:"",time:"",dur:90,location:"",type:"training"});
  
  const sportDragRef = useDragScroll();
  const locDragRef = useDragScroll();

  const isBursMember = isBurs(user, bureau);
  const canAdd = isDev(user) || isBursMember || (user.adminSports||[]).length > 0;
  const up = (k,v) => setForm(p=>({...p,[k]:v}));

  const safeEvents = Array.isArray(events) ? events : [];
  const sorted = [...safeEvents].sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  
  const filtered = sorted.filter(ev => {
    if (ev.type === "training" && !showTrain) return false;
    if ((ev.type === "match" || ev.type === "tournament") && !showMatch) return false;
    if (ev.type === "defis" && !showChallenge) return false;
    if (ev.type !== "training" && ev.type !== "match" && ev.type !== "tournament" && ev.type !== "defis" && !showMatch) return false; 
    if ((user.bannedSports||[]).includes(ev.sportId)) return false;
    if (sportFlt.length > 0) {
      if (sportFlt.includes("__mine__") && !(user.sports||[]).includes(ev.sportId)) return false;
      if (!sportFlt.includes("__mine__") && !sportFlt.includes(ev.sportId)) return false;
    }
    if (locFlt.length > 0 && !locFlt.includes(ev.location)) return false;
    return true;
  });

  const avSpOptions = (isDev(user) || isBursMember) ? SPORTS.filter(s=>s.id!=="general" && s.id!=="ultra") : SPORTS.filter(s=>s.id!=="general" && s.id!=="ultra" && (isCap(user, s.id) || s.id==="tuverras"));
  const sportsFiltresDispos = SPORTS.filter(s => s.id !== "general" && s.id !== "ultra" && s.id !== "tuverras");
  const ultraSportItem = SPORTS.find(s => s.id === "ultra");
  if (ultraSportItem) sportsFiltresDispos.push(ultraSportItem);
  const lieuxFiltresDispos = [...(locations||[])].sort((a,b) => String(a).localeCompare(String(b), "fr", {sensitivity:"base"}));

  const handleSaveEv = () => {
    if (!form.date||!form.time||!form.location||!canEdit(user,form.sportId,bureau)) return;
    const evId = editEv || Date.now();
    const newEv = {...form, id: evId, dur:+form.dur||90};
    
    if (editEv) setEvents(p => p.map(e => e.id===editEv ? newEv : e));
    else setEvents(p => [...p, newEv]);

    if (setMatches && (form.type === "match" || form.type === "tournament")) {
       setMatches(p => {
          const exists = p.find(m => m.id === evId || m.planningId === evId);
          if (exists) {
             return p.map(m => (m.id === evId || m.planningId === evId) ? {...m, sportId: form.sportId, date: form.date, time: form.time, location: form.location, type: form.type==="tournament"?"Tournoi":"Amical"} : m);
          } else {
             return [...p, {id: evId, planningId: evId, sportId: form.sportId, opponent: "À définir", date: form.date, time: form.time, location: form.location, type: form.type==="tournament"?"Tournoi":"Amical", home: true, scoreBordels: null, scoreOpponent: null, likes:0, likedBy:[], comments:[]}];
          }
       });
    }
    setShowAdd(false); setEditEv(null);
  };

  const delEv = (id) => { 
    if(confirm("Supprimer ce créneau ?")) {
       setEvents(p=>p.filter(e=>e.id!==id)); 
       if(setMatches) setMatches(p=>p.filter(m=>m.id!==id && m.planningId!==id));
       setShowAdd(false); setEditEv(null);
    }
  }

  const handleEventClick = (ev) => { setViewEv(ev); };
  const openEdit = (ev) => { setForm(ev); setEditEv(ev.id); setShowAdd(true); window.scrollTo(0,0); };

  const ws = getWeekStart(weekOffset);
  const days = Array.from({length:7},(_,i)=>{ const d=new Date(ws); d.setDate(ws.getDate()+i); return d; });
  const weekDateStrs = days.map(d => getLocalDateStr(d));
  
  const FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const tod = new Date();

  let minH = 24, maxH = 0;
  const weekEvs = filtered.filter(e => weekDateStrs.includes(e.date));
  
  if (weekEvs.length === 0) {
    minH = 12; maxH = 22;
  } else {
    weekEvs.forEach(ev => {
      if(!ev.time) return;
      const [h, m] = ev.time.split(':').map(Number);
      const startH = h + m/60;
      const endH = startH + (ev.dur||90)/60;
      if (startH < minH) minH = startH;
      if (endH > maxH) maxH = endH;
    });
    
    minH = Math.max(0, Math.floor(minH) - 1);
    maxH = Math.min(24, Math.ceil(maxH) + 1);

    let span = maxH - minH;
    if (span < 5) {
      let diff = 5 - span;
      let padTop = Math.floor(diff / 2);
      let padBot = Math.ceil(diff / 2);
      minH = Math.max(0, minH - padTop);
      maxH = Math.min(24, maxH + padBot);
      
      if (maxH - minH < 5) {
         if (minH === 0) maxH = Math.min(24, 5);
         if (maxH === 24) minH = Math.max(0, 24 - 5);
      }
    }
  }

  const SH = minH; const EH = maxH; const TH = EH - SH;
  const HR = isMobile ? Math.max(35, Math.floor((winH - 250) / (TH || 1))) : Math.max(45, Math.min(120, 600 / (TH || 1))); 
  const hours = Array.from({length:TH+1},(_,i)=>SH+i);
  const evTop = t => { if(!t) return 0; const [h,m]=t.split(":"); return ((+h-SH)+(+m/60))*HR; };
  
  const isAll = showMatch && showTrain && showChallenge;
  const isSportAll = sportFlt.length === 0;
  const isLocAll = locFlt.length === 0;
  const hasMySports = sportFlt.includes("__mine__");
  const weekLabel = weekOffset === 0 ? "Actuel" : weekOffset > 0 ? `+${weekOffset} sem.` : `${weekOffset} sem.`;

  return (
    <div className="fade-in">
      <SecTitle title="Planning" action={canAdd && <AddBtn label="+" onClick={()=>{setForm({sportId:avSpOptions[0]?.id||"pitate",date:"",time:"",dur:90,location:"",type:"training"});setEditEv(null);setShowAdd(v=>!v);}} />} />
      
      <div style={{display:"flex", gap:10, alignItems:"center", padding:"0 20px 10px", flexWrap:"wrap"}}>
        <button onClick={()=>{setShowMatch(true);setShowTrain(true);setShowChallenge(true);}} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${isAll?"#16a34a":"#333"}`,background:isAll?"#16a34a22":"#111",color:isAll?"#4ade80":"#666",fontSize:12,cursor:"pointer",fontWeight:isAll?700:400}}>Tous</button>
        <button onClick={()=>setShowMatch(v=>!v)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${showMatch?S.red:"#333"}`,background:showMatch?S.redFaint:"#111",color:showMatch?S.red:"#666",fontSize:12,cursor:"pointer",fontWeight:showMatch?700:400}}>Matchs</button>
        <button onClick={()=>setShowTrain(v=>!v)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${showTrain?"#3B82F6":"#333"}`,background:showTrain?"#3B82F622":"#111",color:showTrain?"#3B82F6":"#666",fontSize:12,cursor:"pointer",fontWeight:showTrain?700:400}}>Entraînements</button>
        <button onClick={()=>setShowChallenge(v=>!v)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${showChallenge?LOCAL_TC.defis:"#333"}`,background:showChallenge?`${LOCAL_TC.defis}22`:"#111",color:showChallenge?LOCAL_TC.defis:"#666",fontSize:12,cursor:"pointer",fontWeight:showChallenge?700:400}}>Défis</button>
      </div>

      <div style={{padding:"0 20px 14px"}}>
        <div ref={sportDragRef} className="no-scrollbar no-swipe" style={{display:"flex", overflowX:"auto", gap:8, paddingBottom:8, flexWrap:"nowrap", cursor:"grab"}}>
          <div style={{fontSize:10, color:"#555", fontWeight:700, padding:"6px 8px 0 0", flexShrink:0}}>SPORTS :</div>
          <button onClick={()=>setSportFlt([])} style={{flexShrink:0, padding:"4px 10px", borderRadius:14, border:`1px solid ${isSportAll?"#16a34a":"#333"}`, background:isSportAll?"#16a34a":"#1a1a1a", color:isSportAll?"white":"#888", fontSize:11, cursor:"pointer"}}>Tous</button>
          <button onClick={()=>setSportFlt(p=>p.includes("__mine__")?p.filter(x=>x!=="__mine__"):[...p,"__mine__"])} style={{flexShrink:0, padding:"4px 10px", borderRadius:14, border:`1px solid ${hasMySports?"#a855f7":"#333"}`, background:hasMySports?"#a855f7":"#1a1a1a", color:hasMySports?"white":"#888", fontSize:11, cursor:"pointer"}}>Mes sports</button>
          {sportsFiltresDispos.map(s => {
            const on = sportFlt.includes(s.id);
            return <button key={s.id} onClick={()=>setSportFlt(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p.filter(x=>x!=="__mine__"),s.id])} style={{flexShrink:0, padding:"4px 10px", borderRadius:14, border:`1px solid ${on?S.red:"#333"}`, background:on?S.red:"#1a1a1a", color:on?"white":"#888", fontSize:11, cursor:"pointer"}}>{s.l}</button>
          })}
        </div>
        <div ref={locDragRef} className="no-scrollbar no-swipe" style={{display:"flex", overflowX:"auto", gap:8, paddingBottom:4, flexWrap:"nowrap", cursor:"grab"}}>
          <div style={{fontSize:10, color:"#555", fontWeight:700, padding:"6px 8px 0 0", flexShrink:0}}>LIEUX :</div>
          <button onClick={()=>setLocFlt([])} style={{flexShrink:0, padding:"4px 10px", borderRadius:14, border:`1px solid ${isLocAll?"#16a34a":"#333"}`, background:isLocAll?"#16a34a":"#1a1a1a", color:isLocAll?"white":"#888", fontSize:11, cursor:"pointer"}}>Tous</button>
          {lieuxFiltresDispos.map(l => {
            const on = locFlt.includes(l);
            return <button key={l} onClick={()=>setLocFlt(p=>p.includes(l)?p.filter(x=>x!==l):[...p,l])} style={{flexShrink:0, padding:"4px 10px", borderRadius:14, border:`1px solid ${on?"#3B82F6":"#333"}`, background:on?"#3B82F6":"#1a1a1a", color:on?"white":"#888", fontSize:11, cursor:"pointer"}}>{l}</button>
          })}
        </div>
      </div>

      {showAdd && (
        <div className="fade-in" style={{margin:"0 20px 14px",background:"#111",borderRadius:14,padding:18,border:`1px solid ${S.redBorder}`}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:16}}>{editEv?"MODIFIER L'ÉVÉNEMENT":"NOUVEL ÉVÉNEMENT"}</div>
          <Lbl t="Sport"/><select style={{...S.inp,marginBottom:14}} value={form.sportId} onChange={e=>up("sportId",e.target.value)}>{avSpOptions.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
          <Lbl t="Type d'événement"/>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            {Object.entries({training:"#3B82F6", match:"#DC2626", tournament:"#F59E0B", event:"#8B5CF6"}).map(([k,c]) => (
              <button key={k} onClick={()=>up("type",k)} style={{flex:1,minWidth:"45%",padding:"10px 0",borderRadius:9,border:"1px solid",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:900,borderColor:form.type===k?c:"#2a2a2a",background:form.type===k?`${c}22`:"transparent",color:form.type===k?c:"#555",textTransform:"uppercase"}}>{LOCAL_TL[k]}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl t="Date"/><input type="date" style={S.inp} value={form.date} onChange={e=>up("date",e.target.value)}/></div>
            <div><Lbl t="Heure"/><input type="time" style={S.inp} value={form.time} onChange={e=>up("time",e.target.value)}/></div>
          </div>
          <Lbl t="Durée (min)"/><input type="number" style={{...S.inp,marginBottom:10}} value={form.dur} onChange={e=>up("dur",e.target.value)} />
          <Lbl t="Lieu"/><LocationSelect value={form.location} onChange={v => up("location", v)} locations={locations} setLocations={setLocations} />
          <div style={{display:"flex",gap:10,marginTop:6}}>
             <button onClick={()=>{setShowAdd(false); setEditEv(null);}} style={{flex:1,...btnStyle("#1c1c1c","#888"),border:"1px solid #2a2a2a"}}>Annuler</button>
             {editEv && <button onClick={()=>{delEv(editEv);setShowAdd(false);setEditEv(null);}} style={{flex:1,...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Supprimer</button>}
             <button onClick={handleSaveEv} style={{flex:2,...btnStyle()}}>Enregistrer</button>
          </div>
        </div>
      )}

      {viewEv && (
        <div className="fade-in" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setViewEv(null)}>
           <div className="scale-up" style={{background:S.card, width:"100%", maxWidth:400, borderRadius:16, border:`1px solid ${S.cardBorder}`, padding:24, position:"relative"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setViewEv(null)} style={{position:"absolute",top:15,right:15,background:"#111",border:`1px solid ${S.cardBorder}`,color:"#888",fontSize:16,width:32,height:32,borderRadius:"50%",cursor:"pointer"}}>✕</button>
              <div style={{fontSize:12, fontWeight:900, color:LOCAL_TC[viewEv.type] || "#fff", textTransform:"uppercase", letterSpacing:1}}>{LOCAL_TL[viewEv.type] || viewEv.type}</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,color:"white",marginBottom:16}}>{Sp[viewEv.sportId]?.l||viewEv.sportId}</div>
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                 <div style={{display:"flex", alignItems:"center", gap:8, fontSize:15, color:"#ccc"}}>📅 {fmtDateLocal(viewEv.date)}</div>
                 <div style={{display:"flex", alignItems:"center", gap:8, fontSize:15, color:"#ccc"}}>⏰ {viewEv.time} - {endTimeStrLocal(viewEv.time, viewEv.dur)} <span style={{fontSize:12,color:"#666"}}>({viewEv.dur} min)</span></div>
                 <div style={{display:"flex", alignItems:"center", gap:8, fontSize:15, color:"#4B9FFF"}}>
                    📍 <LocationLink location={viewEv.location} />
                 </div>
              </div>
              {canEdit(user, viewEv.sportId, bureau) && (
                 <div style={{display:"flex",gap:10,marginTop:20, borderTop:"1px solid #222", paddingTop:16}}>
                    <button onClick={()=>{delEv(viewEv.id);setViewEv(null);}} style={{flex:1,...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Supprimer</button>
                    <button onClick={()=>{setViewEv(null);openEdit(viewEv);}} style={{flex:1,...btnStyle("#1c1c1c","white"),border:"1px solid #333"}}>Modifier</button>
                 </div>
              )}
           </div>
        </div>
      )}

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 20px 10px"}}>
         <div style={{fontSize:13, fontWeight:700, color:"#ccc", textTransform:"uppercase"}}>Sem. du {ws.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</div>
         <div style={{display:"flex", gap:8, alignItems:"center"}}>
           <button onClick={()=>setWeekOffset(v=>v-1)} style={{background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>{"<"}</button>
           <span style={{fontSize:12, fontWeight:700, color:weekOffset===0?S.red:"#888", width: 70, textAlign:"center"}}>{weekLabel}</span>
           <button onClick={()=>setWeekOffset(v=>v+1)} style={{background:"#1a1a1a",border:"1px solid #333",color:"white",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>{">"}</button>
         </div>
      </div>

      <div style={{paddingBottom:12}}>
        <div className="no-scrollbar no-swipe agenda-container" style={{overflowX:"auto",WebkitOverflowScrolling:"touch", width:"100%", paddingRight: 10, boxSizing:"border-box"}}>
          <div style={{display:"flex", width:"100%"}}>
            <div style={{width:36,flexShrink:0}} />
            {days.map((day,i) => {
              const isT = getLocalDateStr(day) === getLocalDateStr(tod);
              return (
                <div key={i} className="agenda-day" style={{textAlign:"center",padding:"7px 0",borderLeft:"1px solid #1a1a1a",background:isT?"#1a0808":"transparent"}}>
                  <div style={{fontSize:9,color:isT?S.red:"#444",letterSpacing:1,textTransform:"uppercase"}}>{FR[i]}</div>
                  <div style={{fontSize:18,fontWeight:900,fontFamily:"'Barlow Condensed'",color:isT?S.red:"#888",lineHeight:1.1}}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex", width:"100%", borderTop:"1px solid #1a1a1a"}}>
            <div style={{width:36,flexShrink:0,position:"sticky",left:0,background:"#0c0c0c",zIndex:10, height: TH*HR, borderRight:"1px solid #1a1a1a"}}>
              {hours.map(h => <div key={h} style={{position:"absolute",top:(h-SH)*HR, transform:"translateY(-50%)", width:"100%", textAlign:"center", fontSize:10,color:"#555",fontWeight:600}}>{h}h</div>)}
            </div>
            {days.map((day,i) => {
              const dayStr = getLocalDateStr(day);
              const isT = dayStr === getLocalDateStr(tod);
              
              const evs = filtered.filter(e => e.date === dayStr).sort((a,b) => {
                  const tA = a.time ? a.time.split(':').map(Number) : [0,0];
                  const tB = b.time ? b.time.split(':').map(Number) : [0,0];
                  return (tA[0]*60+tA[1]) - (tB[0]*60+tB[1]); 
              });
              
              let clusters = [];
              evs.forEach(ev => {
                  if(!ev.time) return;
                  const start = evTop(ev.time);
                  const end = start + ((ev.dur||90)/60)*HR;
                  ev._start = start; ev._end = end;
                  
                  let added = false;
                  for (let cl of clusters) {
                      if (start < cl.maxEnd) {
                          cl.events.push(ev);
                          if (end > cl.maxEnd) cl.maxEnd = end;
                          added = true; break;
                      }
                  }
                  if (!added) clusters.push({ maxEnd: end, events: [ev] });
              });
              
              clusters.forEach(cl => {
                  const cols = [];
                  cl.events.forEach(ev => {
                      let placed = false;
                      for (let c=0; c<cols.length; c++) {
                          const last = cols[c][cols[c].length-1];
                          if (ev._start >= last._end) {
                              cols[c].push(ev); ev._c = c; placed = true; break;
                          }
                      }
                      if (!placed) { ev._c = cols.length; cols.push([ev]); }
                  });
                  const numC = cols.length;
                  cl.events.forEach(ev => {
                      ev._w = 100 / numC;
                      ev._l = ev._c * ev._w;
                  });
              });

              const isLastDay = i === 6;

              return (
                <div key={i} className="agenda-day" style={{position:"relative",minHeight: TH*HR,borderLeft:"1px solid #1a1a1a", borderRight: isLastDay?"1px solid #1a1a1a":"none",background:isT?"#130808":"transparent"}}>
                  {hours.map((h, hi) => { if(hi === hours.length-1) return null; return <div key={h} style={{position:"absolute",top:(h-SH)*HR,left:0,right:0,width:"100%",borderTop:hi===0?"none":"1px solid #222", zIndex:0}} /> })}
                  
                  {evs.map(ev => {
                    const c = LOCAL_TC[ev.type]||"#555";
                    return (
                      <div key={ev.id} onClick={()=>handleEventClick(ev)} style={{position:"absolute",left:`${ev._l}%`,width:`calc(${ev._w}% - 2px)`,top:ev._start,height:ev._end - ev._start,background:`${c}25`,border:`1px solid ${c}55`,borderRadius:8,padding:"6px",overflow:"hidden",zIndex:2,cursor:"pointer",display:"flex",flexDirection:"column",boxSizing:"border-box"}}>
                        <div style={{display:"flex", flexDirection:"column", height:"100%"}}>
                           <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                             <div style={{fontSize:14,fontWeight:900,color:c,textTransform:"uppercase",lineHeight:1.1,fontFamily:"'Barlow Condensed'"}}>{Sp[ev.sportId]?.l||ev.sportId}</div>
                             <div style={{fontSize:9,fontWeight:800,color:"#fff",background:"rgba(0,0,0,0.3)",padding:"2px 4px",borderRadius:4,flexShrink:0, textAlign:"center", lineHeight:1.1, marginLeft:4}}>{ev.time}<br/>-<br/>{endTimeStrLocal(ev.time,ev.dur)}</div>
                           </div>
                           <div style={{fontSize:11,fontWeight:800,color:"#fff", marginTop: "6px"}}>{LOCAL_TL[ev.type] || ev.type}</div>
                           {ev.title && ev.title !== (LOCAL_TL[ev.type] || ev.type) && <div style={{fontSize:10,color:"#eee", marginTop: 2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{ev.title}</div>}
                           <div style={{fontSize:10,color:"#ccc", marginTop:"auto", whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>📍 {ev.location}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}