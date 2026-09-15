import { useState, useRef } from "react";
import { supabase } from "../supabase";
import { isDev, isBurs, readFile, dn, fmtDate, S, btnStyle, SPORTS, Sp } from "../config";
import { SecTitle, AddBtn, Card, Tag, Lbl, Av } from "../components/Shared";

// 💬 Composant local de commentaires pour les News (lié à Supabase)
function NewsComments({ item, setNews, user }) {
  const [txt, setTxt] = useState("");
  const comments = item.comments || [];

  const add = async () => {
    if(!txt.trim()) return;
    const nc = { id: Date.now(), userId: user.id, userName: dn(user), text: txt, time: new Date().toISOString() };
    const newComments = [...comments, nc];
    try {
       const {error} = await supabase.from('news').update({comments: newComments}).eq('id', item.id);
       if (error) throw error;
       setNews(p => p.map(n => n.id === item.id ? {...n, comments: newComments} : n));
       setTxt("");
    } catch(e) { console.error(e); alert("Erreur lors de l'envoi."); }
  };

  return (
    <div style={{borderTop:"1px solid #1a1a1a",padding:"14px 0 0", marginTop:20}}>
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

function NewsDetail({n, user, setNews, onClose, bureau, toggleLike, delN}) {
  const liked = Array.isArray(n.likedBy) && n.likedBy.includes(user.id);
  const sp = Sp[n.sportId] || {l: n.sportId};
  const photos = n.photos||[];
  const [idx, setIdx] = useState(0);

  return (
    <div className="fade-in" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:S.bg,zIndex:200,overflowY:"auto",paddingBottom:80}}>
      <div style={{padding:"14px 18px",background:"#0c0c0c",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:S.red,cursor:"pointer",fontSize:16,fontWeight:800,fontFamily:"inherit",padding:"4px 8px"}}>← Retour</button>
        {(isDev(user) || isBurs(user, bureau)) && <button onClick={()=>delN(n.id)} style={{background:"none",border:"none",color:"#EF4444",fontSize:16,cursor:"pointer"}}>🗑️</button>}
      </div>
      
      {photos.length>0 && (
        <div style={{position:"relative",background:"#0a0a0a",maxHeight:400,overflow:"hidden"}}>
          <img src={photos[idx]} loading="lazy" style={{width:"100%",maxHeight:400,objectFit:"contain",display:"block"}} alt="" />
          {photos.length>1 && (
            <div>
              <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:6}}>
                {photos.map((_,i) => <button key={i} onClick={()=>setIdx(i)} style={{width:8,height:8,borderRadius:"50%",background:idx===i?S.red:"#555",border:"none",cursor:"pointer",padding:0}}/>)}
              </div>
              <button onClick={()=>setIdx(v=>v>0?v-1:photos.length-1)} style={{position:"absolute",top:"50%",left:10,transform:"translateY(-50%)",background:"#00000099",color:"white",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14}}>{"<"}</button>
              <button onClick={()=>setIdx(v=>v<photos.length-1?v+1:0)} style={{position:"absolute",top:"50%",right:10,transform:"translateY(-50%)",background:"#00000099",color:"white",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14}}>{">"}</button>
            </div>
          )}
        </div>
      )}

      <div style={{padding:"20px", maxWidth:800, margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <Tag label={sp.l} />
          <span style={{fontSize:11,color:"#444"}}>{fmtDate(n.date)}</span>
        </div>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:32,fontWeight:900,lineHeight:1.1,marginBottom:14}}>{n.title}</div>
        <div style={{fontSize:15,color:"#ccc",lineHeight:1.8,marginBottom:20,whiteSpace:"pre-wrap"}}>{n.content}</div>
        
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderTop:"1px solid #1e1e1e",borderBottom:"1px solid #1e1e1e"}}>
          <span style={{fontSize:12,color:"#555"}}>Par {n.authorName}</span>
          <button onClick={() => toggleLike(n)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:liked?S.red:"#555", display:"flex", alignItems:"center", gap:6}}>
            {liked?"❤️":"🤍"} <span style={{fontWeight:700,fontSize:14}}>{n.likes||0}</span>
          </button>
        </div>
        <NewsComments item={n} setNews={setNews} user={user} />
      </div>
    </div>
  );
}

export default function NewsTab({news, setNews, user, bureau}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editNId, setEditNId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({sportId:"general",title:"",content:"",photos:[]});
  const fileRef = useRef(null);
  const canAdd = isDev(user) || isBurs(user, bureau); 

  const addPhotos = files => {
    const total = Math.min(files.length, 6-form.photos.length);
    if (total<=0) return;
    let done=0, results=[];
    for (let i=0;i<total;i++) readFile(files[i], d => { results.push(d); if(++done===total) setForm(p=>({...p,photos:[...p.photos,...results]})); });
  };

  // ❤️ GESTION DES LIKES (Supabase)
  const toggleLike = async (n) => {
    const isL = (n.likedBy || []).includes(user.id);
    const newLikedBy = isL ? (n.likedBy||[]).filter(x=>x!==user.id) : [...(n.likedBy||[]), user.id];
    const newLikes = newLikedBy.length;
    try {
      const { error } = await supabase.from('news').update({ likes: newLikes, likedby: newLikedBy }).eq('id', n.id);
      if (error) throw error;
      setNews(p => p.map(x => x.id === n.id ? {...x, likes: newLikes, likedBy: newLikedBy} : x));
    } catch (err) { console.error(err); }
  };

  // 📝 SAUVEGARDE & MODIFICATION (Supabase)
  const handleSaveN = async () => {
    if (!form.title||!form.content||!canAdd) return;
    const isEdit = !!editNId;
    const nId = editNId || Date.now();
    const today = new Date().toISOString().slice(0,10);

    const dbPayload = { sportid: form.sportId, title: form.title, content: form.content, photos: form.photos };

    try {
      if (isEdit) {
        const { error } = await supabase.from('news').update(dbPayload).eq('id', nId);
        if (error) throw error;
        setNews(p => p.map(n => n.id===nId ? {...n,...form} : n));
      } else {
        dbPayload.id = nId;
        dbPayload.date = today;
        dbPayload.authorid = user.id;
        dbPayload.authorname = dn(user);
        dbPayload.likes = 0;
        dbPayload.likedby = [];
        dbPayload.comments = [];

        const { error } = await supabase.from('news').insert([dbPayload]);
        if (error) throw error;

        setNews(p => [{...form, id:nId, date:today, authorId:user.id, authorName:dn(user), likes:0, likedBy:[], comments:[]}, ...p]);
      }
      setShowAdd(false); setEditNId(null);
    } catch(e) { console.error(e); alert("Erreur lors de la sauvegarde."); }
  };

  // 🗑️ SUPPRESSION (Supabase)
  const delN = async (id) => { 
    if(confirm("Supprimer l'actu ?")) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;
        setNews(p=>p.filter(x=>x.id!==id)); 
        setShowAdd(false); setEditNId(null); setSelected(null);
      } catch(e) { console.error(e); alert("Erreur lors de la suppression."); }
    }
  };

  if (selected) {
    const n = news.find(x=>x.id===selected);
    if(n) return <NewsDetail n={n} user={user} setNews={setNews} onClose={()=>setSelected(null)} bureau={bureau} toggleLike={toggleLike} delN={delN} />;
    else setSelected(null);
  }

  // Tri des actus du plus récent au plus ancien
  const sortedNews = [...news].sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="fade-in">
      <SecTitle title="Actualités" action={canAdd && <AddBtn label="+ Publier" onClick={()=>{setForm({sportId:"general",title:"",content:"",photos:[]});setEditNId(null);setShowAdd(v=>!v);}} />} />
      {showAdd && (
        <div style={{margin:"0 20px 16px",maxWidth:800,margin:"0 auto 16px",background:"#111",borderRadius:14,padding:18,border:`1px solid ${S.redBorder}`}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:17,fontWeight:900,color:S.red,letterSpacing:2,marginBottom:16}}>{editNId?"MODIFIER L'ACTU":"NOUVELLE ACTU"}</div>
          <Lbl t="Sport"/><select style={{...S.inp,marginBottom:10}} value={form.sportId} onChange={e=>setForm(p=>({...p,sportId:e.target.value}))}>{SPORTS.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
          <Lbl t="Titre"/><input style={{...S.inp,marginBottom:10}} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
          <Lbl t="Contenu"/><textarea rows={5} style={{...S.inp,resize:"none",marginBottom:12}} value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} />
          <Lbl t={`Photos (${form.photos.length}/6)`}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {form.photos.map((ph,i) => (
              <div key={i} style={{position:"relative",width:68,height:68,borderRadius:10,overflow:"hidden",border:"1px solid #2a2a2a"}}>
                <img src={ph} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" />
                <button onClick={()=>setForm(p=>({...p,photos:p.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:3,right:3,background:S.red+"cc",color:"white",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:11,lineHeight:1,padding:0}}>x</button>
              </div>
            ))}
            {form.photos.length<6 && (
              <button onClick={()=>fileRef.current?.click()} style={{width:68,height:68,borderRadius:10,border:"2px dashed #333",background:"transparent",cursor:"pointer",color:"#555",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                <span style={{fontSize:22}}>+</span><span style={{fontSize:9}}>Photo</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e=>addPhotos(e.target.files)} style={{display:"none"}} />
          <div style={{display:"flex",gap:10}}>
             <button onClick={()=>{setShowAdd(false); setEditNId(null);}} style={{flex:1,...btnStyle("#1c1c1c","#888"),border:"1px solid #2a2a2a"}}>Annuler</button>
             {editNId && <button onClick={()=>delN(editNId)} style={{flex:1,...btnStyle("#1a0505","#EF4444"),border:`1px solid ${S.redBorder}`}}>Supprimer</button>}
             <button onClick={handleSaveN} style={{flex:2,...btnStyle()}}>Publier</button>
          </div>
        </div>
      )}
      
      <div style={{display:"flex", flexDirection:"column", gap:16, maxWidth:800, margin:"0 auto", padding:"0 20px"}}>
        {sortedNews.length === 0 && <div style={{textAlign:"center", color:"#555", fontSize:12, padding:"20px"}}>Aucune actualité pour le moment.</div>}
        {sortedNews.map(n => {
          const liked = Array.isArray(n.likedBy) && n.likedBy.includes(user.id);
          const sp = Sp[n.sportId] || {l: n.sportId};
          const hasPh = (n.photos||[]).length > 0;
          return (
            <Card key={n.id} onClick={()=>setSelected(n.id)} style={{cursor:"pointer", position:"relative"}}>
              {canAdd && <button onClick={(e)=>{e.stopPropagation();setForm({sportId:n.sportId,title:n.title,content:n.content,photos:[...n.photos||[]]});setEditNId(n.id);setShowAdd(true);window.scrollTo(0,0);}} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.5)",border:"1px solid #333",borderRadius:"50%",width:30,height:30,color:"white",fontSize:14,cursor:"pointer",zIndex:5}}>✏️</button>}
              {hasPh && (
                <div style={{height:180, overflow:"hidden", position:"relative"}}>
                  <img src={n.photos[0]} loading="lazy" style={{width:"100%", height:"100%", objectFit:"cover"}} alt="" />
                  {n.photos.length>1 && <div style={{position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.7)", color:"white", padding:"4px 8px", borderRadius:8, fontSize:11}}>+{n.photos.length-1}</div>}
                </div>
              )}
              <div style={{padding:"14px 16px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Tag label={sp.l} /><span style={{fontSize:11,color:"#444"}}>{fmtDate(n.date)}</span></div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:24,fontWeight:900,lineHeight:1.1,marginBottom:8}}>{n.title}</div>
                <div style={{fontSize:13,color:"#bbb",lineHeight:1.6,marginBottom:12, maxHeight:"3.2em", overflow:"hidden", textOverflow:"ellipsis"}}>{n.content}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #1f1f1f",paddingTop:10}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                     <span style={{fontSize:12,color:"#555"}}>Par {n.authorName}</span>
                     <span style={{fontSize:12,color:"#555"}}>{"💬 "+(n.comments?.length||0)}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(n); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:liked?S.red:"#555", display:"flex", alignItems:"center", gap:6}}>
                    {liked?"❤️":"🤍"} <span style={{fontWeight:700,fontSize:14}}>{n.likes||0}</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}