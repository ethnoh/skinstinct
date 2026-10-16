import type { Metadata } from "next";
import { isAdmin } from "@/lib/security";
import { Admin, AdminLogin } from "@/components/admin";
import { DocumentLanguage } from "@/components/document-language";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administrācija",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  return (
    <>
      <DocumentLanguage lang="lv" />
      {(await isAdmin()) ? <Admin /> : <AdminLogin />}
    </>
  );
}
