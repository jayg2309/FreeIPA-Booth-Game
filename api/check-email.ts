import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body ?? {};

  if (typeof email !== "string" || !/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
    return res.status(400).json({ error: "Only Gmail addresses are allowed" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .limit(1);

  const alreadyPlayed = !!(existing && existing.length > 0);

  return res.status(200).json({ alreadyPlayed });
}
