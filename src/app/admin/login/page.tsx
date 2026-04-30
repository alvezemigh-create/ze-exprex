import { Suspense } from "react";
import { LoginClient } from "./login-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Login — Zé Chegou 24h",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
