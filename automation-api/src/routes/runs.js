const { createRun } = require("../services/run-service");

async function runRoutes(fastify) {
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
}

module.exports = runRoutes;