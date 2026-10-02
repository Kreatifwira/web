const $=id=>document.getElementById(id);
let current=null;
let settings={left:5,top:8,width:90,height:84,tolerance:90};

async function load(){
  const s=await chrome.storage.local.get(["patterns","settings"]);
  settings={...settings,...(s.settings||{})};
  ["left","top","width","height","tolerance"].forEach(id=>$(id).value=settings[id]);
  $("tolValue").textContent=settings.tolerance+"%";
  render(s.patterns||[]);
}
async function saveSettings(){
  settings.left=Number($("left").value);settings.top=Number($("top").value);
  settings.width=Number($("width").value);settings.height=Number($("height").value);
  settings.tolerance=Number($("tolerance").value);
  await chrome.storage.local.set({settings});
}
async function capture(){
  const r=await chrome.runtime.sendMessage({type:"CAPTURE_CARD_BOARD",settings});
  if(r?.error)throw new Error(r.error);
  return r;
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function render(ps){
  $("count").textContent=ps.length;
  $("list").innerHTML=ps.map((p,i)=>'<div class="item"><strong>#'+(i+1)+' — '+esc(p.title||"Solitaire")+'</strong><span>'+new Date(p.createdAt).toLocaleString()+' • '+p.slots+' slot</span><br><span class="score">Fingerprint: '+esc(p.fingerprint.slice(0,18))+'…</span></div>').join("")||'<div class="item">Belum ada pola.</div>';
}
["left","top","width","height"].forEach(id=>$(id).onchange=saveSettings);
$("tolerance").oninput=()=>{$("tolValue").textContent=$("tolerance").value+"%";saveSettings()};
$("record").onclick=async()=>{try{await saveSettings();$("status").textContent="Mengambil papan…";current=await capture();$("status").textContent="Pola direkam: 13 slot. Tekan SIMPAN POLA."}catch(e){$("status").textContent="Gagal: "+e.message}};
$("save").onclick=async()=>{if(!current){$("status").textContent="Tekan REKAM POLA dulu.";return}const d=await chrome.storage.local.get("patterns"),ps=d.patterns||[];ps.push({...current,createdAt:Date.now()});await chrome.storage.local.set({patterns:ps});current=null;render(ps);$("status").textContent="Pola tersimpan."};
$("check").onclick=async()=>{try{await saveSettings();const d=await chrome.storage.local.get("patterns"),ps=d.patterns||[];if(!ps.length){$("status").textContent="Belum ada pola tersimpan.";return}$("status").textContent="Membandingkan posisi kartu…";const now=await capture();let best=-1,bestScore=0;for(let i=0;i<ps.length;i++){const s=patternSimilarity(now,ps[i]);if(s>bestScore){bestScore=s;best=i}}$("match").textContent=Math.round(bestScore*100)+"%";if(best>=0&&bestScore>=settings.tolerance/100){$("status").textContent="🟢 POLA DITEMUKAN — #"+(best+1);await chrome.runtime.sendMessage({type:"NOTIFY",title:"Pola Solitaire ditemukan",message:"Pola cocok dengan rekaman #"+(best+1)+" ("+Math.round(bestScore*100)+"%)."})}else $("status").textContent="⚪ Tidak ada pola yang memenuhi toleransi."}catch(e){$("status").textContent="Gagal: "+e.message}};
function patternSimilarity(a,b){if(!a||!b||a.slots!==b.slots)return 0;let total=0;for(let i=0;i<a.cards.length;i++)total+=slotSimilarity(a.cards[i],b.cards[i]);return total/a.cards.length}
function slotSimilarity(a,b){if(!a||!b)return 0;const hash=bitSimilarity(a.hash,b.hash);const occ=Math.max(0,1-Math.abs(a.occupancy-b.occupancy));const edge=Math.max(0,1-Math.abs(a.edge-b.edge));return hash*.75+occ*.15+edge*.10}
function bitSimilarity(a,b){if(!a||!b||a.length!==b.length)return 0;let same=0;for(let i=0;i<a.length;i++)if(a[i]===b[i])same++;return same/a.length}
$("clear").onclick=async()=>{if(!confirm("Hapus semua pola?"))return;await chrome.storage.local.remove("patterns");render([]);$("match").textContent="-";$("status").textContent="Semua pola dihapus."};
load();