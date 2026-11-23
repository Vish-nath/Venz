import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import './ambient-snake.css';
import './ambient-mobile.css';

const SEGMENTS = 8;
function AmbientSnake() {
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLButtonElement>(null);
  const pieces = useRef<(HTMLSpanElement | null)[]>([]);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState('A tiny field-guide companion. Click to pause or drag it along the edge.');
  const state = useRef({ distance: 40, dragging: false, moved: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    let frame = 0; let last = 0; let distance = state.current.distance;
    const point = (d: number) => {
      const w = window.innerWidth - 28, h = window.innerHeight - 28, perimeter = 2 * (w + h);
      d = ((d % perimeter) + perimeter) % perimeter;
      if (d < w) return { x: 14 + d, y: 14, angle: 0 };
      d -= w; if (d < h) return { x: 14 + w, y: 14 + d, angle: 90 };
      d -= h; if (d < w) return { x: 14 + w - d, y: 14 + h, angle: 180 };
      d -= w; return { x: 14, y: 14 + h - d, angle: 270 };
    };
    const draw = (time: number) => {
      if (time - last > 32) {
        const dt = last ? Math.min((time - last) / 1000, .08) : 0; last = time;
        if (!paused && !state.current.dragging && !matchMedia('(prefers-reduced-motion: reduce)').matches) distance += dt * 34;
        state.current.distance = distance;
        for (let i=0;i<SEGMENTS;i++) {
          const el = pieces.current[i]; if (!el) continue;
          const p = point(distance - i * 10);
          el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.angle}deg)`;
        }
        if (head.current) { const p=point(distance); head.current.style.transform=`translate3d(${p.x}px,${p.y}px,0)`; }
      }
      frame = requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw); return ()=>cancelAnimationFrame(frame);
  }, [paused]);

  const moveToPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const s=state.current; const dx=event.clientX-s.lastX,dy=event.clientY-s.lastY;
    if(Math.abs(dx)+Math.abs(dy)>3)s.moved=true;
    if(!s.dragging||!s.moved)return;
    const w=window.innerWidth-28,h=window.innerHeight-28;
    const x=Math.min(w,Math.max(0,event.clientX-14)),y=Math.min(h,Math.max(0,event.clientY-14));
    const choices=[{d:x,dist:Math.abs(y)},{d:w+y,dist:Math.abs(w-x)},{d:w+h+(w-x),dist:Math.abs(h-y)},{d:2*w+h+(h-y),dist:Math.abs(x)}];
    const selected=choices.reduce((a,b)=>a.dist<b.dist?a:b); state.current.distance=selected.d;
  };

  return createPortal(<div className="ambientSnake" ref={root} aria-label="Interactive pixel snake decoration">
    {Array.from({length:SEGMENTS},(_,i)=><span key={i} ref={el=>{pieces.current[i]=el;}} className={`snakePixel snakePixel${i}`} aria-hidden="true"/>)}
    <button ref={head} className="snakeHead" aria-label={paused?'Resume pixel snake':'Pause or drag pixel snake'} title={message}
      onPointerDown={e=>{state.current.dragging=true;state.current.moved=false;state.current.lastX=e.clientX;state.current.lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={moveToPointer}
      onPointerUp={e=>{state.current.dragging=false;e.currentTarget.releasePointerCapture(e.pointerId);if(!state.current.moved){setPaused(v=>!v);setMessage(paused?'Pixel snake is on the move.':'Pixel snake paused. Click again to resume.');}else setMessage('Nice move. The pixel snake is back on patrol.');}}
      onPointerCancel={()=>{state.current.dragging=false;}}>
      <i/><i/>
    </button>
    <span className="snakeHint" role="status">{message}</span>
  </div>, document.body);
}
export default AmbientSnake;
