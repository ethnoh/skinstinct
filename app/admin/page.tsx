import type { Metadata } from "next";
import { isAdmin } from "@/lib/security";
import { Admin, AdminLogin } from "@/components/admin";
import "./admin.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Administrācija",robots:{index:false,follow:false}};
export default async function AdminPage(){return await isAdmin()?<Admin/>:<AdminLogin/>;}
