// PushLIMITfit — PayPal checkout Edge Function
//
// Deploy:  supabase functions deploy paypal --no-verify-jwt
// Secrets (supabase secrets set ...):
//   PAYPAL_CLIENT_ID   — REST app client id
//   PAYPAL_SECRET      — REST app secret
//   PAYPAL_ENV         — "sandbox" (default) or "live"
//   PRO_PRICE          — e.g. "9.99"   (optional, default 9.99)
//   PRO_CURRENCY       — e.g. "USD"    (optional, default USD)
//   SUPABASE_URL                — auto-provided by the platform
//   SUPABASE_SERVICE_ROLE_KEY   — auto-provided by the platform
//
// Two actions, both authenticated as the signed-in app user (JWT in the
// Authorization header):
//   { action: "create-order" }              -> { id }
//   { action: "capture-order", orderID }    -> { status, pro: true }
//
// The PayPal secret never reaches the browser, and Pro is granted only after
// PayPal confirms the capture as COMPLETED — so the client cannot fake it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") ?? "sandbox";
const PAYPAL_BASE = PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";
const PRICE = Deno.env.get("PRO_PRICE") ?? "9.99";
const CURRENCY = Deno.env.get("PRO_CURRENCY") ?? "USD";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Exchange client credentials for a short-lived PayPal access token.
async function paypalToken(): Promise<string> {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  if (!id || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // Identify the signed-in app user from the forwarded JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401);

    const { action, orderID } = await req.json().catch(() => ({}));
    const token = await paypalToken();

    // ── Create an order ──────────────────────────────────────────────
    if (action === "create-order") {
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            description: "PushLIMITfit Pro (lifetime)",
            amount: { currency_code: CURRENCY, value: PRICE },
          }],
        }),
      });
      const order = await res.json();
      if (!res.ok) return json({ error: order }, 400);
      return json({ id: order.id });
    }

    // ── Capture an order, then grant Pro ─────────────────────────────
    if (action === "capture-order") {
      if (!orderID) return json({ error: "Missing orderID" }, 400);
      const res = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const capture = await res.json();
      if (!res.ok || capture.status !== "COMPLETED") {
        return json({ error: "Payment not completed", detail: capture }, 402);
      }

      const cap = capture.purchase_units?.[0]?.payments?.captures?.[0];
      const amount = cap?.amount?.value ?? PRICE;
      const currency = cap?.amount?.value ? cap.amount.currency_code : CURRENCY;

      // Service-role client bypasses RLS to record the sale + unlock Pro.
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await admin.from("payments").insert({
        user_id: user.id,
        email: user.email,
        provider: "paypal",
        order_id: orderID,
        amount,
        currency,
        status: "completed",
      });
      await admin.from("profiles")
        .update({ is_pro: true, pro_since: new Date().toISOString() })
        .eq("id", user.id);

      return json({ status: "COMPLETED", pro: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
