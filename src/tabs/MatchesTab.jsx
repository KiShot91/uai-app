import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { dL, Sp, canEdit, S, MTYPES, fmtDate, btnStyle, SPORTS, isDev, isBurs, isCap, dn } from "../config";
import { Card, SecTitle, AddBtn, Lbl, LocationSelect, Tag, LocationLink, Av } from "../components/Shared";

const MTC = {Championnat:"#DC2626",Finale:"#F59E0B",Coupe:"#8B5CF6",Amical:"#3B82F6",Tournoi:"#10B981"};

function MatchComments({ match, setMatches, user, onViewProfile, users }) {
  const [txt, setTxt] = useState("");
  const comments = match.comments || [];
  
  const add = async () => { 
    if(!txt.trim()) return;
    const userAvatar = user.avatar || null;
    const nc = { id: Date.now(), userId: user.id, userName: dn(user), userAvatar: userAvatar, text: txt, time: new Date().toISOString() };
    const newComments = [...comments, nc];
    try {
       const {error} = await supabase.from('matches').update({comments: newComments}).eq('id', match.id);
       if (error) throw error;
       setMatches(p => p.map(m => m.id === match.id ? {...m, comments: newComments} : m));
       setTxt("");
    } catch(e) { console.error(e); alert("Erreur lors de l'envoi."); }
  };

  return (
    <div style={{borderTop:"1px solid #1a1a1a",padding:"14px 16px", background:"#0c0c0c"}}>
      <div style={{fontSize:10,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>COMMENTAIRES - {comments.length}</div>
      {comments.map(c => {
         const commenter = users ? users.find(u => u.id === c.userId) : null;
         const avatarUrl = commenter ? commenter.avatar : null;
         
         return (
            <div key={c.id} style={{marginBottom:12,display:"flex",gap:10}}>
              <div 
                onClick={(e) => { e.stopPropagation(); if (onViewProfile && c.userId) onViewProfile(c.userId); }} 
                style={{cursor: onViewProfile ? "pointer" : "default"}}
              >
                 <Av src={avatarUrl} name={c.userName} size={30} color={S.red} />
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:3,alignItems:"center"}}>
                   <span 
                     onClick={(e) => { e.stopPropagation(); if (onViewProfile && c.userId) onViewProfile(c.userId); }} 
                     style={{fontSize:12,fontWeight:700, cursor: onViewProfile ? "pointer" : "default"}}
                   >
                     {c.userName}
                   </span>
                   <span style={{fontSize:10,color:"#333"}}>{new Date(c.time).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
                </div>
                <div style={{fontSize:13,color:"#aaa",lineHeight:1.6,marginBottom:6}}>{c.text}</div>
              </div>
            </div>
         );
      })}
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <input style={{...S.inp,flex:1,padding:"9px 12px",fontSize:13}} placeholder="Commenter..." value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <button onClick={add} style={{background:S.red, color:"white", border:"none", borderRadius:10, padding:"9px 14px", cursor:"pointer", fontSize:13, fontWeight:700, flexShrink:0}}>Envoyer</button>
      </div>
    </div>
  );
}

export default function MatchesTab({matches, setMatches, events, setEvents, user, locations, setLocations, bureau, onViewProfile, users}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editMId, setEditMId] = useState(null);
  const [form, setForm] = useState({sportId:"pitate",opponent:"",date:"",time:"",location:"",type:"Amical",home:true,scoreBordels:"",scoreOpponent:"", isFums:false});
  
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [locForm, setLocForm] = useState({ name:"", address:"", url:"" });

  const canAdd = canEdit(user, "__any__", bureau);
  const up = (k,v) => setForm(p=>({...p,[k]:v}));
  
  const safeMatches = Array.isArray(matches) ? matches : [];
  
  const now = new Date();
  
  const matchesWithTimeStatus = safeMatches.map(m => {
     let isPast = false;
     
     if (m.scoreBordels != null && m.scoreBordels !== "") {
         isPast = true;
     } else if (m.date) {
        const matchDateTime = new Date(`${m.date}T${m.time || "23:59"}:00`);
        const matchEndDateTime = new Date(matchDateTime.getTime() + 90 * 60000);
        isPast = now > matchEndDateTime;
     }
     
     return { ...m, isPast };
  });

  const sorted = [...matchesWithTimeStatus].sort((a,b)=>(a.date || "").localeCompare(b.date || ""));
  
  const pastMatches = sorted.filter(m => m.isPast);
  const futureMatches = sorted.filter(m => !m.isPast);
  
  const todayRef = useRef(null);

  useEffect(() => { 
    if (todayRef.current) {
        setTimeout(() => {
            todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" }); 
        }, 150);
    }
  }, []);

  const saveNewLocation = async () => {
    if(!locForm.name.trim() || !locForm.address.trim()) return alert("Nom et adresse obligatoires !");
    const locId = `loc_${Date.now()}`;
    const newLoc = { id: locId, name: locForm.name, address: locForm.address, url: locForm.url };
    try {
      const { error } = await supabase.from('locations').insert([newLoc]);
      if (error) throw error;
      setLocations([...locations, newLoc]);
      up("location", locId); 
      setShowAddLoc(false);
      setLocForm({name:"", address:"", url:""});
    } catch(err) { console.error(err); alert("Erreur lors de l'ajout du lieu."); }
  };

  const handleSaveM = async () => {
    if (!form.opponent||!form.date||!form.time||!form.location||!canEdit(user,form.sportId,bureau)) return;
    const sB = form.scoreBordels === "" ? null : Number(form.scoreBordels);
    const sO = form.scoreOpponent === "" ? null : Number(form.scoreOpponent);
    const mId = editMId || Date.now();
    
    const typeStr = form.type === "Tournoi" ? "tournament" : "match";
    const titleStr = form.type === "Tournoi" ? `Tournoi ${form.opponent}` : `Match vs ${form.opponent}`;

    const dbMatchPayload = {
       sportid: form.sportId,
       opponent: form.opponent,
       date: form.date,
       time: form.time,
       location: form.location,
       type: form.type,
       home: form.home,
       scorebordels: sB,
       scoreopponent: sO,
       isfums: form.isFums
    };

    const dbEventPayload = {
       sportid: form.sportId,
       date: form.date,
       time: form.time,
       dur: 90,
       location: form.location,
       type: typeStr,
       title: titleStr,
       isfums: form.isFums
    };

    try {
      if (editMId) {
         const currentMatch = matches.find(x => x.id === editMId);
         const eventIdToUpdate = currentMatch?.planningId || editMId;

         const { error: errM } = await supabase.from('matches').update(dbMatchPayload).eq('id', editMId);
         if (errM) throw errM;
         
         await supabase.from('events').update(dbEventPayload).eq('id', eventIdToUpdate);
         
         setMatches(p => p.map(m => m.id === editMId ? {...m, ...form, scoreBordels: sB, scoreOpponent: sO, isfums: form.isFums} : m));
         if (setEvents) {
            setEvents(p => p.map(e => e.id === eventIdToUpdate ? {...e, ...dbEventPayload} : e));
         }
      } else {
         dbMatchPayload.id = mId;
         dbMatchPayload.planningid = mId;
         dbMatchPayload.likes = 0;
         dbMatchPayload.likedby = [];
         dbMatchPayload.comments = [];
         
         const { error: errM } = await supabase.from('matches').insert([dbMatchPayload]);
         if (errM) throw errM;
         
         dbEventPayload.id = mId;
         await supabase.from('events').insert([dbEventPayload]);

         setMatches(p => [...p, {id: mId, ...form, planningId: mId, scoreBordels: sB, scoreOpponent: sO, likes: 0, likedBy: [], comments: [], isfums: form.isFums}]);
         if (setEvents) {
            setEvents(p => [...p, {id: mId, matchId: mId, ...dbEventPayload}]);
         }
      }
      setShowAdd(false); setEditMId(null); setShowAddLoc(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du match.");
    }
  };

  const openEdit = (m) => { 
     setForm({...m, scoreBordels:m.scoreBordels??"", scoreOpponent:m.scoreOpponent??"", isFums: m.isfums || m.isFums || false}); 
     setEditMId(m.id); 
     setShowAddLoc(false); 
     setShowAdd(true); 
     window.scrollTo(0,0); 
  };
  
  const delM = async (id) => { 
    if(confirm("Supprimer ce match ?")) {
       try {
          const currentMatch = matches.find(x => x.id === id);
          const eventIdToDelete = currentMatch?.planningId || id;

          const { error } = await supabase.from('matches').delete().eq('id', id);
          if (error) throw error;

          await supabase.from('events').delete().eq('id', eventIdToDelete);

          setMatches(p=>p.filter(m=>m.id!==id)); 
          if(setEvents) setEvents(p=>p.filter(e=>e.id!==eventIdToDelete));
       } catch (err) {
          console.error(err);
          alert("Erreur lors de la suppression.");
       }
    }
  };

  const toggleLike = async (m) => {
    const isL = (m.likedBy || []).includes(user.id);
    const newLikedBy = isL ? (m.likedBy||[]).filter(x=>x!==user.id) : [...(m.likedBy||[]), user.id];
    const newLikes = newLikedBy.length;
    try {
      const { error } = await supabase.from('matches').update({ likes: newLikes, likedby: newLikedBy }).eq('id', m.id);
      if (error) throw error;
      setMatches(p => p.map(x => x.id === m.id ? {...x, likes: newLikes, likedBy: newLikedBy} : x));
    } catch (err) { console.error(err); }
  };

  const avSpOptions = (isDev(user) || isBurs(user, bureau)) 
    ? SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras")
    : SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras" && isCap(user, s.id));

  const renderMatch = (m) => {
    if (!m) return null; 
    
    const isPast = m.isPast;
    const dDays = dL(m.date); 

    const sp = Sp[m.sportId] || {l: m.sportId};
    const tc = MTC[m.type] || "#666";
    const liked = Array.isArray(m.likedBy) && m.likedBy.includes(user.id);
    const isAd = canEdit(user, m.sportId, bureau);
    const isFums = m.isfums || m.isFums; 
    
    let bgGrad = "linear-gradient(135deg,#1a0808,#141414)"; 
    let resColor = S.red; 
    let glowStyle = {};
    let opColor = "#999"; 

    if (isPast) {
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
      <div key={m.id} style={{opacity: isPast ? 0.95 : 1, marginBottom: 24}}>
        <Card style={{background: bgGrad, ...glowStyle}}>
          <div style={{padding:"12px 16px 10px",borderBottom:"1px solid #1a1a1a",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,color:"white",lineHeight:1, display:"flex", alignItems:"center"}}>
                 {sp.l}
                 {isFums && <span style={{marginLeft:8, fontSize:12, fontWeight:700, letterSpacing:1, background:"#1a0808", color:S.red, padding:"3px 8px", borderRadius:6, border:`1px solid ${S.red}`}}>FUM'S</span>}
              </div>
              <div style={{fontSize:14,color:dDays<=0?"#444":dDays<=3?"#EF4444":"#444",fontWeight:700,marginTop:6}}>{isPast?"Terminé":dDays===0?"Aujourd'hui":dDays===1?"Demain":`J-${dDays}`}</div>
            </div>
            {isAd && (
               <button onClick={()=>openEdit(m)} style={{background:"none",border:"none",color:"#8B5CF6",fontSize:16,cursor:"pointer"}}>✏</button>
            )}
          </div>
          <div style={{padding:"20px 14px"}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
              <div style={{flex:1,textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center"}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:26,fontWeight:900,color:resColor,marginBottom:12}}>Bordel's</div>
                {isPast && <div style={{fontSize:42, fontWeight:900, color:resColor, lineHeight:1}}>{m.scoreBordels!=null ? m.scoreBordels : "-"}</div>}
              </div>
              <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"0 10px", position:"relative"}}>
                 <div style={{fontSize:32, position:"absolute", top: isPast?-5:-15, opacity:0.8}}>⚡</div>
                 <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:900,color:"#333",marginTop: isPast?40:15, background:bgGrad, padding:"2px 8px", zIndex:2}}>VS</div>
              </div>
              <div style={{flex:1,textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center"}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:26,fontWeight:900,color:opColor,marginBottom:12}}>{m.opponent}</div>
                {isPast && <div style={{fontSize:42, fontWeight:900, color:opColor, lineHeight:1}}>{m.scoreOpponent!=null ? m.scoreOpponent : "-"}</div>}
              </div>
            </div>

            <div style={{display:"flex",gap:5,marginBottom:12,justifyContent:"center"}}><Tag label={m.type} color={tc}/></div>
            <div style={{fontSize:12,color:"#888",display:"flex",flexDirection:"column",gap:4,textAlign:"center"}}>
              <span>{fmtDate(m.date)} - {m.time} - {m.home?"Domicile":"Extérieur"}</span>
              <span style={{color:"#4B9FFF",fontSize:12}}>📍 <LocationLink location={m.location} locations={locations} /></span>
            </div>
            <div style={{display:"flex", justifyContent:"flex-end", marginTop:14, paddingTop:14, borderTop:"1px solid #1a1a1a"}}>
              <button onClick={() => toggleLike(m)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:liked?S.red:"#555", display:"flex", alignItems:"center", gap:6}}>
                {liked?"❤️":"🤍"} <span style={{fontWeight:700,fontSize:14}}>{m.likes||0}</span>
              </button>
            </div>
          </div>
          <MatchComments match={m} setMatches={setMatches} user={user} onViewProfile={onViewProfile} users={users} />
        </Card>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{position:"sticky", top: 0, background: S.bg, zIndex: 10, paddingBottom: 10}}>
         <SecTitle title="Matchs" action={canAdd&&<AddBtn label="+" onClick={()=>{setForm({sportId:"pitate",opponent:"",date:"",time:"",location:"",type:"Amical",home:true,scoreBordels:"",scoreOpponent:"", isFums:false});setEditMId(null);setShowAddLoc(false);setShowAdd(v=>!v);}}/>}/>
      </div>
      
      {showAdd&&(
        <div style={{margin:"0 20px 14px",maxWidth:800,margin:"0 auto 16px",background:"#111",borderRadius:14,padding:18,border:`1px solid ${S.redBorder}`}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:16}}>{editMId?"MODIFIER LE MATCH":"NOUouveau MATCH"}</div>
          <Lbl t="Sport"/><select style={{...S.inp,marginBottom:10}} value={form.sportId} onChange={e=>up("sportId",e.target.value)}>{avSpOptions.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
          
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#eee",cursor:"pointer", marginBottom:14, padding:"8px", background:"#1a1a1a", borderRadius:8, border:"1px solid #333"}}>
             <input type="checkbox" checked={form.isFums} onChange={e=>up("isFums",e.target.checked)} style={{accentColor:S.red, width:16, height:16}}/>
             <span>Équipe Fum's (Féminines) uniquement</span>
          </label>

          <Lbl t="Adversaire"/><input style={{...S.inp,marginBottom:10}} value={form.opponent} onChange={e=>up("opponent",e.target.value)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl t="Date"/><input type="date" style={S.inp} value={form.date} onChange={e=>up("date",e.target.value)}/></div>
            <div><Lbl t="Heure"/><input type="time" style={S.inp} value={form.time} onChange={e=>up("time",e.target.value)}/></div>
          </div>
          
          <Lbl t="Lieu"/>
          <LocationSelect value={form.location} onChange={v => up("location", v)} locations={locations} />
          
          <div style={{textAlign:"right", marginBottom:12, marginTop:-4}}>
             <button onClick={()=>setShowAddLoc(!showAddLoc)} style={{background:"none",border:"none",color:"#8B5CF6",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>+ Ajouter un nouveau lieu</button>
          </div>
          
          {showAddLoc && (
             <div className="fade-in" style={{background:"#1a1a1a", border:"1px solid #333", padding:12, borderRadius:8, marginBottom:16}}>
                <div style={{fontSize:11, color:"#8B5CF6", fontWeight:700, marginBottom:8}}>NOUVEAU LIEU</div>
                <input style={{...S.inp, marginBottom:6, padding:"8px", fontSize:12}} placeholder="Nom (ex: Complexe R. Boulin)" value={locForm.name} onChange={e=>setLocForm({...locForm, name:e.target.value})} />
                <input style={{...S.inp, marginBottom:6, padding:"8px", fontSize:12}} placeholder="Adresse exacte" value={locForm.address} onChange={e=>setLocForm({...locForm, address:e.target.value})} />
                <input style={{...S.inp, marginBottom:8, padding:"8px", fontSize:12}} placeholder="Lien Google Maps (optionnel)" value={locForm.url} onChange={e=>setLocForm({...locForm, url:e.target.value})} />
                <button onClick={saveNewLocation} style={{background:"#8B5CF6", color:"white", border:"none", padding:"6px", borderRadius:6, width:"100%", cursor:"pointer", fontSize:12, fontWeight:700}}>Enregistrer ce lieu</button>
             </div>
          )}

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
             <button onClick={()=>{setShowAdd(false); setEditMId(null); setShowAddLoc(false);}} style={{flex:1,...btnStyle("#1c1c1c","#888"),border:"1px solid #2a2a2a"}}>Annuler</button>
             {editMId && <button onClick={()=>{delM(editMId);setShowAdd(false);setEditMId(null); setShowAddLoc(false);}} style={{flex:1,...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Supprimer</button>}
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