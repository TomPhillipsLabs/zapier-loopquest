// API-key auth. The connection test pings GET /api/v1/me, which returns the
// workspace the key maps to (used as the connection label).
module.exports = {
  type: "custom",
  fields: [
    {
      key: "apiKey",
      label: "API Key",
      type: "password",
      required: true,
      helpText: "Your LoopQuest workspace API key (Workspaces -> API keys).",
    },
    {
      key: "baseUrl",
      label: "Base URL",
      type: "string",
      required: false,
      default: "https://loopquest.tomphillips.uk",
      helpText: "Your LoopQuest deployment URL.",
    },
  ],
  test: {
    url: "{{bundle.authData.baseUrl}}/api/v1/me",
    method: "GET",
  },
  connectionLabel: "{{workspace}}",
};
