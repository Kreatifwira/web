const $=id=>document.getElementById(id);
async function send(type,x={}){try{return await chrome.runtime.sendMessage({type,...x})}catch(e){return{ok:false,error:e?.message||String(e)}}}
async function refresh(){
  const s=await send("POPUP_GET_STATE"),l=await send("POPUP_LIST");
  if(!s.ok){$("status").textContent="❌ Extension tidak merespons: "+s.error;return}
  const x=s?.state;
  if(!x)$("status").textContent="Buka halaman Solitaire target.";
  else if(x.match)$("status").textContent="🟢 Deal cocok • "+(x.match.score*100).toFixed(1)+"%";
  else $("status").textContent=(x.recording?"🔴 Merekam • ":"Siap • ")+(x.actionCount||0)+" langkah";
  const rec=!!x?.recording; const btn=$("start"); btn.classList.toggle("recording",rec); btn.disabled=rec; btn.textContent=rec?"● SEDANG MEREKAM":"● MULAI REKAM"; btn.style.backgroundColor=rec?"#000":"#2563eb"; btn.style.color="#fff";
  $("list").innerHTML=(l?.recordings||[]).map(r=>'<div class="item"><b>'+esc(r.name)+'</b><div class="meta">'+(r.actions?.length||0)+' langkah • '+new Date(r.createdAt).toLocaleString()+'</div><button data-p="'+r.id+'">▶ JALANKAN</button><button class="danger" data-d="'+r.id+'">HAPUS</button></div>').join("")||'<div class="meta">Belum ada rekaman.</div>';
  document.querySelectorAll("[data-p]").forEach(b=>b.onclick=async()=>{const r=await send("POPUP_REPLAY",{recordingId:b.dataset.p});if(!r.ok)alert("Replay: "+r.error);else window.close()});
  document.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{const r=await send("POPUP_DELETE",{recordingId:b.dataset.d});if(!r.ok)alert(r.error);else refresh()});
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("start").onclick=async()=>{
  $("start").disabled=true;$("status").textContent="⏳ Memulai rekaman...";
  const r=await send("POPUP_START");
  $("start").disabled=false;
  if(!r.ok)alert("Mulai rekam gagal: "+r.error);
  await refresh();
};
$("finish").onclick=async()=>{
  const r=await send("POPUP_FINISH");
  if(!r.ok)alert("Selesai gagal: "+r.error);
  await refresh();
};
$("stop").onclick=async()=>{const r=await send("POPUP_STOP_REPLAY");if(!r.ok)alert(r.error)};
$("threshold").oninput=async e=>{$("tv").textContent=Number(e.target.value).toFixed(1)+"%";save()};
$("delay").oninput=async e=>{$("dv").textContent=e.target.value+" ms";save()};
async function save(){await chrome.storage.local.set({v5settings:{threshold:Number($("threshold").value)/100,delay:Number($("delay").value)}})}
refresh();