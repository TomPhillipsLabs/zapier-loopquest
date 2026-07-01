const { test } = require("node:test");
const assert = require("node:assert");
const schema = require("zapier-platform-schema");
const App = require("../index");
const create = require("../creates/create_review_task");
const verdict = require("../triggers/new_verdict");

test("app passes Zapier schema validation (apart from inline funcs)", () => {
  // validateAppDefinition expects compiled $func$ placeholders for inline
  // functions; the Zapier CLI fills those in at build. Ignore those two and
  // assert the rest of the structure is schema-valid.
  const results = schema.validateAppDefinition(App);
  const real = results.errors.filter(
    (e) => !/beforeRequest|\.perform(Subscribe|Unsubscribe|List)?\b/.test(e.property),
  );
  assert.deepEqual(real, [], JSON.stringify(real, null, 2));
});

test("create_review_task builds the POST and returns the task", async () => {
  let captured;
  const z = {
    request: async (req) => {
      captured = req;
      return { data: { id: "t1", status: "pending" } };
    },
  };
  const bundle = {
    authData: { apiKey: "k", baseUrl: "https://x.test" },
    inputData: { content: "hi", external_id: "run-1", module: "swiper", idempotency_key: "idem-1" },
  };
  const out = await create.operation.perform(z, bundle);
  assert.equal(captured.url, "https://x.test/api/v1/tasks");
  assert.equal(captured.method, "POST");
  assert.equal(captured.body.payload.content, "hi");
  assert.equal(captured.body.external_id, "run-1");
  assert.equal(captured.headers["idempotency-key"], "idem-1");
  assert.equal(out.id, "t1");
});

test("new_verdict subscribe registers the target URL and unsubscribe deletes it", async () => {
  const calls = [];
  const z = {
    request: async (req) => {
      calls.push(req);
      return { data: { id: "hook-1", url: req.body && req.body.url, event: "verdict" } };
    },
  };
  const bundle = {
    authData: { apiKey: "k", baseUrl: "https://x.test" },
    targetUrl: "https://hooks.zapier.com/abc",
  };
  const sub = await verdict.operation.performSubscribe(z, bundle);
  assert.equal(calls[0].url, "https://x.test/api/v1/hooks");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].body.url, "https://hooks.zapier.com/abc");
  assert.equal(sub.id, "hook-1");

  await verdict.operation.performUnsubscribe(z, { ...bundle, subscribeData: sub });
  assert.equal(calls[1].url, "https://x.test/api/v1/hooks/hook-1");
  assert.equal(calls[1].method, "DELETE");
});

test("new_verdict perform passes the inbound verdict through", async () => {
  const payload = { task_id: "t1", verdict: true, external_id: "order-9" };
  const out = await verdict.operation.perform({}, { cleanedRequest: payload });
  assert.deepEqual(out, [payload]);
});
