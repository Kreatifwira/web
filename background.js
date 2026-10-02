chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg.type==="CAPTURE_CARD_BOARD"){
    chrome.tabs.query({active:true,currentWindow:true},tabs=>{
      const tab=tabs[0];if(!tab){sendResponse({error:"Tab aktif tidak ditemukan."});return}
      chrome.tabs.captureVisibleTab(tab.windowId,{format:"png"},dataUrl=>{
        if(chrome.runtime.lastError){sendResponse({error:chrome.runtime.lastError.message});return}
        analyzeBoard(dataUrl,msg.settings||{}).then(sendResponse).catch(e=>sendResponse({error:e.message}));
      });
    });return true;
  }
  if(msg.type==="NOTIFY")chrome.notifications.create({type:"basic",title:msg.title,message:msg.message});
});
async function analyzeBoard(dataUrl,s){
  const blob=await(await fetch(dataUrl)).blob(),bmp=await createImageBitmap(blob);
  const canvas=new OffscreenCanvas(720,720),ctx=canvas.getContext("2d",{willReadFrequently:true});
  const left=clamp(Number(s.left??5),0,50)/100,top=clamp(Number(s.top??8),0,50)/100,width=clamp(Number(s.width??90),20,100)/100,height=clamp(Number(s.height??84),20,100)/100;
  const sx=Math.floor(bmp.width*left),sy=Math.floor(bmp.height*top),sw=Math.max(1,Math.min(bmp.width-sx,Math.floor(bmp.width*width))),sh=Math.max(1,Math.min(bmp.height-sy,Math.floor(bmp.height*height)));
  ctx.clearRect(0,0,720,720);ctx.drawImage(bmp,sx,sy,sw,sh,0,0,720,720);
  const slots=[];
  const topY=.02,topH=.25,gap=.025,startX=.025,slotW=(1-startX*2-gap*5)/6;
  for(let i=0;i<6;i++){const x=startX+i*(slotW+gap);slots.push(readSlot(ctx,x*720,topY*720,slotW*720,topH*720))}
  const rowY=.30,rowH=.68,tGap=.018,tStart=.015,colW=(1-tStart*2-tGap*6)/7;
  for(let i=0;i<7;i++){const x=tStart+i*(colW+tGap);slots.push(readSlot(ctx,x*720,rowY*720,colW*720,rowH*720))}
  const fingerprint=slots.map((x,i)=>i+":"+x.hash+":"+x.occupancy.toFixed(3)).join("|");
  return{title:"Solitaire",slots:13,cards:slots,fingerprint,width:bmp.width,height:bmp.height,board:{left,top,width,height}};
}
function readSlot(ctx,x,y,w,h){
  const W=64,H=96,c=new OffscreenCanvas(W,H),q=c.getContext("2d",{willReadFrequently:true});
  q.drawImage(ctx,x,y,w,h,0,0,W,H);const d=q.getImageData(0,0,W,H).data,gray=new Float32Array(W*H);let sum=0,edge=0,nonBg=0;
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){const i=(yy*W+xx)*4,g=(d[i]*.299+d[i+1]*.587+d[i+2]*.114);gray[yy*W+xx]=g;sum+=g}
  const mean=sum/(W*H);
  for(let i=0;i<gray.length;i++){const x0=i%W,y0=Math.floor(i/W);if(x0<W-1)edge+=Math.abs(gray[i]-gray[i+1]);if(y0<H-1)edge+=Math.abs(gray[i]-gray[i+W]);if(Math.abs(gray[i]-mean)>22)nonBg++}
  let hash="";
  for(let by=0;by<24;by++)for(let bx=0;bx<16;bx++){let v=0,n=0;const x0=Math.floor(bx*W/16),x1=Math.floor((bx+1)*W/16),y0=Math.floor(by*H/24),y1=Math.floor((by+1)*H/24);for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){v+=gray[yy*W+xx];n++}hash+=(v/n>=mean)?"1":"0"}
  return{hash,occupancy:nonBg/gray.length,edge:Math.min(1,edge/(gray.length*45))};
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}