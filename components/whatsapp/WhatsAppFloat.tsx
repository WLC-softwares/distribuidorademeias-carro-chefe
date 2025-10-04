"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false);
  // IMPORTANTE: Variáveis para o cliente devem começar com NEXT_PUBLIC_
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511961667767";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20mais%20informações.`;

  return (
    <a
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      href={whatsappUrl}
      rel="noopener noreferrer"
      style={{
        padding: isHovered ? "12px 20px 12px 12px" : "12px",
      }}
      target="_blank"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ícone do WhatsApp */}
      <div className="relative">
        <MessageCircle
          className="transition-transform duration-300 group-hover:scale-110"
          fill="white"
          size={32}
          strokeWidth={1.5}
        />
        {/* Indicador de pulso */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300" />
        </span>
      </div>

      {/* Texto que aparece no hover */}
      <span
        className="font-medium whitespace-nowrap transition-all duration-300 overflow-hidden"
        style={{
          maxWidth: isHovered ? "200px" : "0px",
          opacity: isHovered ? 1 : 0,
        }}
      >
        Fale conosco
      </span>
    </a>
  );
}
