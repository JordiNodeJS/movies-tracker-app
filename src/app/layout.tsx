import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movies Tracker",
  description: "Track, rate, and discover your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
