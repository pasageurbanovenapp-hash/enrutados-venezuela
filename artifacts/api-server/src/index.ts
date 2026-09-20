import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { logger } from "./lib/logger";

const config = loadConfig(process.env);
const app = createApp(config);
const { port } = config;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
