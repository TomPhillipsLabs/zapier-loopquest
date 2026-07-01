const base = (bundle) =>
  (bundle.authData.baseUrl || "https://loopquest.tomphillips.uk").replace(/\/+$/, "");

// Zapier gives us a target URL; register it as a verdict subscription. LoopQuest
// then POSTs every resolved verdict here. Idempotent by URL server-side.
const subscribeHook = async (z, bundle) => {
  const response = await z.request({
    url: `${base(bundle)}/api/v1/hooks`,
    method: "POST",
    body: { url: bundle.targetUrl },
  });
  return response.data; // { id, url, event }
};

const unsubscribeHook = async (z, bundle) => {
  const hookId = bundle.subscribeData && bundle.subscribeData.id;
  await z.request({ url: `${base(bundle)}/api/v1/hooks/${hookId}`, method: "DELETE" });
  return {};
};

// Inbound verdict — hand the parsed body straight to the Zap.
const perform = async (z, bundle) => [bundle.cleanedRequest];

// Sample / "test trigger": most recent resolved verdicts for this workspace.
const performList = async (z, bundle) => {
  const response = await z.request({ url: `${base(bundle)}/api/v1/verdicts` });
  return response.data;
};

module.exports = {
  key: "new_verdict",
  noun: "Verdict",
  display: {
    label: "New Verdict",
    description:
      "Triggers when a human reviewer resolves a task — approve, flag, escalate or timeout. Use it to resume a gated action or act on a monitored review.",
  },
  operation: {
    type: "hook",
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform,
    performList,
    sample: {
      task_id: "00000000-0000-0000-0000-000000000000",
      external_id: "order-42",
      module: "swiper",
      source: "zapier",
      verdict: true,
      choice: null,
      reason: null,
      escalated: false,
      timed_out: false,
      reviewed_at: "2026-01-01T00:00:00Z",
    },
    outputFields: [
      { key: "task_id", label: "Task ID" },
      { key: "external_id", label: "External ID" },
      { key: "module", label: "Game" },
      { key: "source", label: "Source" },
      { key: "verdict", label: "Approved", type: "boolean" },
      { key: "choice", label: "Choice" },
      { key: "reason", label: "Reason" },
      { key: "escalated", label: "Escalated", type: "boolean" },
      { key: "timed_out", label: "Timed Out", type: "boolean" },
      { key: "reviewed_at", label: "Reviewed At", type: "datetime" },
    ],
  },
};
