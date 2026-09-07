import { useState, useEffect } from "react";
import { dn, BURS_ROLE_IDS, ROLES, SPORTS, S } from "../config";
import { SecTitle, Card, Lbl, Av, Tag } from "../components/Shared";

export default function AdminTab({users, setUsers, bureau, setBureau, feedbacks, setFeedbacks}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [searchAdmin, setSearchAdmin] = useState("");

  const adminList = users.filter(u => [u.nom, u.prenom, u.bucque, ...(Array.isArray(u.fams)?u.fams:[u.fams])].some(v=>String(v||"").toLowerCase().includes(searchAdmin.toLowerCase())));
  const u = users.find(x => x.id === Number(selectedUser));

  useEffect(() => {
    if (feedbacks.some(f => !f.isRead)) {
      setFeedbacks(p => p.map(f => ({...f, isRead: true})));
    }
  }, [feedbacks, setFeedbacks]);

  // 🎯 GESTION DES CAPITAINES : Ajoute automatiquement au sport !
  const toggleCap = (sid) => {
    if(!u) return;
    const adminS = u.adminSports||[];
    const isC = adminS.includes(sid);
    const newSports = isC ? adminS.filter(x=>x!==sid) : [...adminS, sid];
    
    let userSports = u.sports || [];
    if (!isC && !userSports.includes(sid)) userSports = [...userSports, sid];
    
    setUsers(p => p.map(x => x.id === u.id ? {...x, adminSports: newSports, sports: userSports} : x));
  };

  const toggleBurs = (roleId) => {
    if(!u) return;
    setBureau(p => {
       const hasRole = p.some(b => b.userId === u.id && b.role === roleId);
       if(hasRole) return p.filter(b => !(b.userId === u.id && b.role === roleId));
       else return [...p, {id:Date.now(), role:roleId, userId: u.id}]; 
    });
  };
  const toggleDev = () => {
    if(!u) return;
    setUsers(p => p.map(x => x.id === u.id ? {...x, role: x.role==="developer"?"user":"developer"} : x));
  };

  return (
    <div className="fade-in" style={{maxWidth: 800, margin:"0 auto", paddingBottom:20}}>
      <SecTitle title="Administration" sub="Gestion des Rôles & Retours Utilisateurs" />
      <div style={{padding:"0 20px", display:"flex", flexDirection:"column", gap:16}}>
        
        <Card>
          <div style={{padding:16}}>
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
                     {/* 🎨 BOUTON CAPITAINE : Blanc sur Vert quand activé */}
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