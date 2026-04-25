import React from 'react';

export const TopographicPattern = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 h-96 overflow-hidden pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1440 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-30"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 400C300 380 400 320 600 340C800 360 900 400 1200 380C1500 360 1440 340 1440 340V400H0Z"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M0 360C250 340 350 280 550 300C750 320 850 360 1150 340C1450 320 1440 300 1440 300V400H0V360Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.2"
        />
        <path
          d="M0 320C200 300 300 240 500 260C700 280 800 320 1100 300C1400 280 1440 260 1440 260"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.15"
        />
        <path
          d="M0 280C150 260 250 200 450 220C650 240 750 280 1050 260C1350 240 1440 220 1440 220"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.1"
        />
        {/* Curvas más orgánicas tipo mapa topográfico */}
        <path d="M100 150 Q 150 100 200 150 T 300 150" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        <path d="M80 160 Q 150 110 220 160 T 320 160" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        <path d="M60 170 Q 150 120 240 170 T 340 170" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        
        <path d="M1100 100 Q 1200 50 1300 100 T 1400 100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        <path d="M1080 110 Q 1200 60 1320 110 T 1420 110" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        <path d="M1060 120 Q 1200 70 1340 120 T 1440 120" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
      </svg>
    </div>
  );
};
