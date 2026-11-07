"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function CampoSenha({ name = "senha", autoComplete = "current-password" }: { name?: string; autoComplete?: string }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <span className="adm-senha">
      <input type={visivel ? "text" : "password"} name={name} required autoComplete={autoComplete} />
      <button
        type="button"
        className="adm-senha__ver"
        onClick={() => setVisivel(!visivel)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        title={visivel ? "Ocultar senha" : "Mostrar senha"}
      >
        {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  );
}
