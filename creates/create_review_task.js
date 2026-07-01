const perform = async (z, bundle) => {
  const baseUrl = (bundle.authData.baseUrl || "https://loopquest.tomphillips.uk").replace(/\/+$/, "");
  const i = bundle.inputData;

  const payload = { content: i.content, body: i.content };
  if (i.claim) payload.claim = i.claim;
  if (i.sourceText) payload.source = i.sourceText;

  const body = {
    module: i.module || "swiper",
    mode: i.mode || "monitor",
    payload,
  };
  if (i.title || i.content) {
    body.card = { title: i.title || "Review", body: i.content };
  }
  ["source", "external_id", "callback_url", "on_timeout"].forEach((k) => {
    if (i[k]) body[k] = i[k];
  });
  if (i.timeout_seconds) body.timeout_seconds = i.timeout_seconds;
  if (i.reviews_required) body.reviews_required = i.reviews_required;

  const response = await z.request({
    url: `${baseUrl}/api/v1/tasks`,
    method: "POST",
    body,
    headers: i.idempotency_key ? { "idempotency-key": i.idempotency_key } : {},
  });
  return response.data;
};

module.exports = {
  key: "create_review_task",
  noun: "Review Task",
  display: {
    label: "Create Review Task",
    description:
      "Send AI/automation output to a human. Gate a downstream action until it's approved, or monitor quality in the background. Pair Gate mode with the New Verdict trigger.",
  },
  operation: {
    inputFields: [
      { key: "content", label: "Content", type: "text", required: true, helpText: "The AI/automation output a human should review." },
      { key: "title", label: "Title", type: "string", required: false, helpText: "Optional heading shown on the review card." },
      {
        key: "module",
        label: "Game",
        type: "string",
        required: false,
        default: "swiper",
        helpText: "How the reviewer sees the item.",
        choices: {
          swiper: "Swiper — approve or reject",
          versus: "Versus — pick the better of two",
          sorter: "Sorter — bucket into categories",
          detective: "Detective — spot the problem",
          fixer: "Fixer — correct the output",
          redact: "Redact — mask sensitive text",
          grounding: "Grounding — verify a claim against a source",
        },
      },
      {
        key: "mode",
        label: "Mode",
        type: "string",
        required: false,
        default: "monitor",
        helpText: "Gate blocks a downstream action until a human approves (use with the New Verdict trigger). Monitor reviews in the background without pausing.",
        choices: { monitor: "Monitor — review in the background", gate: "Gate — block until a human approves" },
      },
      { key: "claim", label: "Claim", type: "text", required: false, helpText: "Grounding only: the statement to verify." },
      { key: "sourceText", label: "Source Text", type: "text", required: false, helpText: "Grounding only: the reference text the claim is checked against." },
      { key: "timeout_seconds", label: "Timeout (seconds)", type: "integer", required: false, helpText: "Gate only: apply the fallback below if no one reviews in time (30–2592000)." },
      {
        key: "on_timeout",
        label: "On Timeout",
        type: "string",
        required: false,
        helpText: "Gate only: what to do if the timeout is hit. Defaults to escalate (fail-closed).",
        choices: { escalate: "Escalate — flag for a human", reject: "Reject — treat as a flag", approve: "Approve — treat as approved" },
      },
      { key: "source", label: "Source", type: "string", required: false, default: "zapier", helpText: "A label for where this came from." },
      { key: "external_id", label: "External ID", type: "string", required: false, helpText: "Your own id for the item — echoed back in the New Verdict trigger so you can correlate it." },
      { key: "callback_url", label: "Callback URL", type: "string", required: false, helpText: "Optional. A single webhook for this task's verdict. Leave blank if you use the New Verdict trigger." },
      { key: "reviews_required", label: "Reviewers Required", type: "integer", required: false },
      { key: "idempotency_key", label: "Idempotency Key", type: "string", required: false },
    ],
    perform,
    sample: { id: "00000000-0000-0000-0000-000000000000", status: "pending" },
    outputFields: [
      { key: "id", label: "Task ID" },
      { key: "status", label: "Status" },
    ],
  },
};
