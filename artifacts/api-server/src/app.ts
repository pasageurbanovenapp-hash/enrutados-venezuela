import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import router from "./routes";
import { logger } from "./lib/logger";
import type { AppConfig } from "./config/env";

export function createApp(config: Pick<AppConfig, "corsOrigins">): Express {
  const app: Express = express();

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
