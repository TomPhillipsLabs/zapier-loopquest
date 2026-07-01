const authentication = require("./authentication");
const createReviewTask = require("./creates/create_review_task");
const newVerdict = require("./triggers/new_verdict");
const { version } = require("./package.json");
const platformVersion = require("zapier-platform-core").version;

// Attach the bearer token to every request (including the auth test).
const includeBearer = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.apiKey) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`;
  }
  return request;
};

module.exports = {
  version,
  platformVersion,
  authentication,
  // Don't auto-strip input — pass exactly what the user mapped (predictability).
  flags: { cleanInputData: false },
  beforeRequest: [includeBearer],
  triggers: {
    [newVerdict.key]: newVerdict,
  },
  creates: {
    [createReviewTask.key]: createReviewTask,
  },
};
