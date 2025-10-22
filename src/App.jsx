import React, { useEffect, useMemo, useState } from 'react';
import { emailAccountsAPI } from './lib/supabase';
import GmailConnect from './components/GmailConnect';

const N8N_URL = import.meta.env.VITE_N8N_LEAD_INTAKE_URL || '';
const API_BASE = import.meta.env.VITE_API_BASE || '';

const TEMPLATES = [
  // EXISTING — Sales
  {
    id: 'sales',
    name: 'Sales Assistant',
    description: 'Qualifies inbound leads and drafts concise replies.',
    systemPrompt: `
You are an AI Sales Qualification and Response Agent named "Neutron AI".
1) Qualify inbound leads, 2) identify intent/priority, 3) generate a customized reply.

Use the provided lead fields (name, email, company, message, source).

Rules for "priority":
- high: clear buying intent, budget authority, urgent timeline, enterprise
- medium: interest but unclear urgency/fit
- low: vague inquiry, non-business, unlikely buyer

Rules for "tone": friendly (SMBs/startups), professional (enterprise), concise (direct/technical)

Reply requirements:
- 3–5 sentences
- Personalize by referencing the lead’s message
- Clear value + a call-to-action (book a call, share details, etc.)
- Paragraphs with double line breaks
- End with:
Best regards,
Neutron AI

Return ONLY this JSON:
{
  "priority": "low|medium|high",
  "topic": "short keyword",
  "intent": "sales",
  "tone": "friendly|professional|concise",
  "reply": "<full formatted email incl. signature>"
}`
  },

  // NEW — Support Triage
  {
    id: 'support',
    name: 'Support Triage',
    description: 'Routes issues, requests missing info, suggests fixes.',
    systemPrompt: `
You are "Neutron AI", a Support Triage and First Response agent.
Classify the inbound request and draft a helpful reply.

Intent should be "support". Topic examples: "billing", "bug", "how_to", "account".
Priority:
- high: outage, data loss, security concern, blocked launch
- medium: bug with workaround, feature confusion
- low: minor how-to, general question

Reply requirements:
- 3–5 sentences
- Acknowledge issue; ask for missing repro details if needed (OS, steps, screenshots)
- Offer an immediate suggestion or workaround when possible
- Include ticket escalation promise if severe
- Paragraphs + signature:
Best regards,
Neutron AI

Return ONLY this JSON:
{
  "priority": "low|medium|high",
  "topic": "short keyword",
  "intent": "support",
  "tone": "friendly|professional|concise",
  "reply": "<full formatted email incl. signature>"
}`
  },

  // NEW — Demo Scheduler
  {
    id: 'demo',
    name: 'Demo Scheduler',
    description: 'Warms interest and proposes concrete demo times.',
    systemPrompt: `
You are "Neutron AI", a Demo Scheduler.
Qualify interest and propose specific demo times.

Priority:
- high: asks for demo, shares timeline/budget, enterprise domain
- medium: interested but vague on timeline
- low: exploratory

Reply requirements:
- 3–5 sentences
- Confirm interest & value points relevant to their message
- Propose 2–3 concrete 30-min slots this week (use the recipient’s timezone if known)
- Include a calendar link if provided in metadata
- Paragraphs + signature:
Best regards,
Neutron AI

Return ONLY this JSON:
{
  "priority": "low|medium|high",
  "topic": "demo request",
  "intent": "demo_request",
  "tone": "friendly|professional|concise",
  "reply": "<full formatted email incl. signature>"
}`
  },

  // NEW — Partnership Outreach
  {
    id: 'partner',
    name: 'Partnership Agent',
    description: 'Assesses collaboration fit and proposes next steps.',
    systemPrompt: `
You are "Neutron AI", a Partnership Intake agent.
Assess partnership fit and suggest next steps.

Priority:
- high: credible company, clear proposal, mutual value
- medium: interesting but unclear scope/benefits
- low: generic outreach, misaligned

Reply requirements:
- 3–5 sentences
- Acknowledge specifics of their idea
- Ask for the 1–2 most relevant details (audience size, distribution, mutual goals)
- Propose a short intro call or async info exchange
- Paragraphs + signature:
Best regards,
Neutron AI

Return ONLY this JSON:
{
  "priority": "low|medium|high",
  "topic": "partnership inquiry",
  "intent": "partnership",
  "tone": "friendly|professional|concise",
  "reply": "<full formatted email incl. signature>"
}`
  },

  // NEW — Customer Success / Onboarding
  {
    id: 'csm',
    name: 'Onboarding Assistant',
    description: 'Guides new customers to first value and next steps.',
    systemPrompt: `
You are "Neutron AI", a Customer Success Onboarding assistant.
Guide new users to first value and next steps.

Priority:
- high: paid sign-up or enterprise onboarding
- medium: trial user with clear use case
- low: exploratory, no concrete goal

Reply requirements:
- 3–5 sentences
- Congratulate/Welcome
- Outline 2–3 first steps tailored to their message (connect data, invite team, key feature)
- Offer a success call link if applicable
- Paragraphs + signature:
Best regards,
Neutron AI

Return ONLY this JSON:
{
  "priority": "low|medium|high",
  "topic": "onboarding",
  "intent": "sales",
  "tone": "friendly|professional|concise",
  "reply": "<full formatted email incl. signature>"
}`
  }
];

export default function App() {
  const [templateId, setTemplateId] = useState('sales');
  const tpl = useMemo(() => TEMPLATES.find(t => t.id === templateId), [templateId]);

  const [agentName, setAgentName] = useState('Neutron Sales Agent');
  const [systemPrompt, setSystemPrompt] = useState(TEMPLATES[0].systemPrompt);
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [memoryStrategy, setMemoryStrategy] = useState('light'); // light|session|long

  // Email Account Settings
  const [userEmail, setUserEmail] = useState('support@yourdomain.com');
  const [userName, setUserName] = useState('Your Name');
  const [userCompany, setUserCompany] = useState('Your Company');
  const [emailSignature, setEmailSignature] = useState('Best regards,\nThe Team');
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [savingAccount, setSavingAccount] = useState(false);

  const [testEmail, setTestEmail] = useState('john.doe@example.com');
  const [testCompany, setTestCompany] = useState('Acme Corp');
  const [testMessage, setTestMessage] = useState('We are interested in deploying AI agents for sales automation.');

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // Load saved email accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      const userId = 'default-user'; // You can replace this with actual user auth later
      const result = await emailAccountsAPI.getAll(userId);
      if (result.success && result.data.length > 0) {
        setSavedAccounts(result.data);
        // Load the default account if it exists
        const defaultAccount = result.data.find(acc => acc.is_default);
        if (defaultAccount) {
          setUserEmail(defaultAccount.email);
          setUserName(defaultAccount.name);
          setUserCompany(defaultAccount.company);
          setEmailSignature(defaultAccount.signature || '');
        }
      }
    }
    loadAccounts();
  }, []);

  async function saveEmailAccount() {
    setSavingAccount(true);
    try {
      const userId = 'default-user'; // You can replace this with actual user auth later
      const result = await emailAccountsAPI.save({
        userId,
        email: userEmail,
        name: userName,
        company: userCompany,
        signature: emailSignature,
        isDefault: savedAccounts.length === 0 // First account is default
      });

      if (result.success) {
        okToast('Email account saved!');
        // Reload accounts
        const allAccounts = await emailAccountsAPI.getAll(userId);
        if (allAccounts.success) {
          setSavedAccounts(allAccounts.data);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      errToast(e.message || 'Failed to save account');
    } finally {
      setSavingAccount(false);
    }
  }

  function loadSavedAccount(account) {
    setUserEmail(account.email);
    setUserName(account.name);
    setUserCompany(account.company);
    setEmailSignature(account.signature || '');
    okToast('Account loaded!');
  }

  function pickTemplate(id) {
    setTemplateId(id);
    const t = TEMPLATES.find(x => x.id === id);
    setSystemPrompt(t?.systemPrompt ?? '');
    setAgentName(id === 'custom' ? 'Custom Agent' : `Neutron ${t?.name ?? ''}`);
  }

  async function createAgent() {
    setBusy(true);
    try {
      await new Promise(r => setTimeout(r, 250));
      okToast('Agent created');
      return { agentId: crypto.randomUUID() };
    } catch (e) {
      errToast(e.message || 'Create failed');
    } finally { setBusy(false); }
  }

  async function deployAgent(agentId) {
    setBusy(true);
    try {
      await new Promise(r => setTimeout(r, 250));
      okToast('Agent deployed');
      return true;
    } catch (e) {
      errToast(e.message || 'Deploy failed');
    } finally { setBusy(false); }
  }

  async function runTest(agentId) {
    setBusy(true);
    try {
      if (!N8N_URL) throw new Error('Missing VITE_N8N_LEAD_INTAKE_URL');
      const payload = {
        agentId,
        leadName: 'John Doe',
        leadEmail: testEmail,
        company: testCompany,
        message: testMessage,
        source: 'canvas_test',
        meta: {
          templateId,
          gmailEnabled,
          memoryStrategy,
          agentName,
          systemPrompt,
          // Email Account Settings
          emailAccount: {
            userEmail,
            userName,
            userCompany,
            emailSignature
          }
        }
      };
      const res = await fetch(N8N_URL, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`n8n ${res.status}`);
      okToast('Test sent to n8n');
    } catch (e) {
      errToast(e.message || 'Test failed');
    } finally { setBusy(false); }
  }

  function okToast(msg){ setToast({type:'ok', msg}); setTimeout(()=>setToast(null), 2200); }
  function errToast(msg){ setToast({type:'err', msg}); setTimeout(()=>setToast(null), 3500); }

  return (
    <div className="min-h-screen grid grid-cols-[320px_1fr] bg-[#0b0b0c] text-white">
      {/* Sidebar */}
      <aside className="border-r border-white/10 p-5 space-y-4 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-white/10 grid place-items-center">NA</div>
          <div>
            <div className="text-sm text-white/60">Neutron</div>
            <div className="font-semibold">Agent Builder</div>
          </div>
        </div>

        <div className="mt-6 text-xs uppercase tracking-wider text-white/50">Templates</div>
        <div className="space-y-2">
          {TEMPLATES.map(t => (
            <button
            type="button"
            key={t.id}
            onClick={() => pickTemplate(t.id)}
            aria-pressed={templateId === t.id}
            aria-current={templateId === t.id ? 'true' : undefined}
            className={[
              "w-full text-left p-3 rounded-lg transition",
              "bg-white/5 hover:bg-white/10",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              templateId === t.id ? "ring-2 ring-white/20" : ""
            ].join(" ")}
          >
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-white/60">{t.description}</div>
          </button>
          ))}
        </div>

        <div className="mt-6 text-xs uppercase tracking-wider text-white/50">Shortcuts</div>
        <div className="grid gap-2">
          <button className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10">New Agent</button>
          <button className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10">Settings</button>
        </div>
      </aside>

      {/* Main */}
      <main className="p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{agentName}</h1>
            <div className="text-white/60 text-sm">OpenAI-style builder • No code required</div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={async ()=>{ const a = await createAgent(); if(a?.agentId) await deployAgent(a.agentId); }}
              className="px-4 py-2 rounded bg-white text-black font-medium hover:opacity-90 disabled:opacity-50">
              {busy ? 'Working…' : 'Create & Deploy'}
            </button>
            <button
              disabled={busy}
              onClick={async ()=>{ const a = await createAgent(); if(a?.agentId) await runTest(a.agentId); }}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50">
              {busy ? 'Testing…' : 'Run Test'}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="text-sm text-white/70">Configuration</div>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-white/60">Agent Name</span>
                <input value={agentName} onChange={e=>setAgentName(e.target.value)} className="bg-white/5 rounded p-2 outline-none border border-white/10"/>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-white/60">System Prompt</span>
                <textarea rows={8} value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)} className="bg-white/5 rounded p-2 outline-none border border-white/10"/>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={gmailEnabled} onChange={e=>setGmailEnabled(e.target.checked)}/>
                  <span className="text-sm">Gmail Replies</span>
                </label>
                <label className="grid gap-1 col-span-2">
                  <span className="text-xs text-white/60">Memory Strategy</span>
                  <select value={memoryStrategy} onChange={e=>setMemoryStrategy(e.target.value)} className="bg-white/5 rounded p-2 border border-white/10">
                    <option value="light">Light</option>
                    <option value="session">Session</option>
                    <option value="long">Long-term</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-white/70">Test Payload</div>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-white/60">Lead Email</span>
                <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} className="bg-white/5 rounded p-2 border border-white/10"/>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-white/60">Company</span>
                <input value={testCompany} onChange={e=>setTestCompany(e.target.value)} className="bg-white/5 rounded p-2 border border-white/10"/>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-white/60">Message</span>
                <textarea rows={6} value={testMessage} onChange={e=>setTestMessage(e.target.value)} className="bg-white/5 rounded p-2 border border-white/10"/>
              </label>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 pt-6">
          <div className="space-y-4">
            <div className="text-sm text-white/70 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Account Settings
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="grid gap-1">
                  <span className="text-xs text-white/60">Your Email Address</span>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={e=>setUserEmail(e.target.value)}
                    placeholder="support@yourdomain.com"
                    className="bg-white/5 rounded p-2 border border-white/10"/>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-white/60">Your Name</span>
                  <input
                    value={userName}
                    onChange={e=>setUserName(e.target.value)}
                    placeholder="John Smith"
                    className="bg-white/5 rounded p-2 border border-white/10"/>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-white/60">Company Name</span>
                  <input
                    value={userCompany}
                    onChange={e=>setUserCompany(e.target.value)}
                    placeholder="Your Company Inc"
                    className="bg-white/5 rounded p-2 border border-white/10"/>
                </label>
              </div>
              <div className="space-y-3">
                <label className="grid gap-1">
                  <span className="text-xs text-white/60">Email Signature</span>
                  <textarea
                    rows={7}
                    value={emailSignature}
                    onChange={e=>setEmailSignature(e.target.value)}
                    placeholder="Best regards,&#10;Your Name&#10;Your Title&#10;Company Name"
                    className="bg-white/5 rounded p-2 border border-white/10 text-sm"/>
                </label>
              </div>
            </div>

            {/* Save Account Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveEmailAccount}
                disabled={savingAccount}
                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {savingAccount ? 'Saving...' : 'Save Email Account'}
              </button>

              {savedAccounts.length > 0 && (
                <span className="text-xs text-white/50">
                  {savedAccounts.length} saved account{savedAccounts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Gmail OAuth Connect */}
            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="text-xs text-white/60 mb-3">
                Connect your Gmail to send emails from your own account:
              </div>
              <GmailConnect
                userEmail={userEmail}
                onConnected={() => okToast('Gmail connected successfully!')}
              />
            </div>

            {/* Saved Accounts List */}
            {savedAccounts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/60 mb-2">Saved Accounts</div>
                <div className="grid gap-2">
                  {savedAccounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => loadSavedAccount(account)}
                      className="text-left p-3 rounded bg-white/5 hover:bg-white/10 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{account.name}</div>
                          <div className="text-xs text-white/50">{account.email}</div>
                        </div>
                        {account.is_default && (
                          <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/60">Default</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {toast && (
          <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded ${toast.type==='ok'?'bg-white text-black':'bg-red-500 text-white'}`}>
            {toast.msg}
          </div>
        )}
      </main>
    </div>
  );
}