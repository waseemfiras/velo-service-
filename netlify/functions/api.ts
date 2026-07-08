import express from "express";
import serverless from "serverless-http";
import apiApp from "../../server/app";

const app = express();
app.use("/api", apiApp);
app.use("/", apiApp);

export const handler = serverless(app, {
  basePath: '/.netlify/functions/api'
});
