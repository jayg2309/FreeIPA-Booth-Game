import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { pin } = req.body ?? {};

  if (typeof pin !== "string" || pin !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("scores")
    .select("name, email, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ entries: data ?? [] });
}
