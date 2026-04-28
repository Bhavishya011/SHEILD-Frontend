import { useRef, useEffect, useState } from 'react';
import { cctvPersons, unknownPersons, cameraZones } from '../lib/mockData';

function drawFeed(ctx, width, height, zone, persons, showUnknown, tick) {
  // Dark background with subtle noise
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, width, height);

  // Grid lines for "camera" feel
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
  }
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
  }

  // Timestamp
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '10px monospace';
  ctx.fillText(new Date().toLocaleTimeString(), 8, 14);
  ctx.fillText(`CAM: ${zone}`, 8, height - 8);

  // REC indicator
  if (Math.floor(tick / 30) % 2 === 0) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(width - 16, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.font = '9px monospace';
    ctx.fillText('REC', width - 40, 15);
  }

  // Draw persons
  const zonePersons = persons.filter(p => p.cameraZone === zone);
  zonePersons.forEach(p => {
    const wobbleX = Math.sin(tick * 0.03 + p.x) * 3;
    const wobbleY = Math.cos(tick * 0.02 + p.y) * 2;
    const px = p.x + wobbleX;
    const py = p.y + wobbleY;

    // Glow
    const gradient = ctx.createRadialGradient(px, py, 2, px, py, 14);
    gradient.addColorStop(0, p.color + '80');
    gradient.addColorStop(1, p.color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dot
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px monospace';
    ctx.fillText(p.type.toUpperCase(), px + 8, py + 3);
  });

  // Unknown persons (flash during crisis)
  if (showUnknown) {
    const unknowns = unknownPersons.filter(p => p.cameraZone === zone);
    unknowns.forEach(p => {
      const wobbleX = Math.sin(tick * 0.05 + p.x) * 5;
      const wobbleY = Math.cos(tick * 0.04 + p.y) * 4;
      const px = p.x + wobbleX;
      const py = p.y + wobbleY;

      const flash = Math.sin(tick * 0.15) > 0;
      if (flash) {
        const gradient = ctx.createRadialGradient(px, py, 2, px, py, 20);
        gradient.addColorStop(0, '#ef444480');
        gradient.addColorStop(1, '#ef444400');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = flash ? '#ef4444' : '#991b1b';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('UNKNOWN', px + 10, py + 3);
    });
  }
}

function CameraFeed({ zone, showUnknown, isAffected }) {
  const canvasRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const animate = () => {
      tickRef.current++;
      drawFeed(ctx, canvas.width, canvas.height, zone, cctvPersons, showUnknown, tickRef.current);
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [zone, showUnknown]);

  return (
    <div className={`cctv-feed rounded-xl overflow-hidden ${isAffected ? 'ring-2 ring-red-500 animate-pulse-crisis' : 'ring-1 ring-slate-700'}`}>
      <canvas ref={canvasRef} width={320} height={240} className="w-full h-auto" />
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-slate-300 font-mono">
        {zone}
      </div>
    </div>
  );
}

export default function CCTVOverlay({ activeCrisis }) {
  const affectedZone = activeCrisis?.zone || '';
  const showUnknown = !!activeCrisis;

  return (
    <div>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 text-amber-400 text-sm flex items-center gap-2">
        <span className="font-semibold">⚠ PUBLIC AREAS ONLY</span> — Rooms and private spaces excluded
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {cameraZones.map(zone => (
          <CameraFeed
            key={zone}
            zone={zone}
            showUnknown={showUnknown}
            isAffected={affectedZone.toLowerCase().includes(zone.toLowerCase().split(' ')[0])}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Staff</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Guest</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse" /> Unmatched Individual</span>
      </div>
    </div>
  );
}
