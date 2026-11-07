import { redirect } from "next/navigation";
import { estaLogado } from "@/lib/auth";
import { lerSite } from "@/lib/armazenamento";
import { Editor } from "./Editor";

export default async function Admin() {
  if (!(await estaLogado())) redirect("/admin/login");
  return <Editor inicial={await lerSite()} />;
}
