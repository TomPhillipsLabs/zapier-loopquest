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
      helpText:
        "Your LoopQuest workspace API key. Create one under Workspaces → your project → API keys. See [the API reference](https://loopquest.tomphillips.uk/docs) for details.",
    },
  ],
  test: {
    url: "https://loopquest.tomphillips.uk/api/v1/me",
    method: "GET",
  },
  connectionLabel: "{{workspace}}",
};
