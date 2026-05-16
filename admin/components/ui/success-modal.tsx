'use client';

import { CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';
import { formatWhatsAppLink } from '@/lib/utils/whatsapp';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  waPhone?: string;
  waMessage?: string;
}

export function SuccessModal({ open, onClose, title, message, waPhone, waMessage }: SuccessModalProps) {
  const handleWhatsApp = () => {
    if (waPhone && waMessage) {
      window.open(formatWhatsAppLink(waPhone, waMessage), '_blank');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="SUCCESS" borderColor="#00ff55">
      <div className="p-6 text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#00ff55] blur-xl opacity-20 animate-pulse" />
          <CheckCircle2 className="w-16 h-16 text-[#00ff55] relative" />
        </div>

        <div>
          <h2 className="font-orbitron text-white text-xl font-bold mb-2">{title}</h2>
          <p className="font-mono text-gray-400 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {waPhone && waMessage && (
            <Button 
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-pixel text-[10px] py-6 flex items-center justify-center gap-3 border-none shadow-[0_0_20px_rgba(37,211,102,0.3)]"
            >
              <MessageSquare className="w-5 h-5" />
              SEND WHATSAPP BILL
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full border-gray-800 text-gray-400 hover:text-white font-mono text-xs"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
