import { useState } from "react";
import { S, btnStyle, FAMS_OPTIONS, ini, dn, handleComment, isDev, BURS_ROLE_IDS, ROLES, ziLabel, Sp, fmtDate } from "../config";

export const Card = ({children, style={}, onClick}) => <div onClick={onClick} style={{background:S.card,borderRadius:16,border:`1px solid ${S.cardBorder}`,overflow:"hidden",cursor:onClick?"pointer":"default",height:"100%",...style}}>{children}</div>;
export const Lbl = ({t}) => <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:2,marginBottom:5}}>{t}</div>;
export const Tag = ({label, color="#DC2626", small=false, customStyle={}}) => <span style={{fontSize:small?9:10,background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:6,padding:small?"1px 6px":"2px 8px",fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",whiteSpace:"nowrap", ...customStyle}}>{label}</span>;

export const SecTitle = ({title, sub, action}) => (
  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"20px 20px 14px"}}>
    <div><div style={{fontFamily:"'Barlow Condensed'",fontSize:28,fontWeight:900,color:"white",textTransform:"uppercase",lineHeight:1}}>{title}</div>{sub && <div style={{fontSize:11,color:"#555",marginTop:3}}>{sub}</div>}</div>
    {action}
  </div>
);

export const AddBtn = ({label, onClick}) => <button onClick={onClick} style={{background:S.red,color:"white",border:"none",borderRadius:9,padding:"8px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed'",letterSpacing:1}}>{label}</button>;

export const SubNav = ({tabs, active, onChange}) => (
  <div style={{display:"flex",background:"#111",borderRadius:12,padding:4,margin:"0 20px 16px"}}>
    {tabs.map(([k,l]) => <button key={k} onClick={() => onChange(k)} style={{flex:1,padding:"8px 0",background:active===k?S.red:"transparent",color:active===k?"white":"#444",border:"none",borderRadius:9,cursor:"pointer",fontSize:10,fontWeight:800,fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1.2}}>{l}</button>)}
  </div>
);

export const Av = ({src, name, size=36, color="#DC2626", onClick}) => (
  <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:src?"transparent":color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:800,overflow:"hidden",flexShrink:0,border:`2px solid ${color}33`,cursor:onClick?"pointer":"default"}}>
    {src ? <img src={src} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" /> : ini(name)}
  </div>
);

export function FamsSelect({ value=[], onChange }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const toggle = (v) => {
     let nv = value.includes(v) ? value.filter(x=>x!==v) : [...value, v];
     nv.sort((a,b) => {
        const val = x => parseInt(x) + (String(x).includes('bis') ? 0.5 : 0);
        return val(a) - val(b);
     });
     onChange(nv);
  };
  const filtered = FAMS_OPTIONS.filter(o => o.includes(q));

  return (
    <div style={{position:"relative", flex:1}}>
      <div onClick={()=>setOpen(!open)} style={{...S.inp, padding: "9px 14px", minHeight: 40, display:"flex", flexWrap:"wrap", gap:4, cursor:"pointer", alignItems:"center"}}>
         {value.length===0 && <span style={{color:"#888"}}>Choisir Fam's...</span>}
         {value.map(v => <span key={v} style={{background:S.red, color:"white", padding:"2px 6px", borderRadius:4, fontSize:12, whiteSpace:"nowrap"}}>{v}</span>)}
      </div>
      {open && (
        <div style={{position:"absolute", top:"100%", left:0, right:0, background:"#111", border:`1px solid ${S.redBorder}`, zIndex:100, borderRadius:8, marginTop:4, padding:10, boxShadow:"0 5px 15px rgba(0,0,0,0.5)"}}>
           <input style={{...S.inp, marginBottom:10, padding:"6px 10px"}} placeholder="Rechercher (ex: 91)..." value={q} onChange={e=>setQ(e.target.value)} onClick={e=>e.stopPropagation()} />
           <div style={{display:"flex", flexWrap:"wrap", gap:6, maxHeight: 150, overflowY:"auto"}} className="no-scrollbar">
             {filtered.map(o => {
                const on = value.includes(o);
                return <button key={o} onClick={(e)=>{e.preventDefault(); toggle(o);}} style={{padding:"4px 8px", background:on?S.red:"#222", border:"none", borderRadius:4, color:"white", cursor:"pointer", fontSize:12, fontWeight:700}}>{o}</button>
             })}
           </div>
           <button onClick={(e)=>{e.preventDefault();setOpen(false);}} style={{...btnStyle("#1a1a1a","white"), padding:"6px 0", marginTop:10, border:"1px solid #333"}}>OK</button>
        </div>
      )}
    </div>
  )
}

export function MembersSelect({ value=[], onChange, users, currentUser }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const toggle = (uid) => {
     const nv = value.includes(uid) ? value.filter(x=>x!==uid) : [...value, uid];
     onChange(nv);
  };
  const filtered = users.filter(u => u.id !== currentUser.id && (dn(u).toLowerCase().includes(q.toLowerCase()) || (u.nom+" "+u.prenom).toLowerCase().includes(q.toLowerCase())));

  return (
    <div style={{position:"relative", flex:1, marginBottom:10}}>
      <div onClick={()=>setOpen(!open)} style={{...S.inp, minHeight: 42, display:"flex", flexWrap:"wrap", gap:4, cursor:"pointer"}}>
         {value.length===0 && <span style={{color:"#888"}}>Ajouter des membres...</span>}
         {value.map(uid => {
            const u = users.find(x=>x.id===uid);
            return u ? <span key={uid} style={{background:S.red, color:"white", padding:"2px 6px", borderRadius:4, fontSize:12}}>{dn(u)}</span> : null;
         })}
      </div>
      {open && (
        <div style={{position:"absolute", top:"100%", left:0, right:0, background:"#111", border:`1px solid ${S.redBorder}`, zIndex:100, borderRadius:8, marginTop:4, padding:10, boxShadow:"0 5px 15px rgba(0,0,0,0.5)"}}>
           <input style={{...S.inp, marginBottom:10, padding:"6px 10px"}} placeholder="Rechercher nom, bucque..." value={q} onChange={e=>setQ(e.target.value)} onClick={e=>e.stopPropagation()} />
           <div style={{display:"flex", flexWrap:"wrap", gap:6, maxHeight: 150, overflowY:"auto"}} className="no-scrollbar">
             {filtered.map(u => {
                const on = value.includes(u.id);
                return <button key={u.id} onClick={(e)=>{e.preventDefault(); toggle(u.id);}} style={{padding:"4px 8px", background:on?S.red:"#222", border:"none", borderRadius:4, color:"white", cursor:"pointer", fontSize:12, fontWeight:700}}>{dn(u)}</button>
             })}
           </div>
           <button onClick={(e)=>{e.preventDefault();setOpen(false);}} style={{...btnStyle("#1a1a1a","white"), padding:"6px 0", marginTop:10, border:"1px solid #333"}}>OK</button>
        </div>
      )}
    </div>
  )
}

export function LocationSelect({ value, onChange, locations, setLocations }) {
  return (
    <select style={{...S.inp, marginBottom:12}} value={value} onChange={e => {
      if (e.target.value === "__NEW__") {
        const n = prompt("Nouveau lieu :");
        if (n && n.trim() !== "") { setLocations(p => [...new Set([...p, n.trim()])]); onChange(n.trim()); }
      } else onChange(e.target.value);
    }}>
      <option value="">Sélectionner un lieu...</option>
      {locations.sort((a,b)=>a.localeCompare(b,"fr")).map(l => <option key={l} value={l}>{l}</option>)}
      <option value="__NEW__">➕ Nouveau lieu...</option>
    </select>
  );
}

export function LocationLink({ location }) {
  if (!location) return null;
  const url = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(location)}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{color:"#4B9FFF", textDecoration:"underline"}} onClick={e => e.stopPropagation()}>
      {location}
    </a>
  );
}

export function Comments({itemId, comments=[], setList, user}) {
  const [txt, setTxt] = useState("");
  const add = () => { handleComment(itemId, txt, setList, user); setTxt(""); };
  return (
    <div style={{borderTop:"1px solid #1a1a1a",padding:"14px 16px", background:"#0c0c0c"}}>
      <div style={{fontSize:10,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>COMMENTAIRES - {comments.length}</div>
      {comments.map(c => (
        <div key={c.id} style={{marginBottom:12,display:"flex",gap:10}}>
          <Av name={c.userName} size={30} color={S.red} />
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,marginBottom:3,alignItems:"center"}}><span style={{fontSize:12,fontWeight:700}}>{c.userName}</span><span style={{fontSize:10,color:"#333"}}>{new Date(c.time).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span></div>
            <div style={{fontSize:13,color:"#aaa",lineHeight:1.6,marginBottom:6}}>{c.text}</div>
          </div>
        </div>
      ))}
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <input style={{...S.inp,flex:1,padding:"9px 12px",fontSize:13}} placeholder="Commenter..." value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} />
        <button onClick={add} style={{background:S.red, color:"white", border:"none", borderRadius:10, padding:"9px 14px", cursor:"pointer", fontSize:13, fontWeight:700, flexShrink:0}}>Envoyer</button>
      </div>
    </div>
  );
}

export const RenderTitles = ({u, bureau}) => {
  if(!u) return null;
  const isD = isDev(u);
  const userBursRoles = bureau.filter(b=>b.userId===u.id);
  const bursLabels = userBursRoles.filter(b=>BURS_ROLE_IDS.includes(b.role)).map(b => ROLES.find(r=>r.id===b.role)?.label).filter(Boolean);
  const hasZiblec = userBursRoles.some(b=>b.role==="ziblec");
  const caps = (u.adminSports||[]).filter(sid=>sid!=="muscu" && sid!=="tuverras");

  return (
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:3, alignItems:"center"}}>
      {isD && <Tag label="Développeur" customStyle={{background:"#7c3aed", color:"white", border:"none", boxShadow:"0 0 10px #a855f7"}}/>}
      {bursLabels.map((l,i) => <Tag key={"b_"+i} label={l} customStyle={{background:S.blue, color:"white", border:"none"}}/>)}
      {hasZiblec && <Tag label="Zibl'&'C" customStyle={{background:S.red, color:"white", border:"none"}}/>}
      {caps.map(sid => <Tag key={"cap_"+sid} label={ziLabel(sid)} customStyle={{background:S.darkGreen, color:"white", border:"none"}}/>)}
    </div>
  );
};

export function UserProfileModal({ uid, users, bureau, onClose }) {
  const u = users.find(x => x.id === uid);
  if (!u) return null;

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000000dd",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(3px)"}} onClick={onClose}>
      <div className="fade-in" style={{background:S.card, width:"100%", maxWidth:400, borderRadius:16, border:`1px solid ${S.cardBorder}`, padding:24, position:"relative",boxShadow:"0 10px 30px rgba(0,0,0,0.5)", maxHeight:"90vh", overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"#111",border:`1px solid ${S.cardBorder}`,color:"#888",fontSize:16,width:32,height:32,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginBottom:24}}>
          <Av src={u.avatar} name={dn(u)} size={90} />
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:28,fontWeight:900,color:S.red}}>{u.bucque || dn(u)}</div>
            <div style={{fontSize:14,color:"#aaa",marginTop:2}}>{u.prenom} {u.nom}</div>
            <div style={{fontSize:12,color:"#666",marginTop:4,letterSpacing:1}}>Bo {u.proms} • Fam's {Array.isArray(u.fams)?u.fams.join('-'):(u.fams||"--")}</div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"#111",padding:14,borderRadius:12,border:"1px solid #1a1a1a"}}>
            <Lbl t="À propos"/>
            <div style={{fontSize:14,color:"#ccc",lineHeight:1.6}}>{u.bio || "Aucune description..."}</div>
          </div>
          <div style={{background:"#111",padding:14,borderRadius:12,border:"1px solid #1a1a1a"}}>
            <Lbl t="Sports Pratiqués & Rôles"/>
            <RenderTitles u={u} bureau={bureau} />
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
              {u.sports?.length ? u.sports.map(sid => <span key={"sp_"+sid} style={{fontSize:13,color:"#aaa"}}>{Sp[sid]?.l || sid}</span>) : null}
            </div>
          </div>
          <div style={{background:"#111",padding:14,borderRadius:12,border:"1px solid #1a1a1a"}}>
            <Lbl t="Contact"/>
            <div style={{fontSize:15,color:"white",marginBottom:8,fontWeight:500}}>📞 <a href={`tel:${u.phone}`} style={{color:"white",textDecoration:"none"}}>{u.phone || "Non renseigné"}</a></div>
            <div style={{fontSize:15,color:"white",fontWeight:500}}>✉️ <a href={`mailto:${u.email}`} style={{color:"white",textDecoration:"none"}}>{u.email}</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}