const perform = async (z, bundle) => {
  const baseUrl = (bundle.authData.baseUrl || "https://loopquest.tomphillips.uk").replace(/\/+$/, "");
  const i = bundle.inputData;

  const body = {
    module: i.module || "swiper",
    payload: { content: i.content },
  };
  if (i.title || i.content) {
    body.card = { title: i.title || "Review", body: i.content };
  }
  ["source", "external_id", "callback_url"].forEach((k) => {
    if (i[k]) body[k] = i[k];
  });
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
    description: "Send content to LoopQuest for a human to review (approve or flag).",
  },
  operation: {
    inputFields: [
      { key: "content", label: "Content", type: "text", required: true, helpText: "The output a human should review." },
      { key: "title", label: "Title", type: "string", required: false },
      {
        key: "module",
        label: "Module",
        type: "string",
        required: false,
        default: "swiper",
        choices: { swiper: "Swiper", detective: "Detective", decoy: "Decoy", arena: "Arena" },
      },
      { key: "source", label: "Source", type: "string", required: false, default: "zapier" },
      { key: "external_id", label: "External ID", type: "string", required: false, helpText: "Echoed back in the verdict webhook for correlation." },
      { key: "callback_url", label: "Callback URL", type: "string", required: false, helpText: "Where LoopQuest sends the signed verdict (e.g. a Webhooks by Zapier Catch Hook URL)." },
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
