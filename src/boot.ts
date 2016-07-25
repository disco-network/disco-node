import {AutoWired, Inject} from "typescript-ioc";

import { Config } from "./config";
import { ILogger } from "./system/logger";

import express = require("express");
import expressCore = require("express-serve-static-core");

@AutoWired
class ApplicationContext {

  @Inject
  public config: Config.Server;

  @Inject
  public logger: ILogger;
}

@AutoWired
abstract class Bootstrapper {

  @Inject
  public applicationContext: ApplicationContext;

  public abstract execute(): ApplicationContext;
}

@AutoWired
export abstract class ExpressBootstrapper extends Bootstrapper {

  private express: expressCore.Application;

  public execute(): ApplicationContext {

    this.express = express();

    this.express.use(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World\n');
    });

    this.express.listen(this.applicationContext.config.getPort(), this.applicationContext.config.getHostname());

    return this.applicationContext;
  }
}