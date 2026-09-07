import { useState } from "react";
import { isDev, isBurs, isCap, dn, canEdit, SPORTS, ROLES, BURS_ROLE_IDS, SANTE_DATA, S, btnStyle } from "../config";
import { SecTitle, Card, Lbl, RenderTitles, Av, Tag } from "../components/Shared";

export default function InfoTab({bureau, users, user, partners, setPartners, muscuList, setMuscuList, inventory, setInventory, onViewProfile}) {
  // 🛡️ CORRECTION : On initialise à null pour ne rien ouvrir par défaut
  const [open,setOpen]=useState(null); 
  
  const [mod,setMod]=useState(null);
  const [showAddP, setShowAddP] = useState(false); 
  const [formP, setFormP] = useState({name:"", msg:"", offer:""});
  const [searchM, setSearchM] = useState("");
  
  const inBurs = isBurs(user, bureau);
  const canEditMuscu = isDev(user) || inBurs || isCap(user, "muscu");
  const canEditPartners = isDev(user) || inBurs;
  
  const addPartner = () => { 
    if (!formP.name) return; 
    setPartners(p => [...p, {...formP, id:Date.now()}]); 
    setShowAddP(false); 
    setFormP({name:"", msg:"", offer:""}); 
  }
  
  const captains = users.filter(u => (u.adminSports||[]).length > 0 && !isDev(u));
  
  const [formM, setFormM] = useState({cat:"Machines", name:"", desc:""});
  const addMuscu = () => { 
    if(!formM.name) return; 
    setMuscuList(p=>[...p,{...formM, id:Date.now()}]); 
    setFormM({cat:"Machines", name:"", desc:""}); 
  }
  
  const [formI, setFormI] = useState({sportId:"pitate", name:"", qty:1, desc:""});
  const addInv = () => { 
    if(!formI.name) return; 
    setInventory(p=>[...p,{...formI, qty:Number(formI.qty)||1, id:Date.now()}]); 
    setFormI(p=>({...p, name:"", qty:1, desc:""})); 
  }

  // Sécurisation de la recherche 
  const annuaireList = searchM 
    ? users.filter(u => !isDev(u) && [u.nom, u.prenom, u.bucque, ...(Array.isArray(u.fams)?u.fams:[u.fams])].some(v=>String(v||"").toLowerCase().includes(searchM.toLowerCase())))
    : users.filter(u => !isDev(u));

  return(
    <div className="fade-in" style={{maxWidth: 800, margin: "0 auto"}}>
      <SecTitle title="Informations" sub="Bureau, Santé, Partenaires"/>
      <div style={{display:"flex", flexDirection:"column", gap:12, padding:"0 20px 16px"}}>

        {/* BUR'S GROUPÉ PAR RÔLE */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="burs"?null:"burs")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🏛️</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Le Bur's</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Bureau de l'UAI</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="burs"?"^":"v"}</span>
          </button>
          {open==="burs"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              {ROLES.filter(r=>BURS_ROLE_IDS.includes(r.id)).map(role => {
                 const members = bureau.filter(m=>m.role===role.id);
                 if(!members.length) return null;
                 return (
                   <div key={role.id} style={{marginBottom: 16}}>
                      <div style={{fontSize:11, color:S.red, fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:1}}>{role.label} <span style={{color:"#555",fontWeight:400}}>({role.full})</span></div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {members.map(m => {
                          const u = users.find(x=>x.id===m.userId);
                          if(!u) return null;
                          return (
                            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,background:"#111",padding:10,borderRadius:10,border:"1px solid #1a1a1a",cursor:"pointer"}} onClick={()=>onViewProfile(u.id)}>
                              <Av src={u.avatar} name={u.bucque||u.prenom} size={42} />
                              <div style={{flex:1}}>
                                <div style={{fontSize:14,fontWeight:700}}>{u.bucque||u.prenom}</div>
                                <RenderTitles u={u} bureau={bureau} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                   </div>
                 )
              })}
            </div>
          )}
        </Card>

        {/* K'PI'T'N */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="kap"?null:"kap")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>👑</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>K'π'T'N</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Capitaines des sports</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="kap"?"^":"v"}</span>
          </button>
          {open==="kap"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              {captains.length===0&&<div style={{fontSize:13,color:"#555",textAlign:"center",padding:"12px 0"}}>Aucun capitaine renseigné.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {captains.map(u=>(
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>onViewProfile(u.id)}>
                    <Av src={u.avatar} name={dn(u)} size={44} />
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{dn(u)}</div>
                      <RenderTitles u={u} bureau={bureau} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* RECHERCHE ANNUAIRE */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="annu"?null:"annu")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🔍</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Membres</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Retrouver un profil</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="annu"?"^":"v"}</span>
          </button>
          {open==="annu"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              <input style={S.inp} placeholder="Chercher par nom, prénom, bucque, fam's..." value={searchM} onChange={e=>setSearchM(e.target.value)} />
              <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:8, maxHeight: 400, overflowY:"auto"}}>
                {annuaireList.length === 0 ? <div style={{fontSize:12, color:"#555", textAlign:"center"}}>Aucun résultat</div> : 
                  annuaireList.map(u => (
                    <div key={u.id} onClick={()=>onViewProfile(u.id)} style={{display:"flex",alignItems:"center",gap:12,background:"#111",padding:10,borderRadius:10,border:"1px solid #1a1a1a", cursor:"pointer"}}>
                       <Av src={u.avatar} name={dn(u)} size={38} />
                       <div style={{flex:1}}>
                         <div style={{fontSize:14,fontWeight:700}}>{dn(u)}</div>
                         <RenderTitles u={u} bureau={bureau} />
                       </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </Card>

        <Card>
          <button onClick={()=>setOpen(v=>v==="parts"?null:"parts")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🤝</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Partenariats</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Nos sponsors et offres</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="parts"?"^":"v"}</span>
          </button>
          {open==="parts"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              {canEditPartners && (
                <div style={{marginBottom:14}}>
                  <button onClick={()=>setShowAddP(!showAddP)} style={{background:"#1a1a1a",color:"white",border:"1px solid #333",padding:"6px 12px",borderRadius:6,fontSize:11,cursor:"pointer",width:"100%"}}>+ Ajouter un partenaire</button>
                  {showAddP && (
                    <div style={{marginTop:8, background:"#111", padding:10, borderRadius:8}}>
                      <input style={{...S.inp, padding:6, fontSize:12, marginBottom:6}} placeholder="Nom du sponsor..." value={formP.name} onChange={e=>setFormP({...formP,name:e.target.value})} />
                      <input style={{...S.inp, padding:6, fontSize:12, marginBottom:6}} placeholder="Mot de remerciement..." value={formP.msg} onChange={e=>setFormP({...formP,msg:e.target.value})} />
                      <input style={{...S.inp, padding:6, fontSize:12, marginBottom:6}} placeholder="Offre (ex: -10% sur...)" value={formP.offer} onChange={e=>setFormP({...formP,offer:e.target.value})} />
                      <button onClick={addPartner} style={{background:S.red,color:"white",border:"none",padding:"6px",borderRadius:6,fontSize:11,cursor:"pointer",width:"100%"}}>Sauvegarder</button>
                    </div>
                  )}
                </div>
              )}
              {partners.length===0&&<div style={{fontSize:12,color:"#555",textAlign:"center"}}>Aucun partenaire renseigné.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {partners.map(p=>(
                  <div key={p.id} style={{background:"#141414", padding:12, borderRadius:8, border:"1px solid #222", position:"relative"}}>
                    {canEditPartners && <button onClick={()=>{if(confirm("Supprimer ?")) setPartners(arr=>arr.filter(x=>x.id!==p.id));}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",color:"#EF4444",cursor:"pointer"}}>🗑️</button>}
                    <div style={{fontSize:15,fontWeight:700,marginBottom:4,color:S.red}}>{p.name}</div>
                    {p.msg && <div style={{fontSize:12,color:"#999",marginBottom:6,fontStyle:"italic"}}>"{p.msg}"</div>}
                    {p.offer && <div style={{fontSize:11,background:"#10B98122",color:"#10B981",padding:"4px 8px",borderRadius:4,display:"inline-block"}}>🎁 {p.offer}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* PRÉVENTION REGROUPÉE */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="prev"?null:"prev")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🛡️</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Prévention & Santé</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Échauffements, Étirements, Soins...</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="prev"?"^":"v"}</span>
          </button>
          {open==="prev"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
               {Object.entries(SANTE_DATA).map(([k, d]) => (
                  <button key={k} onClick={()=>setMod(k)} style={{background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:12, padding:"16px 10px", color:"white", fontFamily:"inherit", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                     <span style={{fontSize:24}}>{d.title.split(' ')[0]}</span>
                     <span style={{fontSize:13, fontWeight:700, textAlign:"center"}}>{d.title.split(' ').slice(1).join(' ')}</span>
                  </button>
               ))}
            </div>
          )}
        </Card>

        {/* MUSCULATION ÉDITABLE */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="musc"?null:"musc")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>💪</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Musculation</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Machines et exercices</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="musc"?"^":"v"}</span>
          </button>
          {open==="musc"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              {canEditMuscu && (
                <div style={{background:"#111", padding:12, borderRadius:12, border:"1px solid #222", marginBottom:16}}>
                   <div style={{fontSize:12, fontWeight:700, color:S.red, marginBottom:10}}>AJOUTER UN EXERCICE</div>
                   <select style={{...S.inp, marginBottom:8}} value={formM.cat} onChange={e=>setFormM({...formM,cat:e.target.value})}><option>Machines</option><option>Poids libres</option><option>Cardio</option><option>Poids du corps</option></select>
                   <input style={{...S.inp, marginBottom:8}} placeholder="Nom..." value={formM.name} onChange={e=>setFormM({...formM,name:e.target.value})}/>
                   <input style={{...S.inp, marginBottom:8}} placeholder="Description..." value={formM.desc} onChange={e=>setFormM({...formM,desc:e.target.value})}/>
                   <button onClick={addMuscu} style={{background:S.red,color:"white",border:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",width:"100%"}}>Ajouter</button>
                </div>
              )}
              {["Machines", "Poids libres", "Poids du corps", "Cardio"].map(cat => {
                 const items = muscuList.filter(m => m.cat === cat);
                 if(items.length===0) return null;
                 return (
                   <div key={cat} style={{marginBottom:16}}>
                     <div style={{fontSize:10,color:S.red,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>{cat}</div>
                     <div style={{display:"flex",flexDirection:"column",gap:8}}>
                       {items.map(m => (
                         <div key={m.id} style={{background:"#1c1c1c",border:"1px solid #232323",borderRadius:10,padding:"10px 13px", position:"relative"}}>
                           {canEditMuscu && <button onClick={()=>{if(confirm("Supprimer ?")) setMuscuList(arr=>arr.filter(x=>x.id!==m.id));}} style={{position:"absolute",top:6,right:6,background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12}}>🗑️</button>}
                           <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{m.name}</div>
                           <div style={{fontSize:12,color:"#999",lineHeight:1.6}}>{m.desc}</div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )
              })}
            </div>
          )}
        </Card>

        {/* INVENTAIRE */}
        <Card>
          <button onClick={()=>setOpen(v=>v==="inv"?null:"inv")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",color:"white",fontFamily:"inherit",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>📦</span><div><div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:800}}>Inventaire</div><div style={{fontSize:10,color:"#555",marginTop:1}}>Matériel disponible</div></div></div>
            <span style={{color:S.red,fontSize:14}}>{open==="inv"?"^":"v"}</span>
          </button>
          {open==="inv"&&(
            <div className="fade-in" style={{borderTop:"1px solid #1f1f1f",padding:"12px 16px"}}>
              <div style={{background:"#111", padding:12, borderRadius:12, border:"1px solid #222", marginBottom:16}}>
                  <div style={{fontSize:12, fontWeight:700, color:S.red, marginBottom:10}}>AJOUTER DU MATÉRIEL</div>
                  <select style={{...S.inp, marginBottom:8}} value={formI.sportId} onChange={e=>setFormI({...formI,sportId:e.target.value})}>
                     {SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras" && s.id!=="ultra").map(s=><option key={s.id} value={s.id}>{s.l}</option>)}
                  </select>
                  <input style={{...S.inp, marginBottom:8}} placeholder="Nom de l'équipement..." value={formI.name} onChange={e=>setFormI({...formI,name:e.target.value})}/>
                  <div style={{display:"flex", gap:10, marginBottom:8}}>
                     <div style={{flex:1}}><input type="number" style={S.inp} placeholder="Quantité..." value={formI.qty} onChange={e=>setFormI({...formI,qty:e.target.value})}/></div>
                     <div style={{flex:2}}><input style={S.inp} placeholder="État (optionnel)..." value={formI.desc} onChange={e=>setFormI({...formI,desc:e.target.value})}/></div>
                  </div>
                  <button onClick={()=>{
                     if(canEdit(user, formI.sportId, bureau)) addInv();
                     else alert("Vous n'êtes pas autorisé à modifier l'inventaire de ce sport.");
                  }} style={{background:S.red,color:"white",border:"none",padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",width:"100%"}}>Ajouter</button>
              </div>

              {SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras" && s.id!=="ultra").map(s => {
                 const items = inventory.filter(m => m.sportId === s.id);
                 if(items.length===0) return null;
                 const canEditInv = canEdit(user, s.id, bureau);
                 return (
                   <div key={s.id} style={{marginBottom:16}}>
                     <div style={{fontSize:12,color:"white",fontWeight:900,marginBottom:8,borderBottom:"1px solid #222",paddingBottom:4}}>{s.l}</div>
                     <div style={{display:"flex",flexDirection:"column",gap:6}}>
                       {items.map(m => (
                         <div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#1c1c1c",borderRadius:8,padding:"8px 12px"}}>
                           <div>
                              <div style={{fontSize:13,fontWeight:700}}>{m.qty}x {m.name}</div>
                              {m.desc && <div style={{fontSize:11,color:"#888"}}>{m.desc}</div>}
                           </div>
                           {canEditInv && <button onClick={()=>{if(confirm("Supprimer ?")) setInventory(arr=>arr.filter(x=>x.id!==m.id));}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12}}>🗑️</button>}
                         </div>
                       ))}
                     </div>
                   </div>
                 )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* MODAL SANTE DETAIL ET ZIBL&C */}
      {mod && (
        <div className="fade-in" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#080808",zIndex:200,overflowY:"auto"}}>
           <div style={{padding:"14px 18px",background:"#0c0c0c",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
             <button onClick={()=>setMod(null)} style={{background:"none",border:"none",color:S.red,cursor:"pointer",fontSize:16,fontWeight:800,fontFamily:"inherit",padding:"4px 8px"}}>← Retour</button>
           </div>
           <div style={{padding:20, maxWidth:800, margin:"0 auto"}}>
             <div style={{fontFamily:"'Barlow Condensed'",fontSize:36,fontWeight:900,color:S.red,lineHeight:1.1,marginBottom:24}}>{SANTE_DATA[mod].title}</div>
             
             {/* Special render pour Blessures */}
             {mod === "blessures" ? (
               <div style={{display:"flex", flexDirection:"column", gap:20}}>
                 <div style={{background:"#1a0808", border:"1px solid #DC262644", borderRadius:12, padding:16}}>
                    <div style={{fontSize:14, fontWeight:900, color:S.red, textTransform:"uppercase", marginBottom:10}}>🚨 Traitement Rapide</div>
                    <div style={{fontSize:13, color:"#ddd", marginBottom:12}}>En cas de blessure importante, venez voir le <strong>Zibl'&'C</strong> !</div>
                    {bureau.find(b=>b.role==="ziblec") ? (() => {
                       const zRole = bureau.find(b=>b.role==="ziblec");
                       const zUser = users.find(u=>u.id===zRole.userId);
                       return zUser ? (
                         <div style={{display:"flex", alignItems:"center", gap:12, background:"#111", padding:12, borderRadius:8, cursor:"pointer"}} onClick={()=>onViewProfile(zUser.id)}>
                           <Av src={zUser.avatar} name={dn(zUser)} size={40} />
                           <div style={{flex:1}}>
                              <div style={{fontSize:14, fontWeight:700}}>{dn(zUser)}</div>
                              <RenderTitles u={zUser} bureau={bureau} />
                           </div>
                           <a href={`tel:${zUser.phone}`} onClick={e=>e.stopPropagation()} style={{background:S.red, color:"white", textDecoration:"none", padding:"6px 12px", borderRadius:6, fontSize:12, fontWeight:700}}>Appeler</a>
                         </div>
                       ) : <div style={{fontSize:12, color:"#666"}}>Zibl'&'C non désigné.</div>;
                    })() : <div style={{fontSize:12, color:"#666"}}>Zibl'&'C non désigné.</div>}
                 </div>

                 <div style={{marginTop:4}}>
                    <div style={{fontSize:14, fontWeight:900, color:"#F59E0B", textTransform:"uppercase", marginBottom:10}}>🩹 Premiers soins classiques</div>
                    <div style={{background:"#111", padding:14, borderRadius:8, border:"1px solid #1a1a1a", fontSize:13, color:"#ccc", lineHeight:1.6}}>
                        Le <strong>Zibl'&'C</strong> dispose d'une trousse à pharmacie complète pour vous aider :<br/><br/>
                        • Prêt de <strong>béquilles</strong> et <strong>attelles</strong><br/>
                        • Désinfectant et pansements<br/>
                        • Réalisation de <strong>straps</strong> pour prévenir ou soulager<br/><br/>
                        N'hésitez pas à le solliciter !
                    </div>
                 </div>
                 
                 <div style={{fontSize:14, color:"#ccc", whiteSpace:"pre-wrap", lineHeight:1.6}}>
                    {SANTE_DATA[mod].content}
                 </div>

                 <div style={{marginTop:10}}>
                    <div style={{fontSize:14, fontWeight:900, color:"#4B9FFF", textTransform:"uppercase", marginBottom:10}}>🏥 Lieux de soins (Bordeaux / Talence)</div>
                    <div style={{display:"flex", flexDirection:"column", gap:10}}>
                      <div style={{background:"#111", padding:12, borderRadius:8, border:"1px solid #1a1a1a"}}>
                        <div style={{fontWeight:700, fontSize:14}}>Clinique Mutualiste de Pessac <span style={{color:"#4ade80", fontSize:11, marginLeft:6}}>(Proche ENSAM)</span></div>
                        <div style={{fontSize:12, color:"#888", marginTop:2}}>46 Av. du Dr Albert Schweitzer, 33600 Pessac</div>
                        <div style={{fontSize:13, color:"#4B9FFF", marginTop:6}}>📞 05 56 46 56 46</div>
                      </div>
                      <div style={{background:"#111", padding:12, borderRadius:8, border:"1px solid #1a1a1a"}}>
                        <div style={{fontWeight:700, fontSize:14}}>Urgences CHU Pellegrin</div>
                        <div style={{fontSize:12, color:"#888", marginTop:2}}>Place Amélie Raba Léon, 33000 Bordeaux</div>
                        <div style={{fontSize:13, color:"#4B9FFF", marginTop:6}}>📞 05 56 79 56 79</div>
                      </div>
                      <div style={{background:"#111", padding:12, borderRadius:8, border:"1px solid #1a1a1a"}}>
                        <div style={{fontWeight:700, fontSize:14}}>Clinique du Sport Bordeaux-Mérignac</div>
                        <div style={{fontSize:12, color:"#888", marginTop:2}}>2 Rue Georges Nègrevergne, 33700 Mérignac</div>
                        <div style={{fontSize:13, color:"#4B9FFF", marginTop:6}}>📞 05 57 20 68 00</div>
                      </div>
                      <div style={{background:"#111", padding:12, borderRadius:8, border:"1px solid #1a1a1a"}}>
                        <div style={{fontWeight:700, fontSize:14}}>SOS Médecins Bordeaux</div>
                        <div style={{fontSize:13, color:"#4B9FFF", marginTop:6}}>📞 3624</div>
                      </div>
                    </div>
                 </div>
               </div>
             ) : mod === "etirements" ? (
               <div style={{display:"flex", flexDirection:"column", gap:20}}>
                 <div style={{fontSize:15, color:"#ccc", lineHeight:1.8}}>
                   L'étirement est crucial, mais il faut choisir le bon moment pour la bonne méthode.
                 </div>
                 <div style={{background:"#111", padding:16, borderRadius:12, border:"1px solid #1a1a1a"}}>
                   <div style={{fontSize:18, marginBottom:8}}>🏃‍♂️ <strong style={{color:"white"}}>AVANT l'effort (Dynamique)</strong></div>
                   <div style={{fontSize:13, color:"#aaa", lineHeight:1.6}}>
                     Faites des mouvements fluides, sans temps de ressort, pour réveiller le muscle.<br/><br/>
                     • Balancements de jambes (avant/arrière, côté)<br/>
                     • Fentes marchées (sans rester bloqué en bas)<br/>
                     • Talons-fesses rapides
                   </div>
                 </div>
                 <div style={{background:"#111", padding:16, borderRadius:12, border:"1px solid #1a1a1a"}}>
                   <div style={{fontSize:18, marginBottom:8}}>🧘‍♂️ <strong style={{color:"white"}}>APRÈS l'effort (Statique)</strong></div>
                   <div style={{fontSize:13, color:"#aaa", lineHeight:1.6}}>
                     Maintenez la position 30 secondes en respirant profondément. Ne donnez jamais d'à-coups.<br/><br/>
                     • <strong>Quadriceps :</strong> Debout, ramenez le talon vers la fesse.<br/>
                     • <strong>Ischios :</strong> Jambes tendues, allez toucher vos pointes de pieds.<br/>
                     • <strong>Mollets :</strong> Pointe de pied contre un mur, avancez le bassin.
                   </div>
                 </div>
               </div>
             ) : (
               <div style={{fontSize:15,color:"#ddd",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{SANTE_DATA[mod].content}</div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}