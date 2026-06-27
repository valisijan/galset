import * as React from "react";

export default function PhoneNumberChanged({
  fullname = "{{ .Data.full_name }}",
  newPhone = "{{ .Phone }}",
}: {
  fullname?: string;
  newPhone?: string;
}) {
  return (
    <div
      style={{
        padding: "40px",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        borderRadius: "30px",
        maxWidth: "450px",
        margin: "0 auto",
        backgroundColor: "#0d0d0d",
        textAlign: "left",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <img
          src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/logo/galset-logo-full.svg"
          alt="Galset Logo"
          style={{ height: "40px", margin: "0 auto" }}
        />
      </div>

      <p style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "bold" }}>
        Zdravo {fullname},
      </p>

      <p style={{ fontSize: "15px", marginBottom: "16px", lineHeight: "1.5" }}>
        Broj telefona na vašem nalogu je uspešno promenjen.
      </p>

      <p>
        <span style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>Novi broj telefona:</span>
        <span style={{ fontSize: "16px", color: "#6366f1", fontWeight: "bold" }}>{newPhone}</span>
      </p>

      <p style={{ fontSize: "15px", marginBottom: "24px", lineHeight: "1.5" }}>
        Ako vi niste zatražili promenu broja telefona, molimo vas da odmah kontaktirate našu podršku i zaštitite svoj nalog.
      </p>

      <p style={{ fontSize: "15px", marginTop: "32px" }}>
        Hvala,<br />
        Galset
      </p>

      <p style={{ fontSize: "15px", marginBottom: "24px", marginTop: "40px", lineHeight: "1.5" }}>
        Imaš pitanje ili ti je potrebna pomoć? Naš tim za podršku je tu da ti pomogne u svakom trenutku. Poseti naš <a href="https://help.galset.com" style={{ color: "#6366f1", textDecoration: "none" }}>Centar za pomoć</a> ili nam piši direktno na <a href="mailto:support@galset.com" style={{ color: "#6366f1", textDecoration: "none" }}>support@galset.com</a> email.
      </p>

      <div style={{ marginTop: "30px", marginBottom: "30px", textAlign: "center" }}>
        <a href="https://instagram.com/galsetcom" style={{ margin: "0 8px" }}>
          <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/instagram.svg" alt="Instagram" style={{ width: "24px", height: "24px" }} />
        </a>
        <a href="https://facebook.com/galsetcom" style={{ margin: "0 8px" }}>
          <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/facebook.svg" alt="Facebook" style={{ width: "24px", height: "24px" }} />
        </a>
        <a href="https://youtube.com/@galsetcom" style={{ margin: "0 8px" }}>
          <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/youtube.svg" alt="YouTube" style={{ width: "24px", height: "24px" }} />
        </a>
        <a href="https://tiktok.com/@galsetcom" style={{ margin: "0 8px" }}>
          <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/tiktok.svg" alt="TikTok" style={{ width: "24px", height: "24px" }} />
        </a>
        <a href="https://x.com/galsetcom" style={{ margin: "0 8px" }}>
          <img src="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/social/x.svg" alt="X" style={{ width: "24px", height: "24px" }} />
        </a>
      </div>

      <div style={{ borderTop: "1px solid #333", paddingTop: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#6f6f6f", margin: "0" }}>
          © 2026 Galset. Sva prava zadržana.
        </p>
      </div>
    </div>
  );
}
