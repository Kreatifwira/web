const input=document.getElementById("url");
const open=document.getElementById("open");
const go=document.getElementById("go");
const back=document.getElementById("back");
const forward=document.getElementById("forward");
const reload=document.getElementById("reload");
function normalize(v){
 v=(v||"").trim();
 if(!v) return "https://1xraja.com/id";
 if(/^https?:\/\//i.test(v)) return v;
 if(v.includes(" ")||!v.includes(".")) return "https://www.google.com/search?q="+encodeURIComponent(v);
 return "https://"+v;
}
function openDirect(){
 const u=normalize(input.value);
 input.value=u;
 window.location.href=u;
}
go.onclick=openDirect;
open.onclick=()=>{input.value="https://1xraja.com/id";openDirect()};
input.addEventListener("keydown",e=>{if(e.key==="Enter")openDirect()});
back.onclick=()=>history.back();
forward.onclick=()=>history.forward();
reload.onclick=()=>location.reload();