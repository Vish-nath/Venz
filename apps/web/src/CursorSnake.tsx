import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './cursor-snake.css';

const COUNT = 10;
function CursorSnake() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d', { alpha: true });
    if (!element || !context) return;
    const trail = Array.from({length:COUNT},()=>({x:-100,y:-100}));
    const target={x:-100,y:-100,lastMove:0,pressed:false,started:false};
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame=0,lastDraw=0;
    let wake=()=>{};
    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      element.width=Math.round(window.innerWidth*dpr);element.height=Math.round(window.innerHeight*dpr);
      element.style.width=`${window.innerWidth}px`;element.style.height=`${window.innerHeight}px`;
      context.setTransform(dpr,0,0,dpr,0,0);context.imageSmoothingEnabled=false;
    };
    const move=(event:PointerEvent)=>{
      target.x=event.clientX;target.y=event.clientY;target.lastMove=performance.now();target.started=true;
      wake();
    };
    const down=(event:PointerEvent)=>{target.pressed=true;move(event);};
    const up=()=>{target.pressed=false;target.lastMove=performance.now();wake();};
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerdown',down,{passive:true});
    window.addEventListener('pointerup',up,{passive:true});
    window.addEventListener('pointercancel',up,{passive:true});
    resize();
    const draw=(now:number)=>{
      frame=0;
      if(now-lastDraw<30){frame=requestAnimationFrame(draw);return;}
      lastDraw=now;
      context.clearRect(0,0,window.innerWidth,window.innerHeight);
      if(!target.started||(!target.pressed&&now-target.lastMove>950))return;
      trail[0].x=target.x;trail[0].y=target.y;
      for(let i=1;i<COUNT;i++){
        const lag=reducedMotion ? .72 : .24;
        trail[i].x+=(trail[i-1].x-trail[i].x)*lag;
        trail[i].y+=(trail[i-1].y-trail[i].y)*lag;
      }
      const fade=target.pressed?1:Math.max(0,1-(now-target.lastMove)/950);
      for(let i=COUNT-1;i>=0;i--){
        const p=trail[i];if(p.x<0)continue;
        const size=i===0?13:i<4?10:8;
        context.globalAlpha=fade*(1-i/(COUNT+2)*.65);
        context.fillStyle=i===0?'#dcff86':i<4?'#b6e45e':'#82ae43';
        context.fillRect(Math.round(p.x-size/2),Math.round(p.y-size/2),size,size);
        if(i===0){context.fillStyle='#182219';context.fillRect(p.x-4,p.y-2,2,2);context.fillRect(p.x+2,p.y-2,2,2);}
      }
      context.globalAlpha=1;
      frame=requestAnimationFrame(draw);
    };
    wake=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    const onResize=()=>{resize();wake();};
    window.addEventListener('resize',onResize,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',onResize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);};
  },[]);
  return createPortal(<canvas ref={canvas} className="cursorSnakeCanvas" aria-hidden="true"/>,document.body);
}
export default CursorSnake;
