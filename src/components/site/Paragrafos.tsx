export function Paragrafos({ texto, className }: { texto: string; className?: string }) {
  const blocos = texto.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocos.map((b, i) => (
        <p key={i} className={className}>
          {b.split("\n").map((linha, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {linha}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}
