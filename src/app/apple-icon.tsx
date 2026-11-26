import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="112" height="112" viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="14" width="44" height="40" rx="7" />
          <path d="M10 27h44M22 8v11M42 8v11" />
          <path d="m23 40 6 6 12-13" strokeWidth="4.5" />
        </svg>
      </div>
    ),
    size,
  );
}
