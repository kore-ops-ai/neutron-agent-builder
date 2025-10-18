import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const {
  PORT = 8787,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  N8N_DEPLOY_WEBHOOK_URL,    // e.g. https://<your-subdomain>.n8n.cloud/webhook/agent-deploy
  N8N_LEAD_INTAKE_WEBHOOK_URL // e.g. https://<your-subdomain>.n8n.cloud/webhook/lead-intake
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = express();
app.use(cors());
app.use(bodyParser.json());

// create & deploy an agent
app.post("/api/agents", async (req, res) => {
  try {
    const { name = "Lead Follow-Up Agent", config = {} } = req.body;

    // 1) persist agent in supabase
    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        name,
        status: "deploying",
        config
      })
      .select()
      .single();

    if (error) throw error;

    // 2) call n8n deploy hook (pass agentId + config)
    if (!N8N_DEPLOY_WEBHOOK_URL) {
      console.warn("N8N_DEPLOY_WEBHOOK_URL not set; skipping deploy call.");
    } else {
      await fetch(N8N_DEPLOY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          config,
          leadIntakeUrl: N8N_LEAD_INTAKE_WEBHOOK_URL
        })
      });
    }

    // 3) mark as active
    await supabase.from("agents").update({ status: "active" }).eq("id", agent.id);

    res.json({ ok: true, agentId: agent.id, status: "active" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// status endpoint (reads latest runs)
app.get("/api/agents/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: runs, error } = await supabase
      .from("agent_runs")
      .select("*")
      .eq("agent_id", id)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;
    res.json({ ok: true, runs });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
