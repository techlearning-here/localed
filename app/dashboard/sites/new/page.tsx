import { redirect } from "next/navigation";

/**
 * Redirect to the create wizard (same multi-step editor, no DB entry until Save/Publish).
 */
export default function NewSitePage() {
  redirect("/dashboard/sites/new/edit");
}
