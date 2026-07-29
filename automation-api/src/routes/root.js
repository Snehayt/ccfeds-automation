async function rootRoutes(fastify) {
  fastify.get("/", async () => {
    return {
      application: "Automation Intelligence Platform",
      version: "2.0.0",
      status: "Running",
    };
  });
}

module.exports = rootRoutes;