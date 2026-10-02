const $=id=>document.getElementById(id);let currentUrl="",desktop=false;
function normalize(v){v=v.trim();if(!v)return"";if(/^[a-z][a-z0-9+.-]*:\/\//i.test(v))return v;if(v.includes(" ")||!v.includes("."))return "https://www.google.com/search?q="+encodeURIComponent(v);return"https://"+v}
function showHome(){ $("start").style.display="flex";$("page").style.display="none";$("blocked").style.display="none";$("address").value=""}
function nav(v){const u=normalize(v);if(!u)return;currentUrl=u;$("address").value=u;$("start").style.display="none";$("blocked").style.display="none";$("page").style.display="block";$("page").src=u;localStorage.setItem("lastUrl",u);localStorage.setItem("history",JSON.stringify([u,...JSON.parse(localStorage.getItem("history")||"[]").filter(x=>x!==u)].slice(0,30)))}
function direct(){if(currentUrl)window.open(currentUrl,"_blank","noopener,noreferrer")}
function go(){nav($("address").value)}
$("address").addEventListener("keydown",e=>{if(e.key==="Enter")go()});$("go").onclick=go;$("clear").onclick=()=>{$("address").value="";$("address").focus()};
$("search").onsubmit=e=>{e.preventDefault();nav($("query").value)};document.querySelectorAll("[data-url]").forEach(x=>x.onclick=()=>nav(x.dataset.url));
$("home").onclick=showHome;$("addTab").onclick=showHome;$("closeTab").onclick=showHome;$("reload").onclick=()=>{if(currentUrl)$("page").src=currentUrl};$("open").onclick=direct;$("direct").onclick=direct;$("direct2").onclick=direct;$("again").onclick=()=>currentUrl&&nav(currentUrl);
$("back").onclick=()=>{try{$("page").contentWindow.history.back()}catch(e){}};$("forward").onclick=()=>{try{$("page").contentWindow.history.forward()}catch(e){}};
function toggle(){ $("menuPanel").classList.toggle("show") }$("more").onclick=toggle;$("menu").onclick=toggle;
$("copy").onclick=async()=>{if(currentUrl){try{await navigator.clipboard.writeText(currentUrl)}catch(e){}toggle()}};$("desktop").onclick=()=>{desktop=!desktop;$("page").style.minWidth=desktop?"1100px":"0";toggle()};
$("clearData").onclick=()=>{localStorage.removeItem("history");localStorage.removeItem("lastUrl");toggle()};
$("page").addEventListener("error",()=>{$("page").style.display="none";$("blocked").style.display="flex"});
$("page").addEventListener("load",()=>{$("blocked").style.display="none"});
window.addEventListener("load",()=>{const last=localStorage.getItem("lastUrl");if(last){/* intentionally stay on home */}});
