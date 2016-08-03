import {IFramework} from "../../common"

import * as http from "http";
import * as express from "express";
import * as coreExpress from "express-serve-static-core";

export class Adapter implements IFramework {

  public application: coreExpress.Application;

  constructor() {
    this.application = express();
  }

  public addRoutingHandler(name: string, handler: coreExpress.RequestHandler): void {
    this.application.use(name, handler);
  }
  public initialize(port: number, hostname: string, callback?: Function): http.Server {
    return this.application.listen(port, hostname, callback);
  }
}
