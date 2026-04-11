import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book tid | Neglebiksen",
  description: "Book din behandling nemt og hurtigt online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
