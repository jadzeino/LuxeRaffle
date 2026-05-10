'use client';

import { useRef } from 'react';

export function RaffleCardTilt({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={cardRef}
      className="h-full [perspective:1000px] motion-reduce:[--rx:0deg] motion-reduce:[--ry:0deg]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--rx': '0deg',
          '--ry': '0deg',
          transform: 'perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry))',
          transition: 'transform 0.15s ease-out',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
