import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Nav from "./shell/Nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Medi-AI Connect — Demo (SIMULATED)",
  description:
    "Offline-first health operations demo: geospatial insights, clinician-in-the-loop AI review, edge sync. All data simulated.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = cookies().get("medi_role")?.value;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav role={role} />
        {children}
      </body>
    </html>
  );
}
