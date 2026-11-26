import type { Metadata } from "next";

// Yönetim alanı hiçbir zaman indekslenmez ve arama sonuçlarında önbelleğe alınmaz.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
