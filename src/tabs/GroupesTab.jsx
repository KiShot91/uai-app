import { useState, useRef, useEffect } from "react";
import { dn, Sp, S, btnStyle, SPORTS, fmtDate, isCap } from "../config";
import { SecTitle, SubNav, Card, Tag, Av, MembersSelect, Lbl } from "../components/Shared";

export default function GroupesTab({groups, setGroups, users, setUsers, user, teams, setTeams, challenges, setChallenges, bureau, events, setEvents, chat, setChat}) {
  const [view, setView] = useState("list"); 
  const [defisView, setDefisView] = useState("equipes"); 
  const [manageGroup, setManageGroup] = useState(null); 
  const [viewLicence, setViewLicence] = useState(null); // 📄 Permet d'afficher la licence en grand
  const [msgInputs, setMsgInputs] = useState({});
  const chatScrollRef = useRef(null);
  
  const [tForm, setTForm] = useState({name:"", members:[]});
  const [dForm, setDForm] = useState({cid:"", vid:"", sportId:"pitate", msg:""});

  const mySports = SPORTS.filter(s => (user.sports || []).includes(s.id));
  const myTeams = teams.filter(t => t.captainId === user.id || t.members.includes(user.id));
  const othTeams = teams.filter(t => !myTeams.find(m => m.id === t.id));
  const myReceivedChallenges = challenges.filter(c => myTeams.find(t => t.id === Number(c.vid)) && c.status === "pending");

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chat]);

  const [activeSub, setActiveSub] = useState({});
  const handleSubGroupChange = (sportId, sub) => setActiveSub(p => ({...p, [sportId]: sub}));

  const sendMsg = (chatId) => {
    const txt = msgInputs[chatId];
    if(!txt || !txt.trim()) return;
    setChat(p => ({
        ...p, 
        [chatId]: [...(p[chatId]||[]), {id: Date.now(), userId: user.id, text: txt.trim(), time: new Date().toISOString()}]
    }));
    setMsgInputs({...msgInputs, [chatId]: ""});
  };

  const toggleMute = (chatId) => {
    const muted = user.mutedChats || [];
    const newMuted = muted.includes(chatId) ? muted.filter(id => id !== chatId) : [...muted, chatId];
    if (setUsers) {
      setUsers(p => p.map(u => u.id === user.id ? {...u, mutedChats: newMuted} : u));
    }
  };

  const handleAssign = (sportId, uId, sub) => {
    setGroups(prev => {
        let grp = prev.find(g => g.sportId === sportId);
        if (!grp) grp = { id: Date.now(), sportId, subgroups: {} };
        const updatedSubs = { ...grp.subgroups };
        
        ["Équipe 1", "Équipe 2", "Équipe Fum's"].forEach(k => {
            updatedSubs[k] = (updatedSubs[k]||[]).filter(id => id !== uId);
        });
        
        if (sub !== "Aucune") updatedSubs[sub] = [...(updatedSubs[sub]||[]), uId];
        
        return [...prev.filter(g => g.sportId !== sportId), { ...grp, subgroups: updatedSubs }];
    });
  };

  const getVisibleSubGroups = (sportId) => {
    const grp = groups.find(g => g.sportId === sportId);
    const subs = ["Général"];
    const isC = isCap(user, sportId);
    ["Équipe 1", "Équipe 2", "Équipe Fum's"].forEach(sub => {
       if (isC || (grp?.subgroups?.[sub] && grp.subgroups[sub].includes(user.id))) {
          subs.push(sub);
       }
    });
    return subs;
  };

  const createTeam = () => {
    if(!tForm.name) return; 
    setTeams([...teams, {...tForm, id:Date.now(), captainId:user.id, requests:[]}]); 
    setTForm({name:"", members:[]});
    alert("Équipe créée avec succès !");
  };

  const sendChallenge = () => {
    if(!dForm.cid || !dForm.vid || !dForm.sportId) return alert("Veuillez remplir tous les champs");
    setChallenges([...challenges, {...dForm, id:Date.now(), status: "pending", date: new Date().toISOString()}]);
    setDForm({cid:"", vid:"", sportId:"pitate", msg:""});
    alert("Défi envoyé à l'équipe adverse ! ⚔️");
    setDefisView("mes_defis");
  };

  const acceptChallenge = (cId) => {
    setChallenges(p => p.map(c => c.id === cId ? {...c, status:"accepted"} : c));
    const challenge = challenges.find(c => c.id === cId);
    
    if (challenge && setEvents) {
      const challenger = teams.find(t => t.id === Number(challenge.cid));
      const myTeamTargeted = teams.find(t => t.id === Number(challenge.vid));
      const newEvent = {
        id: `defi-${challenge.id}`, sportId: challenge.sportId, date: new Date().toISOString().slice(0, 10), time: "18:00", dur: 90,
        location: "Terrain à définir", type: "defis", title: `${challenger?.name || "Inconnu"} VS ${myTeamTargeted?.name || "Inconnu"}`
      };
      setEvents(p => [...p, newEvent]);
    }
    alert("Défi accepté et ajouté au planning !");
  };

  return (
    <div className="fade-in" style={{maxWidth:800, margin:"0 auto", paddingBottom: 20}}>
      <SecTitle title="Groupes" sub="Section Sportive et Défis" />
      <SubNav tabs={[["list","Mes Groupes (Sports)"], ["defis","Défis & Équipes"]]} active={view} onChange={setView}/>
      
      {/* 📄 MODAL POUR AFFICHER LA LICENCE EN GRAND */}
      {viewLicence && (
         <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.9)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}} onClick={()=>setViewLicence(null)}>
            <img src={viewLicence} style={{maxWidth:"100%", maxHeight:"90vh", borderRadius:8, border:`2px solid ${S.red}`}} alt="Licence" />
            <button style={{position:"absolute", top:20, right:20, background:"#111", border:"1px solid #333", color:"white", borderRadius:"50%", width:40, height:40, fontSize:20, cursor:"pointer"}}>✕</button>
         </div>
      )}

      {manageGroup && (
       <div className="fade-in" style={{position:'fixed', top:0,left:0,right:0,bottom:0, background:'rgba(0,0,0,0.9)', zIndex:200, padding:20, overflowY:'auto'}}>
          <div style={{background: S.card, padding: 20, borderRadius: 16, maxWidth: 500, margin: '40px auto', border: `1px solid ${S.cardBorder}`}}>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                <div style={{fontSize:20, fontWeight:900, color:S.red, fontFamily:"'Barlow Condensed'"}}>AFFECTATION - {Sp[manageGroup]?.l}</div>
                <button onClick={() => setManageGroup(null)} style={{background:'none', border:'none', color:'white', fontSize:20, cursor:'pointer'}}>✕</button>
             </div>
             
             {users.filter(u => (u.sports||[]).includes(manageGroup)).map(u => {
                 const grp = groups.find(g => g.sportId === manageGroup);
                 let currentAssign = "Aucune";
                 if(grp && grp.subgroups) {
                    if ((grp.subgroups["Équipe 1"]||[]).includes(u.id)) currentAssign = "Équipe 1";
                    else if ((grp.subgroups["Équipe 2"]||[]).includes(u.id)) currentAssign = "Équipe 2";
                    else if ((grp.subgroups["Équipe Fum's"]||[]).includes(u.id)) currentAssign = "Équipe Fum's";
                 }
                 return (
                    <div key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #222'}}>
                       <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <Av name={dn(u)} size={32}/>
                          <div>
                             <div style={{fontSize:14, fontWeight:700}}>{dn(u)}</div>
                             <div style={{fontSize:11, color:'#888', display:'flex', gap:6, alignItems:'center'}}>
                                {u.sexe}
                                {/* 📄 BADGE LICENCE POUR LE CAPITAINE */}
                                {u.licenceFile ? (
                                  <span onClick={(e)=>{e.stopPropagation(); setViewLicence(u.licenceFile);}} style={{background:"#16a34a33", color:"#4ade80", padding:"2px 6px", borderRadius:4, cursor:"pointer", fontWeight:700}}>📄 Voir Licence</span>
                                ) : (
                                  <span style={{background:"#ef444433", color:"#ef4444", padding:"2px 6px", borderRadius:4}}>❌ Pas de licence</span>
                                )}
                             </div>
                          </div>
                       </div>
                       <select value={currentAssign} onChange={(e) => handleAssign(manageGroup, u.id, e.target.value)} style={{...S.inp, width:'auto', padding:'4px 8px', fontSize: 12}}>
                          <option value="Aucune">Général Uniquement</option>
                          {u.sexe === "Homme" ? (
                             <>
                                <option value="Équipe 1">Équipe 1</option>
                                <option value="Équipe 2">Équipe 2</option>
                             </>
                          ) : (
                             <option value="Équipe Fum's">Équipe Fum's</option>
                          )}
                       </select>
                    </div>
                 )
             })}
          </div>
       </div>
      )}

      {view === "list" && (
        <div className="fade-in" style={{padding:"0 20px"}}>
          {mySports.length === 0 ? (
            <div style={{textAlign:"center", color:"#666", padding:"40px 0", fontSize:14}}>
              Vous n'avez aucun sport dans votre profil.<br/>
              Allez dans <strong>Compte &gt; Sports</strong> pour en ajouter !
            </div>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              {mySports.map(s => {
                const currentSub = activeSub[s.id] || "Général";
                const isC = isCap(user, s.id);
                const visibleSubs = getVisibleSubGroups(s.id);
                const chatId = `${s.id}_${currentSub}`;
                const chatMsgs = chat[chatId] || [];
                const isMuted = (user.mutedChats || []).includes(chatId);

                return (
                  <Card key={s.id} style={{padding:0, overflow:"hidden"}}>
                    <div style={{padding:"14px 16px", background:"#1a0808", borderBottom:`1px solid ${S.redBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <div style={{fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:900, color:S.red, textTransform:"uppercase"}}>{s.l}</div>
                        <div style={{fontSize:11, color:"#888", marginTop:2}}>Membre automatique</div>
                      </div>
                      {isC && (
                         <button onClick={() => setManageGroup(s.id)} style={{background:"none", border:`1px solid ${S.red}`, color:S.red, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer"}}>
                           ⚙️ Gérer
                         </button>
                      )}
                    </div>
                    
                    <div style={{padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                        {visibleSubs.map(sub => {
                          const isActive = currentSub === sub;
                          return (
                            <button key={sub} onClick={() => handleSubGroupChange(s.id, sub)} style={{padding:"6px 12px", borderRadius:20, border:`1px solid ${isActive?S.red:"#333"}`, background:isActive?S.red:"#111", color:isActive?"white":"#888", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s"}}>
                              {sub}
                            </button>
                          )
                        })}
                      </div>
                      <button onClick={() => toggleMute(chatId)} title={isMuted ? "Réactiver les notifications" : "Mettre en sourdine"} style={{background:"none", border:"none", cursor:"pointer", fontSize:18, opacity: isMuted ? 0.4 : 1, transition:"opacity 0.2s"}}>
                        {isMuted ? "🔕" : "🔔"}
                      </button>
                    </div>

                    <div style={{background:"#0a0a0a", borderTop:"1px solid #1a1a1a", height: 250, display:'flex', flexDirection:'column'}}>
                       <div className="no-scrollbar" ref={chatScrollRef} style={{flex:1, padding: 12, overflowY:'auto', display:'flex', flexDirection:'column', gap:8}}>
                          {chatMsgs.length === 0 && <div style={{textAlign:'center', color:'#555', fontSize:12, marginTop:20}}>Aucun message dans {currentSub}.</div>}
                          {chatMsgs.map(m => {
                             const isMe = m.userId === user.id;
                             const sender = users.find(u => u.id === m.userId);
                             return (
                                <div key={m.id} style={{alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth:'85%'}}>
                                   {!isMe && <div style={{fontSize:10, color:'#888', marginBottom:2, marginLeft:4}}>{dn(sender)}</div>}
                                   <div style={{background: isMe ? S.red : '#222', color: isMe ? 'white' : '#eee', padding:'8px 12px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize:13, lineHeight:1.4}}>
                                      {m.text}
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                       <div style={{padding: "8px 12px", background:'#111', borderTop:'1px solid #222', display:'flex', gap:8}}>
                          <input className="no-swipe" value={msgInputs[chatId]||""} onChange={e=>setMsgInputs({...msgInputs, [chatId]: e.target.value})} onKeyDown={e => e.key === 'Enter' && sendMsg(chatId)} placeholder={`Écrire dans ${currentSub}...`} style={{...S.inp, flex:1, borderRadius:20, padding:'8px 14px', marginBottom:0}} />
                          <button onClick={() => sendMsg(chatId)} style={{background:S.red, color:'white', border:'none', borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0}}>➤</button>
                       </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "defis" && (
        <div className="fade-in" style={{padding:"0 20px"}}>
          <SubNav tabs={[["equipes","Mes Équipes"], ["mes_defis",`Mes Défis (${myReceivedChallenges.length})`], ["defier","Défier"]]} active={defisView} onChange={setDefisView}/>
          
          {defisView === "equipes" && (
            <div className="fade-in">
              <Card style={{padding:16, marginBottom:20}}>
                <div style={{fontFamily:"'Barlow Condensed'", fontSize:17, fontWeight:900, color:S.red, marginBottom:14}}>CRÉER UNE ÉQUIPE (ex: ED 2)</div>
                <input style={{...S.inp, marginBottom:10}} placeholder="Nom de l'équipe (ex: Les Gaulois d'ED1)" value={tForm.name} onChange={e=>setTForm({...tForm, name:e.target.value})}/>
                <MembersSelect value={tForm.members} onChange={v=>setTForm({...tForm, members:v})} users={users} currentUser={user} />
                <button onClick={createTeam} style={{...btnStyle(), marginTop:10}}>Créer mon équipe</button>
              </Card>

              <div style={{fontFamily:"'Barlow Condensed'", fontSize:17, fontWeight:900, color:"white", marginBottom:14, letterSpacing:1}}>MES ÉQUIPES ACTUELLES</div>
              {myTeams.length === 0 ? <div style={{fontSize:13, color:"#666", textAlign:"center"}}>Vous n'êtes dans aucune équipe.</div> : (
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {myTeams.map(t => {
                    const captain = users.find(u => u.id === t.captainId);
                    return (
                      <Card key={t.id} style={{padding:14}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8}}>
                          <div style={{fontSize:16, fontWeight:900, color:S.red}}>{t.name}</div>
                          <Tag label={t.captainId === user.id ? "Capitaine" : "Membre"} color={t.captainId === user.id ? "#F59E0B" : "#3B82F6"} />
                        </div>
                        <div style={{fontSize:12, color:"#888", marginBottom:10}}>Gérée par {dn(captain)} • {t.members.length + 1} membre(s)</div>
                        <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                          <Av name={dn(captain)} size={28} />
                          {t.members.map(mId => {
                            const m = users.find(u => u.id === mId);
                            return m ? <Av key={m.id} name={dn(m)} size={28} color="#333" /> : null;
                          })}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {defisView === "mes_defis" && (
            <div className="fade-in">
              {myReceivedChallenges.length === 0 ? (
                <div style={{textAlign:"center", color:"#666", padding:"40px 0", fontSize:14}}>
                  Aucun défi en attente.<br/>Vos équipes font trop peur ! 🛡️
                </div>
              ) : (
                <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {myReceivedChallenges.map(c => {
                    const challenger = teams.find(t => t.id === Number(c.cid));
                    const myTeamTargeted = teams.find(t => t.id === Number(c.vid));
                    const sport = Sp[c.sportId] || {l: c.sportId};
                    
                    return (
                      <Card key={c.id} style={{padding:16, border:`1px solid ${S.redBorder}`, background:"#1a0808"}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
                          <Tag label={sport.l} />
                          <span style={{fontSize:11, color:"#888"}}>{fmtDate(c.date.split("T")[0])}</span>
                        </div>
                        <div style={{fontSize:18, fontWeight:900, fontFamily:"'Barlow Condensed'", color:"white", marginBottom:6, lineHeight:1.2}}>
                          <span style={{color:"#EF4444"}}>{challenger?.name}</span> défie <span style={{color:"#4ade80"}}>{myTeamTargeted?.name}</span> !
                        </div>
                        {c.msg && <div style={{fontSize:13, color:"#ccc", fontStyle:"italic", marginBottom:16, background:"#111", padding:10, borderRadius:8}}>"{c.msg}"</div>}
                        
                        <div style={{display:"flex", gap:10}}>
                          <button onClick={()=>setChallenges(p=>p.filter(x=>x.id!==c.id))} style={{flex:1, background:"#111", color:"#888", border:"1px solid #333", borderRadius:8, padding:"8px 0", fontSize:12, fontWeight:700, cursor:"pointer"}}>Refuser</button>
                          <button onClick={()=>acceptChallenge(c.id)} style={{flex:2, background:S.red, color:"white", border:"none", borderRadius:8, padding:"8px 0", fontSize:12, fontWeight:700, cursor:"pointer"}}>Accepter le défi ⚔️</button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {defisView === "defier" && (
            <div className="fade-in">
              <Card style={{padding:16}}>
                <div style={{fontFamily:"'Barlow Condensed'", fontSize:17, fontWeight:900, color:S.red, marginBottom:16}}>LANCER UN DÉFI</div>
                
                <Lbl t="Votre équipe (Challenger)" />
                {myTeams.length === 0 ? (
                   <div style={{fontSize:12, color:"#EF4444", marginBottom:14}}>Vous devez créer ou rejoindre une équipe d'abord !</div>
                ) : (
                  <select style={{...S.inp, marginBottom:14}} value={dForm.cid} onChange={e=>setDForm({...dForm, cid:e.target.value})}>
                    <option value="">-- Choisir mon équipe --</option>
                    {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}

                <Lbl t="Équipe à défier (Adversaire)" />
                <select style={{...S.inp, marginBottom:14}} value={dForm.vid} onChange={e=>setDForm({...dForm, vid:e.target.value})}>
                  <option value="">-- Choisir la cible --</option>
                  {othTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <Lbl t="Sur quel sport ?" />
                <select style={{...S.inp, marginBottom:14}} value={dForm.sportId} onChange={e=>setDForm({...dForm, sportId:e.target.value})}>
                  {SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras").map(s => <option key={s.id} value={s.id}>{s.l}</option>)}
                </select>

                <Lbl t="Message de provocation (Optionnel)" />
                <textarea rows={3} style={{...S.inp, resize:"none", marginBottom:16}} placeholder="Préparez-vous à perdre..." value={dForm.msg} onChange={e=>setDForm({...dForm, msg:e.target.value})} />

                <button onClick={sendChallenge} disabled={myTeams.length===0} style={{...btnStyle(), opacity: myTeams.length===0 ? 0.5 : 1}}>Envoyer le défi 🥊</button>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}