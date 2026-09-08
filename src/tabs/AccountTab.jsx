import { useState, useRef } from "react";
import { supabase } from "../supabase"; // 🔌 Notre pont Supabase pour sauvegarder en ligne
import { parseFams, readFile, ini, dn, S, btnStyle, SPORTS, PROMS, maxPromo } from "../config";
import { SecTitle, SubNav, Card, Lbl, FamsSelect } from "../components/Shared";

export default function AccountTab({user, setCurrentUser, users, setUsers, feedbacks, setFeedbacks}) {
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [fbText, setFbText] = useState("");
  const [form, setForm] = useState({nom:user.nom||"",prenom:user.prenom||"",bucque:user.bucque||"",fams:parseFams(user.fams),proms:user.proms||"225",phone:user.phone||"",bio:user.bio||"",sexe:user.sexe||"Homme",sports:[...(user.sports||[])],bannedSports:[...(user.bannedSports||[])], licenceNum:user.licenceNum||""});
  
  const fileRef = useRef(null);
  const licenceRef = useRef(null);
  
  const up = (k,v) => setForm(p=>({...p,[k]:v}));
  
  // 🚀 SAUVEGARDE DU PROFIL EN LIGNE
  const save = async () => { 
    try {
      const updated = {...user,...form}; 
      const { error } = await supabase.from('users').update({
        nom: form.nom, prenom: form.prenom, bucque: form.bucque,
        fams: form.fams, proms: form.proms, phone: form.phone,
        bio: form.bio, sexe: form.sexe, licencenum: form.licenceNum
      }).eq('id', user.id);

      if (error) throw error;

      setUsers(p=>p.map(u=>u.id===user.id?updated:u)); 
      setCurrentUser(updated); 
      setEditing(false); 
      alert("Modifications enregistrées !"); 
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur.");
    }
  };

  // 🚀 UPLOAD DE L'AVATAR EN LIGNE
  const handleFile = e => { 
    const f=e.target.files[0]; 
    if(!f)return; 
    readFile(f, async data => {
      try {
        const { error } = await supabase.from('users').update({ avatar: data }).eq('id', user.id);
        if (error) throw error;

        const u={...user,avatar:data};
        setUsers(p=>p.map(x=>x.id===user.id?u:x));
        setCurrentUser(u);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'envoi de l'image.");
      }
    }); 
  };

  // 🚀 UPLOAD DE LA LICENCE EN LIGNE
  const handleLicenceFile = e => { 
     const f=e.target.files[0]; 
     if(!f)return; 
     readFile(f, async data => {
        try {
          const { error } = await supabase.from('users').update({ licencefile: data, licence: true }).eq('id', user.id);
          if (error) throw error;

          const u = {...user, licenceFile: data, licence: true};
          setUsers(p => p.map(x => x.id===user.id ? u : x));
          setCurrentUser(u);
          alert("Licence uploadée avec succès !");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de l'envoi du document.");
        }
     }); 
  };

  // 🚀 SAUVEGARDE DES SPORTS JOUÉS EN LIGNE
  const togglePlay = async (sid) => {
    try {
      const isPlayed = user.sports?.includes(sid);
      const newSports = isPlayed ? user.sports.filter(x=>x!==sid) : [...(user.sports||[]), sid];
      const newBanned = (user.bannedSports||[]).filter(x=>x!==sid);
      
      const { error } = await supabase.from('users').update({ sports: newSports, bannedsports: newBanned }).eq('id', user.id);
      if (error) throw error;

      const u = {...user, sports: newSports, bannedSports: newBanned};
      setUsers(p => p.map(x => x.id===u.id ? u : x)); setCurrentUser(u);
    } catch (err) { console.error(err); alert("Erreur serveur."); }
  };

  // 🚀 SAUVEGARDE DES SPORTS BANNIS EN LIGNE
  const toggleBan = async (sid) => {
    try {
      const isBanned = user.bannedSports?.includes(sid);
      const newBanned = isBanned ? user.bannedSports.filter(x=>x!==sid) : [...(user.bannedSports||[]), sid];
      const newSports = (user.sports||[]).filter(x=>x!==sid);
      
      const { error } = await supabase.from('users').update({ sports: newSports, bannedsports: newBanned }).eq('id', user.id);
      if (error) throw error;

      const u = {...user, sports: newSports, bannedSports: newBanned};
      setUsers(p => p.map(x => x.id===u.id ? u : x)); setCurrentUser(u);
    } catch (err) { console.error(err); alert("Erreur serveur."); }
  };

  const handleSendFeedback = () => {
    if (!fbText.trim()) return;
    setFeedbacks(p => [{ id: Date.now(), userId: user.id, userName: dn(user), text: fbText.trim(), date: new Date().toISOString(), isRead: false }, ...p]);
    setFbText("");
    alert("Merci ! Votre feedback a bien été envoyé à l'équipe de développement.");
  };

  return (
    <div className="fade-in" style={{maxWidth: 800, margin:"0 auto", paddingBottom:20}}>
      <SecTitle title="Mon Compte"/>
      <SubNav tabs={[["profile","Profil"],["sports","Sports"],["licence","Licence"],["settings","Réglages"]]} active={tab} onChange={setTab}/>

      {tab==="profile"&&(
        <div className="fade-in" style={{padding:"0 20px"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,gap:14}}>
            <div style={{position:"relative"}}>
              <div onClick={()=>fileRef.current?.click()} style={{width:90,height:90,borderRadius:"50%",background:user.avatar?"transparent":S.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,overflow:"hidden",border:`3px solid ${S.redBorder}`,cursor:"pointer"}}>
                {user.avatar?<img src={user.avatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:ini(dn(user))}
              </div>
              <div onClick={()=>fileRef.current?.click()} style={{position:"absolute", bottom:0, right:0, background:S.red, color:"white", width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #080808", fontSize:18, fontWeight:900}}>+</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:28,fontWeight:900,lineHeight:1}}>{user.bucque||dn(user)}</div>
              <div style={{fontSize:13,color:"#666",marginTop:2}}>{user.prenom} {user.nom}</div>
            </div>
          </div>
          {!editing?(
            <div>
              <Card style={{marginBottom:14}}>
                <div style={{padding:"4px 16px"}}>
                  {[["Bucque",user.bucque||"--"],["Nom complet",`${user.prenom} ${user.nom}`],["Fam's",parseFams(user.fams).join('-')||"--"],["Prom's",user.proms],["Sexe",user.sexe||"--"],["Téléphone",user.phone||"Non renseigné"],["Email",user.email],["À Propos",user.bio||"Rien à déclarer..."]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid #1a1a1a"}}>
                      <span style={{fontSize:12,color:"#555",flexShrink:0,minWidth:90}}>{l}</span><span style={{fontSize:12,color:"white",textAlign:"right",maxWidth:"60%",wordBreak:"break-word"}}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <button onClick={()=>setEditing(true)} style={{...btnStyle("#1c1c1c","white"),border:"1px solid #2a2a2a", marginBottom:14}}>Modifier mon profil</button>
              <button onClick={()=>{setCurrentUser(null); localStorage.removeItem("uai_user");}} style={{...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Se déconnecter</button>
            </div>
          ):(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><Lbl t="Nom"/><input style={S.inp} value={form.nom} onChange={e=>up("nom",e.target.value)}/></div><div><Lbl t="Prénom"/><input style={S.inp} value={form.prenom} onChange={e=>up("prenom",e.target.value)}/></div></div>
              <Lbl t="Bucque"/><input style={{...S.inp,marginBottom:10}} value={form.bucque} onChange={e=>up("bucque",e.target.value)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                <div><Lbl t="Sexe"/><select style={S.inp} value={form.sexe} onChange={e=>up("sexe",e.target.value)}><option value="Homme">Homme</option><option value="Femme">Femme</option></select></div>
                <div><Lbl t="Prom's"/><select style={S.inp} value={form.proms} onChange={e=>up("proms",e.target.value)}>{PROMS.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div style={{display:"flex", gap:10, alignItems:"flex-start", marginBottom:10}}>
                 <div style={{flex:1}}><Lbl t="Fam's"/><FamsSelect value={form.fams} onChange={v=>up("fams",v)} /></div>
                 <div style={{flex:1}}><Lbl t="Téléphone"/><input style={S.inp} value={form.phone} onChange={e=>up("phone",e.target.value)}/></div>
              </div>
              <Lbl t="À propos de moi (Bio)"/><textarea rows={3} style={{...S.inp,marginBottom:16,resize:"none"}} value={form.bio} onChange={e=>up("bio",e.target.value)}/>
              <div style={{display:"flex",gap:10}}><button onClick={()=>setEditing(false)} style={{flex:1,...btnStyle("#1c1c1c","#888"),border:"1px solid #2a2a2a"}}>Annuler</button><button onClick={save} style={{flex:2,...btnStyle()}}>Enregistrer</button></div>
            </div>
          )}
        </div>
      )}

      {tab==="sports"&&(
        <div className="fade-in" style={{padding:"0 20px"}}>
          <div style={{fontSize:13,color:"#555",marginBottom:14,lineHeight:1.6}}>Définissez les sports que vous pratiquez, ou ceux que vous souhaitez <strong style={{color:"#EF4444"}}>masquer</strong> du planning. <br/><span style={{fontSize:11}}>(Sauvegarde automatique)</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras").map(s=>{
              const isPlayed = (user.sports||[]).includes(s.id);
              const isBanned = (user.bannedSports||[]).includes(s.id);
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px",borderRadius:10,background:"#141414",border:`1px solid ${isPlayed?S.red:isBanned?"#EF4444":"#1e1e1e"}`}}>
                  <div style={{flex:1,fontSize:13,fontWeight:700,color:isBanned?"#555":isPlayed?S.red:"#ccc"}}>{s.l}</div>
                  <button onClick={()=>togglePlay(s.id)} style={{padding:"6px 10px",borderRadius:6,border:"none",background:isPlayed?S.red:"#222",color:"white",fontSize:11,cursor:"pointer",fontWeight:700}}>Joueur</button>
                  <button onClick={()=>toggleBan(s.id)} style={{padding:"6px 10px",borderRadius:6,border:"none",background:isBanned?"#EF4444":"#222",color:"white",fontSize:11,cursor:"pointer",fontWeight:700}}>🚫 Bannir</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="licence"&&(
        <div className="fade-in" style={{padding:"0 20px"}}>
          <Card>
             <div style={{padding:16}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:900,color:S.red,marginBottom:16}}>MA LICENCE SPORTIVE</div>
                
                {user.licenceFile ? (
                  <div className="fade-in">
                     <div style={{color:"#4ade80", fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8}}>
                       ✅ Document uploadé et valide !
                     </div>
                     <img src={user.licenceFile} style={{width:"100%", borderRadius:8, border:"1px solid #333", marginBottom:14}} alt="Licence" />
                     <button onClick={async ()=>{
                        if(confirm("Voulez-vous vraiment supprimer votre licence ?")) {
                           try {
                             // 🚀 SUPPRESSION DE LA LICENCE EN LIGNE
                             const { error } = await supabase.from('users').update({ licencefile: null, licence: false }).eq('id', user.id);
                             if (error) throw error;

                             const u = {...user, licenceFile:null, licence:false};
                             setUsers(p=>p.map(x=>x.id===u.id?u:x)); setCurrentUser(u);
                           } catch (err) { console.error(err); alert("Erreur lors de la suppression."); }
                        }
                     }} style={{...btnStyle("#1a0505","#EF4444"), border:`1px solid ${S.redBorder}`}}>Supprimer le document</button>
                  </div>
                ) : (
                  <div className="fade-in">
                     <div style={{background:"#111", padding:14, borderRadius:8, border:"1px solid #1a1a1a", fontSize:13, color:"#ccc", lineHeight:1.6, marginBottom:20}}>
                        <strong style={{color:"white", fontSize:14}}>Comment obtenir une licence ?</strong><br/><br/>
                        1. Rendez-vous sur le site de la <strong>FFSU (Sport U)</strong>.<br/>
                        2. Créez votre compte et payez la cotisation annuelle (environ 30€).<br/>
                        3. Téléchargez l'attestation au format Image ou prenez-la en photo.<br/>
                        <span style={{color:"#888", fontSize:11, display:"block", marginTop:8}}>(Le texte final des explications sera ajouté plus tard par le bureau).</span>
                     </div>
                     
                     <Lbl t="Numéro de licence (Optionnel)" />
                     <div style={{display:"flex", gap:10, marginBottom:16}}>
                       <input style={{...S.inp, flex:1, marginBottom:0}} placeholder="Ex: 2026-ENSAM-XXXX" value={form.licenceNum||""} onChange={e=>up("licenceNum",e.target.value)} />
                       <button onClick={save} style={{background:S.red, color:"white", border:"none", borderRadius:10, padding:"0 16px", cursor:"pointer", fontWeight:700}}>✔</button>
                     </div>

                     <Lbl t="Photo ou Scan de la licence *" />
                     <input ref={licenceRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleLicenceFile} />
                     <button onClick={()=>licenceRef.current?.click()} style={btnStyle()}>Uploader le document</button>
                  </div>
                )}
             </div>
          </Card>
        </div>
      )}

      {tab==="settings"&&(
        <div className="fade-in" style={{padding:"0 20px"}}>
          <Card style={{marginBottom:14}}>
            <div style={{padding:"16px"}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>NOTIFICATIONS</div>
              <div style={{display:"flex", flexDirection:"column", gap:12}}>
                 <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#ccc", cursor:"pointer"}}><input type="checkbox" defaultChecked style={{accentColor:S.red}} /> 🔔 Accepter toutes les notifications</label>
                 <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#999", cursor:"pointer"}}><input type="checkbox" defaultChecked style={{accentColor:S.red}} /> Rappels de matchs</label>
                 <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#999", cursor:"pointer"}}><input type="checkbox" defaultChecked style={{accentColor:S.red}} /> Résultats des matchs</label>
                 <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#999", cursor:"pointer"}}><input type="checkbox" defaultChecked style={{accentColor:S.red}} /> Nouvelles actus</label>
                 <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#999", cursor:"pointer"}}><input type="checkbox" defaultChecked style={{accentColor:S.red}} /> Messages de groupes</label>
              </div>
            </div>
          </Card>

          <Card style={{marginBottom:14}}>
            <div style={{padding:"16px"}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>NOUS AIDER (FEEDBACK)</div>
              <div style={{fontSize:13,color:"#aaa",marginBottom:12,lineHeight:1.6}}>Laissez-nous vos suggestions ou signalez un bug. L'équipe dev vous remercie ! ❤️</div>
              <textarea rows={4} style={{...S.inp, resize:"none", marginBottom:12}} placeholder="Votre message..." value={fbText} onChange={e=>setFbText(e.target.value)} />
              <button onClick={handleSendFeedback} style={{...btnStyle("#1c1c1c","white"),border:"1px solid #333"}}>Envoyer</button>
            </div>
          </Card>

          <Card style={{marginBottom:14}}>
            <div style={{padding:"16px"}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>CHANGER MON MOT DE PASSE</div>
              <Lbl t="Nouveau mot de passe" />
              <input type="password" style={{...S.inp, marginBottom:14}} value={newPwd} onChange={e=>setNewPwd(e.target.value)} />
              <button onClick={async () => {
                if(newPwd) {
                  try {
                    // 🚀 SAUVEGARDE DU MOT DE PASSE EN LIGNE
                    const { error } = await supabase.from('users').update({ password: newPwd }).eq('id', user.id);
                    if (error) throw error;
                    
                    const u = {...user, password: newPwd};
                    setUsers(p => p.map(x => x.id===user.id ? u : x));
                    setCurrentUser(u); alert("Mot de passe modifié avec succès !"); setNewPwd("");
                  } catch (err) { console.error(err); alert("Erreur serveur."); }
                }
              }} style={{...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`,marginBottom:8}}>Mettre à jour le mot de passe</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}