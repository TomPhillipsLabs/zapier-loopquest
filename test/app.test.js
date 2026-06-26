const { test } = require("node:test");
const assert = require("node:assert");
const schema = require("zapier-platform-schema");
const App = require("../index");
const create = require("../creates/create_review_task");

test("app passes Zapier schema validation (apart from inline funcs)", () => {
  // validateAppDefinition expects compiled $func$ placeholders for inline
  // functions; the Zapier CLI fills those in at build. Ignore those two and
  // assert the rest of the structure is schema-valid.
  const results = schema.validateAppDefinition(App);
  const real = results.errors.filter(
    (e) => !/beforeRequest|\.perform\b/.test(e.property),
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
