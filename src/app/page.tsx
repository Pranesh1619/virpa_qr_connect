"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

export default function HomePage() {
  const [formUrl, setFormUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      setFormUrl(`${window.location.origin}/form`);
    } else if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
      setFormUrl(`${process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "")}/form`);
    } else {
      setFormUrl(`${window.location.origin}/form`);
    }
  }, []);

  return (
    <div className="virpa-container">
      <div className="virpa-card text-center" style={{ maxWidth: "380px", padding: "36px 24px" }}>
        {/* Virpa Brand Logo & Name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#F4F1FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #EAE5FF",
              boxShadow: "0 2px 8px rgba(118, 87, 232, 0.08)",
              marginBottom: "8px",
            }}
          >
            <Image
              src="/virpa-logo.png"
              alt="Virpa Logo"
              width={42}
              height={42}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#17191D", letterSpacing: "-0.2px" }}>
            Virpa Connect
          </span>
          <p style={{ fontSize: "13.5px", color: "#667085", margin: "6px 0 0 0" }}>
            Scan this QR code with your phone camera to share your contact details.
          </p>
        </div>

        {/* Clean QR Code Container */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid #E9ECF1",
            boxShadow: "0 4px 20px rgba(16, 24, 40, 0.06)",
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          {mounted && formUrl ? (
            <div style={{ width: "240px", height: "240px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <QRCodeSVG
                value={formUrl}
                size={240}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/virpa-logo.png",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
          ) : (
            <div style={{ width: "240px", height: "240px", display: "flex", alignItems: "center", justifyContent: "center", color: "#98A2B3" }}>
              Generating QR...
            </div>
          )}
        </div>

        <p style={{ fontSize: "12px", color: "#98A2B3", margin: 0 }}>
          Powered by Virpa Intelligence
        </p>
      </div>
    </div>
  );
}
