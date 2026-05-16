'use client';

import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  borderColor?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, borderColor = '#00f3ff', children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a1a] rounded-xl w-full max-w-md shadow-2xl overflow-hidden" style={{ border: `2px solid ${borderColor}` }}>
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="font-orbitron text-white text-xl uppercase tracking-tighter">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
