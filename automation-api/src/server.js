const Fastify = require("fastify");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const rootRoutes = require("./routes/root");
const runRoutes = require("./routes/runs");

const app = Fastify({ logger: true });

app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "dashboard"),
});

app.register(rootRoutes);
app.register(runRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Automation API started");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();