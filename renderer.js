const browser=document.getElementById("browser"),url=document.getElementById("url"),status=document.getElementById("status"),result=document.getElementById("result"),recordBtn=document.getElementById("record"),count=document.getElementById("count"),pageTitle=document.getElementById("pageTitle"),list=document.getElementById("list");
let currentSnapshot=null;
let patterns=JSON.parse(localStorage.getItem("browserPatterns")||"[]");
const setStatus=t=>status.textContent=t;
const normalizeUrl=v=>/^https?:\\/\\//i.test(v)?v:"https://"+v;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function fnv1a(bytes){let h=2166136261>>>0;for(let i=0;i<bytes.length;i++){h^=bytes[i];h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,"0")}
async function snapshot(){
  const image=await browser.capturePage();
  const size=image.getSize(),png=image.toPNG(),step=Math.max(1,Math.floor(png.length/60000)),sample=[];
  for(let i=0;i<png.length;i+=step)sample.push(png[i]);
  return {fingerprint:fnv1a(sample),width:size.width,height:size.height,url:browser.getURL(),title:browser.getTitle()||"Untitled",createdAt:Date.now()};
}
function render(){count.textContent=patterns.length;list.innerHTML="";patterns.forEach((p,i)=>{const e=document.createElement("div");e.className="item";e.innerHTML="<strong>#"+(i+1)+" — "+esc(p.title)+"</strong><span>"+new Date(p.createdAt).toLocaleString()+"</span><br><span>"+p.width+" × "+p.height+" • "+esc(p.fingerprint)+"</span>";list.appendChild(e)})}
document.getElementById("go").onclick=()=>{if(url.value.trim())browser.src=normalizeUrl(url.value.trim())};
url.addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("go").click()});
document.getElementById("back").onclick=()=>browser.canGoBack()&&browser.goBack();
document.getElementById("forward").onclick=()=>browser.canGoForward()&&browser.goForward();
document.getElementById("reload").onclick=()=>browser.reload();
browser.addEventListener("did-navigate",()=>{url.value=browser.getURL();pageTitle.textContent=browser.getTitle()||"-";setStatus("Halaman dimuat")});
browser.addEventListener("did-navigate-in-page",()=>url.value=browser.getURL());
recordBtn.onclick=async()=>{try{currentSnapshot=await snapshot();recordBtn.classList.add("active");setStatus("Pola direkam. Tekan SIMPAN.");result.className="result";result.innerHTML="<b>Snapshot siap.</b><br>Fingerprint: "+esc(currentSnapshot.fingerprint)}catch(e){setStatus("Gagal mengambil snapshot");result.textContent=e.message}};
document.getElementById("save").onclick=()=>{if(!currentSnapshot){setStatus("Tekan RECORD POLA terlebih dahulu.");return}patterns.push(currentSnapshot);localStorage.setItem("browserPatterns",JSON.stringify(patterns));recordBtn.classList.remove("active");render();setStatus("Pola tersimpan.")};
document.getElementById("check").onclick=async()=>{if(!patterns.length){result.className="result no-match";result.innerHTML="<b>Belum ada pola tersimpan.</b>";return}try{const now=await snapshot(),i=patterns.findIndex(p=>p.fingerprint===now.fingerprint);currentSnapshot=now;if(i>=0){result.className="result match";result.innerHTML="<b>🟢 POLA PERMAINAN DITEMUKAN</b><br>Cocok dengan rekaman #"+(i+1)+"<br>Fingerprint: "+esc(patterns[i].fingerprint);setStatus("Pola cocok.")}else{result.className="result no-match";result.innerHTML="<b>⚪ POLA BELUM DITEMUKAN</b><br>Fingerprint sekarang: "+esc(now.fingerprint);setStatus("Tidak ada kecocokan persis.")}}catch(e){result.textContent=e.message}};
document.getElementById("clear").onclick=()=>{if(!confirm("Hapus semua pola yang tersimpan?"))return;patterns=[];localStorage.removeItem("browserPatterns");render();result.className="result";result.textContent="Database pola kosong.";setStatus("Semua pola dihapus.")};
render();