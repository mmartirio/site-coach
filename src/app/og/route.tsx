import { ImageResponse } from "next/og";
import { lerSite } from "@/lib/armazenamento";

export const dynamic = "force-dynamic";

// Imagem de compartilhamento (1200×630) gerada com o nome, o título e as cores do tema.
// Usada quando o painel não tem imagem de compartilhamento nem foto no topo.
export async function GET() {
  const { info, topo, tema } = await lerSite();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: `linear-gradient(135deg, ${tema.corPrimaria}, ${tema.corPrimariaEscura})`,
          color: tema.corTextoBotao,
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", opacity: 0.85 }}>{info.titulo}</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 20, lineHeight: 1.1 }}>{info.nome}</div>
        <div style={{ fontSize: 36, marginTop: 28, maxWidth: 900, opacity: 0.9, lineHeight: 1.3 }}>{topo.titulo}</div>
        <div style={{ position: "absolute", right: 80, bottom: 80, width: 120, height: 120, borderRadius: 999, background: tema.corDestaque, opacity: 0.85 }} />
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
