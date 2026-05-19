'use client';

import React from 'react';

export function Loader({ progress = 100, status = "LOADING..." }: { progress?: number; status?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050510]">
      <div className="text-center w-full max-w-md px-10">
        <div className="font-orbitron text-2xl font-black text-white tracking-[0.3em] mb-8 animate-pulse">
          TERMINAL<span className="text-[#00f3ff]">8</span>
        </div>
        
        <div className="w-full h-1 bg-[#0f1026] relative overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-[#00f3ff] transition-all duration-300 shadow-[0_0_15px_#00f3ff]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <div className="font-pixel text-[10px] text-gray-500 mb-8 tracking-widest uppercase">
          {status}
        </div>
        
        <div className="flex justify-center gap-2">
          {[
            'bg-[#00f3ff]', 'bg-[#ff00ea]', 'bg-[#ffea00]', 'bg-[#00ff55]', 
            'bg-[#ff5e00]', 'bg-[#b026ff]', 'bg-[#00f3ff]', 'bg-[#ff00ea]'
          ].map((color, i) => (
            <span 
              key={i} 
              className={`w-3 h-3 ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)] animate-bounce`} 
              style={{ animationDelay: `${i * 0.1}s` }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
