const address=document.getElementById("address"),homeScreen=document.getElementById("homeScreen"),webview=document.getElementById("webview"),errorBox=document.getElementById("errorBox"),homeSearch=document.getElementById("homeSearch"),searchForm=document.getElementById("searchForm");let currentUrl="";const homeUrl="https://example.com";

function normalize(value){value=value.trim();if(!value)return homeUrl;if(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value))return value;if(value.includes(" ")||!value.includes("."))return "https://www.google.com/search?q="+encodeURIComponent(value);return "https://"+value}
function navigate(value){const url=normalize(value);currentUrl=url;address.value=url;homeScreen.style.display="none";errorBox.classList.add("hidden");webview.style.display="block";webview.src=url}
function go(){navigate(address.value)}
address.addEventListener("keydown",e=>{if(e.key==="Enter")go()});document.getElementById("go").onclick=go;
searchForm.addEventListener("submit",e=>{e.preventDefault();navigate(homeSearch.value)});
document.querySelectorAll(".quick-links button").forEach(b=>b.onclick=()=>navigate(b.dataset.url));
document.getElementById("home").onclick=()=>{webview.style.display="none";errorBox.classList.add("hidden");homeScreen.style.display="flex";address.value=""};
document.getElementById("reload").onclick=()=>{if(currentUrl)webview.src=currentUrl};
document.getElementById("back").onclick=()=>{try{webview.contentWindow.history.back()}catch(e){}};
document.getElementById("forward").onclick=()=>{try{webview.contentWindow.history.forward()}catch(e){}};
document.getElementById("openExternal").onclick=()=>{if(currentUrl)window.open(currentUrl,"_blank","noopener,noreferrer")};
document.getElementById("external").onclick=()=>{if(currentUrl)window.open(currentUrl,"_blank","noopener,noreferrer")};
document.getElementById("retry").onclick=()=>{if(currentUrl){webview.src="";setTimeout(()=>webview.src=currentUrl,50)}};
document.getElementById("newTab").onclick=()=>{document.getElementById("home").click();homeSearch.focus()};
webview.addEventListener("load",()=>{errorBox.classList.add("hidden")});
webview.addEventListener("error",()=>{webview.style.display="none";errorBox.classList.remove("hidden")});