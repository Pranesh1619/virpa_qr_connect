import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virpa Connect | Scan & Capture Leads",
  description: "Scan the QR code to connect and submit your details to Virpa.",
  icons: {
    icon: "/virpa-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F7F8FA] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
