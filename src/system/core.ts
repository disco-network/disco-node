import {AutoWired, Inject} from "typescript-ioc";

import { Config } from "./config";
import { ILogger } from "./logger";


@AutoWired
export class ApplicationContext<TApplication> {

  @Inject
  public config: Config.Server;

  @Inject
  public logger: ILogger;

  public application: TApplication;
  public start: Function;
}

@AutoWired
export abstract class Bootstrapper<TApplication> {

  @Inject
  public context: ApplicationContext<TApplication>;
}