import { ImageResponse } from "next/og";

export const alt = "Randevum — randevu defteriniz, tek bir bağlantıda";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b5f58 0%, #0f766e 55%, #14a396 100%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none" stroke="#0f766e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="10" y="14" width="44" height="40" rx="7" />
              <path d="M10 27h44M22 8v11M42 8v11" />
              <path d="m23 40 6 6 12-13" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Randevum</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Randevu defteriniz, tek bir bağlantıda.</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>Online randevu · SMS hatırlatma · Abonelik yok · Açık kaynak</div>
        </div>
      </div>
    ),
    size,
  );
}
