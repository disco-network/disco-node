import {IFramework, IRouter} from "../../core/interfaces"

import {RouterAdapter} from "./router"

import * as http from "http";
import * as express from "express";
import * as coreExpress from "express-serve-static-core";

export class Adapter implements IFramework {

  public router: IRouter;

  constructor() {
    this.router = new RouterAdapter();
  }

  public startWebServer(port: number, hostname: string, callback?: Function): http.Server {
    return (<any>this.router).router.listen(port, hostname, callback);
  }
}
