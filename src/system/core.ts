import {AutoWired, Inject, Container} from "typescript-ioc";

import {ILogger, IFramework} from "./common";

import {Settings} from "./settings";

@AutoWired
export class ApplicationContext {

  private _settings: Settings;
  public get settings(): Settings {
    return this._settings;
  }

  private _logger: ILogger;
  public get logger(): ILogger {
    return this._logger;
  }

  private _framework: IFramework;
  public get framework(): IFramework {
    return this._framework;
  }

  constructor(
    @Inject framework: IFramework,
    @Inject logger: ILogger,
    @Inject settings: Settings) {
    this._framework = framework;
    this._logger = logger;
    this._settings = settings;
  }
}

@AutoWired
export abstract class Bootstrapper {

  @Inject
  private _context: ApplicationContext;
  public get context(): ApplicationContext {
    return this._context;
  }

  constructor() {

    let framework = require("./adapter/framework");
    Container.bind(IFramework).to(framework.Adapter);

    let logger = require("./adapter/logger");
    Container.bind(ILogger).to(logger.Adapter);
  }
}

