import React, { useState, useRef, useEffect, useMemo } from 'react';

interface Props {
  pillarWidth: number;
  pillarLength: number;
  baseL: number;
  thicknessH: number;
  type: string;
}

export default function FoundationDiagram({ pillarWidth, pillarLength, baseL, thicknessH, type }: Props) {
  const [rotation, setRotation] = useState(45);
  const [tilt, setTilt] = useState(30); 
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scale = 80; 
  const width = 350;
  const height = 350;
  
  const project = (x: number, y: number, z: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    const tiltRad = (tilt * Math.PI) / 180;

    const rx = x * Math.cos(rotRad) - y * Math.sin(rotRad);
    const ry = x * Math.sin(rotRad) + y * Math.cos(rotRad);
    
    const tx = rx;
    const ty = ry * Math.cos(tiltRad) - z * Math.sin(tiltRad);
    const tz = ry * Math.sin(tiltRad) + z * Math.cos(tiltRad);

    return {
      x: width / 2 + tx * scale * 0.8,
      y: height / 2 + ty * scale * 0.8,
      z: tz
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLastMousePos({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - lastMousePos.x;
    const deltaY = clientY - lastMousePos.y;
    
    setRotation(prev => (prev + deltaX) % 360);
    setTilt(prev => Math.max(10, Math.min(80, prev + deltaY * 0.5)));
    setLastMousePos({ x: clientX, y: clientY });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  const b = baseL / 2;
  const h = thicknessH;
  const pw = pillarWidth / 2;
  const pl = pillarLength / 2;
  const ph = h + 1.0; 

  const grid = useMemo(() => {
    const lines = [];
    const size = 2.0;
    const step = 0.5;
    for (let i = -size; i <= size; i += step) {
      lines.push({ p1: project(i, -size, 0), p2: project(i, size, 0) });
      lines.push({ p1: project(-size, i, 0), p2: project(size, i, 0) });
    }
    return lines;
  }, [rotation, tilt]);

  const drawBox = (xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number, baseColor: string) => {
    const pts = [
      project(xMin, yMin, zMin), project(xMax, yMin, zMin), project(xMax, yMax, zMin), project(xMin, yMax, zMin),
      project(xMin, yMin, zMax), project(xMax, yMin, zMax), project(xMax, yMax, zMax), project(xMin, yMax, zMax)
    ];

    return (
      <g>
        <polygon points={`${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y} ${pts[3].x},${pts[3].y}`} fill={baseColor} opacity="0.2" />
        <polygon points={`${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y} ${pts[6].x},${pts[6].y} ${pts[5].x},${pts[5].y}`} fill={baseColor} filter="brightness(0.6)" />
        <polygon points={`${pts[2].x},${pts[2].y} ${pts[3].x},${pts[3].y} ${pts[7].x},${pts[7].y} ${pts[6].x},${pts[6].y}`} fill={baseColor} filter="brightness(0.5)" />
        <polygon points={`${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y} ${pts[5].x},${pts[5].y} ${pts[4].x},${pts[4].y}`} fill={baseColor} filter="brightness(0.8)" />
        <polygon points={`${pts[0].x},${pts[0].y} ${pts[3].x},${pts[3].y} ${pts[7].x},${pts[7].y} ${pts[4].x},${pts[4].y}`} fill={baseColor} filter="brightness(0.7)" stroke={baseColor} strokeWidth="0.5" />
        <polygon points={`${pts[4].x},${pts[4].y} ${pts[5].x},${pts[5].y} ${pts[6].x},${pts[6].y} ${pts[7].x},${pts[7].y}`} fill={baseColor} filter="brightness(1.1)" stroke={baseColor} strokeWidth="0.5" />
      </g>
    );
  };

  const drawDim = (p1: any, p2: any, label: string, offset: number = 30) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const nx = Math.cos(angle + Math.PI / 2);
    const ny = Math.sin(angle + Math.PI / 2);
    
    const d1x = p1.x + nx * offset;
    const d1y = p1.y + ny * offset;
    const d2x = p2.x + nx * offset;
    const d2y = p2.y + ny * offset;

    return (
      <g className="font-mono">
        <line x1={p1.x} y1={p1.y} x2={d1x} y2={d1y} stroke="#52525b" strokeWidth="0.5" />
        <line x1={p2.x} y1={p2.y} x2={d2x} y2={d2y} stroke="#52525b" strokeWidth="0.5" />
        <line x1={d1x} y1={d1y} x2={d2x} y2={d2y} stroke="#10b981" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
        <rect x={(d1x + d2x) / 2 - 25} y={(d1y + d2y) / 2 - 8} width="50" height="16" fill="#09090b" rx="4" />
        <text 
          x={(d1x + d2x) / 2} 
          y={(d1y + d2y) / 2 + 4} 
          fill="#10b981" 
          fontSize="9" 
          fontWeight="bold" 
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div ref={containerRef} id="foundation-diagram-container" className="flex flex-col items-center rounded-xl p-6 border w-full select-none shadow-2xl transition-all" style={{ background: 'radial-gradient(circle at center, #18181b, #09090b)', borderColor: '#27272a' }}>
      <div className="flex justify-between w-full mb-2">
        <div>
          <h4 className="text-white font-bold text-xs flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
            VISTA ISOMÉTRICA TÉCNICA
          </h4>
          <p className="text-[9px] text-zinc-500 uppercase tracking-tighter mt-1">Escala visual baseada no pré-dimensionamento</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-mono text-[9px] border border-green-500/20">{type}</span>
        </div>
      </div>

      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={() => setIsDragging(false)}
        className="cursor-move drop-shadow-2xl"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
        </defs>

        <g opacity="0.15">
          {grid.map((l, i) => (
            <line key={i} x1={l.p1.x} y1={l.p1.y} x2={l.p2.x} y2={l.p2.y} stroke="#52525b" strokeWidth="0.5" />
          ))}
        </g>

        {drawBox(-b, b, -b, b, 0, h, "#166534")}
        {drawBox(-pw, pw, -pl, pl, h, ph, "#22c55e")}

        {drawDim(project(-b, b, 0), project(b, b, 0), `L=${baseL.toFixed(2)}m`, 40)}
        {drawDim(project(b, b, 0), project(b, -b, 0), `B=${baseL.toFixed(2)}m`, 40)}
        {drawDim(project(-b, -b, 0), project(-b, -b, h), `h=${thicknessH.toFixed(2)}m`, -40)}
      </svg>
      
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-900 border border-green-700"></div>
          <span className="text-[9px] text-zinc-400 font-mono">CONCRETO MAGRO/SAPATA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 border border-green-400"></div>
          <span className="text-[9px] text-zinc-400 font-mono">PILAR</span>
        </div>
      </div>
      
      <p className="mt-4 italic flex items-center gap-2" style={{ fontSize: '9px', color: '#52525b' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.037 4.437l1.576 17.06a.5.5 0 0 0 .862.336l4.432-4.432 4.565 4.565a.5.5 0 0 0 .707 0l2.828-2.828a.5.5 0 0 0 0-.707l-4.566-4.566 4.432-4.432a.5.5 0 0 0-.336-.862L4.437 4.037a.5.5 0 0 0-.4.4z"/></svg>
        Arraste em qualquer direção para rotacionar o modelo
      </p>
    </div>
  );
}
