import { redirect } from "next/navigation";
import { getMxUser } from "@/lib/mainxp/auth";

export default async function MainxpIndex() {
  const user = await getMxUser();
  redirect(user ? "/mainxp/today" : "/mainxp/login");
}
