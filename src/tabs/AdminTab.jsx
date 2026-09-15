import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { dn, BURS_ROLE_IDS, ROLES, SPORTS, S } from "../config";
import { SecTitle, Card, Lbl, Av, Tag, btnStyle } from "../components/Shared";

export default function AdminTab({users, setUsers, bureau, setBureau, feedbacks, setFeedbacks, locations, setLocations}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [searchAdmin, setSearchAdmin] = useState("");
  
  const [newLocName, setNewLocName] = useState("");
  const [newLocUrl, setNewLocUrl] = useState("");

  const adminList = users.filter(u => [u.nom, u.prenom, u.bucque, ...(Array.isArray(u.fams)?u.fams:[u.fams])].some(v=>String(v||"").toLowerCase().includes(searchAdmin.toLowerCase())));
  const u = users.find(x => x.id === Number(selectedUser));

  useEffect(() => {
    if (feedbacks.some(f => !f.isRead)) {
      setFeedbacks(p => p.map(f => ({...f, isRead: true})));
    }
  }, [feedbacks, setFeedbacks]);

  // 🎯 GESTION DES CAPITAINES EN LIGNE
  const toggleCap = async (sid) => {
    if(!u) return;
    const adminS = u.adminSports||[];
    const isC = adminS.includes(sid);
    const newSports = isC ? adminS.filter(x=>x!==sid) : [...adminS, sid];
    
    let userSports = u.sports || [];
    if (!isC && !userSports.includes(sid)) userSports = [...userSports, sid];
    
    try {
       const { error } = await supabase.from('users').update({ adminsports: newSports, sports: userSports }).eq('id', u.id);
       if (error) throw error;
       setUsers(p => p.map(x => x.id === u.id ? {...x, adminSports: newSports, sports: userSports} : x));
    } catch(e) { console.error(e); alert("Erreur lors de l'attribution du rôle."); }
  };

  // 🎯 GESTION DU BUREAU EN LIGNE
  const toggleBurs = async (roleId) => {
    if(!u) return;
    const hasRole = bureau.find(b => b.userId === u.id && b.role === roleId);

    try {
       if (hasRole) {
          const { error } = await supabase.from('bureau').delete().eq('id', hasRole.id);
          if (error) throw error;
          setBureau(p => p.filter(b => b.id !== hasRole.id));
       } else {
          const newId = Date.now();
          const { error } = await supabase.from('bureau').insert([{ id: newId, role: roleId, userid: u.id }]);
          if (error) throw error;
          setBureau(p => [...p, {id: newId, role: roleId, userId: u.id}]);
       }
    } catch(e) { console.error(e); alert("Erreur lors de l'attribution du rôle."); }
  };
  
  // 🎯 GESTION DES DÉVELOPPEURS EN LIGNE
  const toggleDev = async () => {
    if(!u) return;
    const newRole = u.role === "developer" ? "user" : "developer";
    try {
       const { error } = await supabase.from('users').update({ role: newRole }).eq('id', u.id);
       if (error) throw error;
       setUsers(p => p.map(x => x.id === u.id ? {...x, role: newRole} : x));
    } catch(e) { console.error(e); alert("Erreur lors de l'attribution du rôle."); }
  };

  // 📍 GESTION DES LIEUX SUPABASE
  const handleAddLocation = async () => {
    if(!newLocName || !newLocUrl) return alert("Remplissez le nom ET le lien du lieu.");
    try {
      const { error } = await supabase.from('locations').insert([{ name: newLocName.trim(), url: newLocUrl.trim() }]);
      if (error) throw error;
      setLocations(p => [...p, { name: newLocName.trim(), url: newLocUrl.trim() }]);
      setNewLocName(""); setNewLocUrl("");
    } catch(e) { console.error(e); alert("Erreur lors de l'ajout du lieu."); }
  };

  const handleDeleteLocation = async (name) => {
    if(confirm(`Supprimer définitivement "${name}" ?`)) {
      try {
        const { error } = await supabase.from('locations').delete().eq('name', name);
        if (error) throw error;
        setLocations(p => p.filter(l => l.name !== name));
      } catch(e) { console.error(e); alert("Erreur lors de la suppression."); }
    }
  };

  return (
    <div className="fade-in" style={{maxWidth: 800, margin:"0 auto", paddingBottom:20}}>
      <SecTitle title="Administration" sub="Gestion des Rôles, Lieux & Retours Utilisateurs" />
      <div style={{padding:"0 20px", display:"flex", flexDirection:"column", gap:16}}>
        
        {/* Espace Lieux */}
        <Card>
          <div style={{padding:16}}>
             <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>GESTION DES LIEUX (MAPS)</div>
             
             <div style={{display:"flex", flexDirection:"column", gap:10, marginBottom:16}}>
                {(!locations || locations.length === 0) ? <div style={{fontSize:12, color:"#555"}}>Aucun lieu enregistré.</div> : 
                  [...locations].sort((a,b)=>a.name.localeCompare(b.name)).map(loc => (
                    <div key={loc.name} style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"#111", padding:"8px 12px", borderRadius:8, border:"1px solid #1a1a1a"}}>
                       <div>
                          <div style={{fontSize:13, fontWeight:700, color:"white"}}>{loc.name}</div>
                          <div style={{fontSize:10, color:"#4B9FFF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200}}>{loc.url}</div>
                       </div>
                       <button onClick={()=>handleDeleteLocation(loc.name)} style={{background:"transparent", border:"none", color:"#EF4444", cursor:"pointer", fontSize:16}}>🗑️</button>
                    </div>
                  ))
                }
             </div>

             <div style={{borderTop:"1px solid #1f1f1f", paddingTop:14}}>
                <Lbl t="Ajouter un nouveau lieu" />
                <div style={{display:"grid", gridTemplateColumns:"1fr", gap:10, marginBottom:10}}>
                   <input style={S.inp} placeholder="Nom (Ex: Gymnase Rocquencourt)" value={newLocName} onChange={e=>setNewLocName(e.target.value)} />
                   <input style={S.inp} placeholder="Lien Google Maps / Waze" value={newLocUrl} onChange={e=>setNewLocUrl(e.target.value)} />
                </div>
                <button onClick={handleAddLocation} style={btnStyle()}>Ajouter le lieu</button>
             </div>
          </div>
        </Card>

        {/* Espace Rôles */}
        <Card>
          <div style={{padding:16}}>
             <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>GESTION DU BUREAU & RÔLES</div>
             <Lbl t="Sélectionner un utilisateur pour modifier ses rôles" />
             <input style={{...S.inp, marginBottom: 10}} placeholder="Chercher par nom, bucque, fam's..." value={searchAdmin} onChange={e=>setSearchAdmin(e.target.value)} />
             <select style={{...S.inp, marginBottom: u ? 20 : 0}} value={selectedUser} onChange={e=>setSelectedUser(e.target.value)}>
                <option value="">-- Choisir --</option>
                {adminList.map(x=><option key={x.id} value={x.id}>{dn(x)} ({x.prenom} {x.nom})</option>)}
             </select>

             {u && (
               <div className="fade-in" style={{borderTop:"1px solid #1f1f1f", paddingTop: 16}}>
                 <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom:20}}>
                   <Av src={u.avatar} name={dn(u)} size={40} />
                   <div>
                     <div style={{fontWeight:700}}>{dn(u)}</div>
                     <div style={{fontSize:11, color:"#666"}}>{u.email}</div>
                   </div>
                 </div>

                 <Lbl t="K'Pi'T'N" />
                 <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:20}}>
                   {SPORTS.filter(s=>s.id!=="general" && s.id!=="tuverras" && s.id!=="muscu").map(s => {
                     const isC = (u.adminSports||[]).includes(s.id);
                     return <button key={s.id} onClick={()=>toggleCap(s.id)} style={{padding:"6px 10px", borderRadius:16, background:isC?S.darkGreen:"#111", border:`1px solid ${isC?S.darkGreen:"#222"}`, color:isC?"white":"#666", cursor:"pointer", fontSize:11, fontWeight:700}}>Zi{s.l}</button>
                   })}
                 </div>

                 <Lbl t="Autres Rôles" />
                 <div style={{display:"flex", gap:10, marginBottom:20, flexWrap:"wrap"}}>
                    <button onClick={toggleDev} style={{padding:"8px 12px", borderRadius:8, background:u.role==="developer"?"#7c3aed":"#111", color:u.role==="developer"?"white":"#888", border:`1px solid ${u.role==="developer"?"#7c3aed":"#333"}`, cursor:"pointer", fontSize:12, fontWeight:700}}>⚙️ Développeur</button>
                    {ROLES.filter(r => !BURS_ROLE_IDS.includes(r.id)).map(r => {
                       const hasR = bureau.some(b => b.userId === u.id && b.role === r.id);
                       const bgC = r.id === 'ziblec' ? S.red : S.blue;
                       return <button key={r.id} onClick={()=>toggleBurs(r.id)} style={{padding:"8px 12px", borderRadius:8, background:hasR?bgC:"#111", color:hasR?"white":"#888", border:`1px solid ${hasR?bgC:"#333"}`, cursor:"pointer", fontSize:12, fontWeight:700}}>{r.label}</button>
                    })}
                 </div>

                 <Lbl t="Le Bur's" />
                 <div style={{display:"flex", gap:10, marginBottom:20, flexWrap:"wrap"}}>
                    {ROLES.filter(r => BURS_ROLE_IDS.includes(r.id)).map(r => {
                       const hasR = bureau.some(b => b.userId === u.id && b.role === r.id);
                       const bgC = S.blue;
                       return <button key={r.id} onClick={()=>toggleBurs(r.id)} style={{padding:"8px 12px", borderRadius:8, background:hasR?bgC:"#111", color:hasR?"white":"#888", border:`1px solid ${hasR?bgC:"#333"}`, cursor:"pointer", fontSize:12, fontWeight:700}}>{r.label}</button>
                    })}
                 </div>
               </div>
             )}
          </div>
        </Card>

        {/* Espace Feedback */}
        <Card>
          <div style={{padding:16}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:14}}>FEEDBACKS UTILISATEURS</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {feedbacks.length === 0 ? <div style={{fontSize:12, color:"#555"}}>Aucun feedback pour le moment.</div> :
                [...feedbacks].sort((a,b)=>new Date(b.date) - new Date(a.date)).map(fb => (
                  <div key={fb.id} style={{background:"#111", padding:12, borderRadius:8, border:"1px solid #1a1a1a"}}>
                     <div style={{display:"flex", justifyContent:"space-between", marginBottom:6, alignItems:"center"}}>
                       <span style={{fontSize:13, fontWeight:700, color:S.red}}>{fb.userName}</span>
                       <span style={{fontSize:10, color:"#666"}}>{new Date(fb.date).toLocaleDateString("fr-FR")} à {new Date(fb.date).toLocaleTimeString("fr-FR", {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                     <div style={{fontSize:13, color:"#ccc", lineHeight:1.5, whiteSpace:"pre-wrap"}}>{fb.text}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}