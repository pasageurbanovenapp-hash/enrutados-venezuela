import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../lib/logger";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ err: error }, "Unhandled request error");

  if (res.headersSent) return;

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};