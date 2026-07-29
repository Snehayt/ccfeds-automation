const {
  createRun,
  getRuns,
  getRun,
  getTests,
  getFailures,
  getArtifacts,
  getLogs,
} = require("../services/run-service");

async function runRoutes(fastify) {
  fastify.get("/runs", async () => {
    return await getRuns();
  });

  fastify.post("/runs", async (request, reply) => {
    try {
      const run = await createRun(request.body);
      return reply.code(201).send(run);
    } catch (error) {
      return reply.code(error.statusCode || 500).send({
        error: error.message || "Failed to create run",
      });
    }
  });

  fastify.get("/runs/:runId/tests", async (request, reply) => {
  try {
    const tests = await getTests(request.params.runId);
    if (!tests) {
      return reply.code(404).send({ error: "Run not found" });
    }
    return tests;
  } catch (error) {
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to load tests",
    });
  }
});

fastify.get("/runs/:runId/failures", async (request, reply) => {
  try {
    const failures = await getFailures(request.params.runId);
    if (!failures) {
      return reply.code(404).send({ error: "Run not found" });
    }
    return failures;
  } catch (error) {
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to load failures",
    });
  }
});

fastify.get("/runs/:runId/artifacts", async (request, reply) => {
  try {
    const artifacts = await getArtifacts(request.params.runId);
    if (!artifacts) {
      return reply.code(404).send({ error: "Run not found" });
    }
    return artifacts;
  } catch (error) {
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to load artifacts",
    });
  }
});

fastify.get("/runs/:runId/logs", async (request, reply) => {
  try {
    const logs = await getLogs(request.params.runId);
    if (logs === null) {
      return reply.code(404).send({ error: "Run not found" });
    }
    return { runId: request.params.runId, logs };
  } catch (error) {
    return reply.code(error.statusCode || 500).send({
      error: error.message || "Failed to load logs",
    });
  }
});

fastify.get("/runs/:runId", async (request, reply) => {
    try {
        const run = await getRun(request.params.runId);
        return run;
    } catch (error) {
        return reply.code(error.statusCode || 500).send({
            error: error.message
        });
    }
});
}

module.exports = runRoutes;