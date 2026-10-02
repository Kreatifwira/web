chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg.type==="CAPTURE"){
    chrome.tabs.query({active:true,currentWindow:true},tabs=>{
      const tab=tabs[0];if(!tab){sendResponse({error:"Tab aktif tidak ditemukan."});return}
      chrome.tabs.captureVisibleTab(tab.windowId,{format:"png"},dataUrl=>{
        if(chrome.runtime.lastError){sendResponse({error:chrome.runtime.lastError.message});return}
        analyze(dataUrl,msg.crop||"center").then(sendResponse).catch(e=>sendResponse({error:e.message}))
      })
    });return true
  }
  if(msg.type==="NOTIFY")chrome.notifications.create({type:"basic",title:msg.title,message:msg.message})
});
async function analyze(dataUrl,mode){
  const blob=await(await fetch(dataUrl)).blob(),bmp=await createImageBitmap(blob);
  const size=250,canvas=new OffscreenCanvas(size,size),ctx=canvas.getContext("2d");
  let sx=0,sy=0,sw=bmp.width,sh=bmp.height;
  if(mode==="center"){sw=Math.floor(bmp.width*.72);sh=Math.floor(bmp.height*.72);sx=Math.floor((bmp.width-sw)/2);sy=Math.floor((bmp.height-sh)/2)}
  ctx.drawImage(bmp,sx,sy,sw,sh,0,0,size,size);
  const zones=[],z=50;
  for(let zy=0;zy<5;zy++)for(let zx=0;zx<5;zx++)zones.push(zoneHash(ctx,zx*z,zy*z,z));
  return{zones,width:bmp.width,height:bmp.height,title:"Solitaire",score:zones.length}
}
function zoneHash(ctx,x,y,s){
  const d=ctx.getImageData(x,y,s,s).data,vals=[],cell=5;
  for(let yy=0;yy<10;yy++)for(let xx=0;xx<10;xx++){
    let sum=0;
    for(let py=0;py<cell;py++)for(let px=0;px<cell;px++){const i=((yy*cell+py)*250+(xx*cell+px))*4;sum+=(d[i]*299+d[i+1]*587+d[i+2]*114)/1000}
    vals.push(sum/25)
  }
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  return vals.map(v=>v>=avg?"1":"0").join("")
}