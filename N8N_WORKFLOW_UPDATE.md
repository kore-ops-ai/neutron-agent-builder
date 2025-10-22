# n8n Workflow Update Instructions

## What Changed?

Your app now uses **Gmail OAuth** to send emails from each user's own Gmail account. This means:

- ❌ **Before**: n8n sent emails from koreops.ai@gmail.com (shared account)
- ✅ **After**: Frontend sends emails from user's connected Gmail (e.g., spidercamholster.store@gmail.com)

## Update Your n8n Workflow

### Current Flow (OLD - needs updating):
```
Webhook → AI Agent → Send Email (Gmail node) ❌
```

### New Flow (CORRECT):
```
Webhook → AI Agent → Return Draft (no email sending) ✅
```

---

## Step-by-Step Instructions:

1. **Open your n8n workflow**:
   https://koreind.app.n8n.cloud/workflow/d1j2p2v5KVxvRCZv

2. **Remove or Disable the "Send Email" node**:
   - Click on the Gmail/Send Email node
   - Either **delete** it or **disable** it

3. **Update the final node** to return the AI draft:
   - The last node should be the AI agent node
   - Make sure it returns the JSON response with the email draft

4. **Test the workflow**:
   - Send a test webhook
   - Verify the response contains the AI-generated email draft
   - The workflow should NOT send any emails anymore

---

## Expected Response Format

Your n8n workflow should return JSON like this:

```json
{
  "priority": "high",
  "topic": "camera holster inquiry",
  "intent": "sales",
  "tone": "friendly",
  "reply": "Hi John,\n\nThank you for your interest in our camera holsters...\n\nBest regards,\nSpider Camera Holster Team"
}
```

The frontend will extract the `reply` field and send it via Gmail API using the user's connected Gmail account.

---

## Benefits of This Approach:

✅ **Multi-tenant**: Each user sends from their own Gmail
✅ **Secure**: No shared Gmail credentials
✅ **Production-ready**: Scales to unlimited users
✅ **Compliant**: Users control their own email sending

---

## Need Help?

If you have questions about updating your n8n workflow, let me know!
