import {AutoWired, Inject, Provides} from "typescript-ioc";

import {Bootstrapper, ApplicationContext} from "../core"

import * as express from "express";
import * as coreExpress from "express-serve-static-core";

@AutoWired
export class ExpressProvider {

  public context: ApplicationContext<coreExpress.Express>;

  public application: coreExpress.Application;
  public start: Function;

  constructor() {

    this.application = express();

    this.start = () => {
      this.application.listen(this.context.config.getPort(), this.context.config.getHostname());
    }
  }
}

@AutoWired
export class ExpressApplication extends Bootstrapper<coreExpress.Express> {

  @Inject
  public provider: ExpressProvider;

  constructor() {
    super();

    this.context.application = express();

    this.context.start = () => {
      this.context.application.listen(this.context.config.getPort(), this.context.config.getHostname());
    }
  }
}