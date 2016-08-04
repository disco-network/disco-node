import {AutoWired, Inject, Singleton, Container, Settings, ILogger, IFramework, InternalServer} from "./common";

import * as fs from "fs";

@AutoWired
@Singleton
export class ApplicationContext {

  public routings: { [key: string]: any; } = {};

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

  private _context: ApplicationContext;
  public get context(): ApplicationContext {
    return this._context;
  }

  private settings: Settings;

  public initialize() {

    this.initializeSettings();

    this.registerAdapters();
    this.registerControllers();

    this.initializeContext();

    this.initializeRoutes();

    this.execute();
  }

  private initializeSettings(): void {
    this.settings = Container.get(Settings);
  }

  private registerAdapters(): void {

    this.registerAdapter(IFramework, 'framework');
    this.registerAdapter(ILogger, 'logger');
  }

  private registerAdapter(typeOfAdapter: Function, name?: string): void {

    let modulePath = this.resolveAbsolutePath('./adapter', name);
    let module: any = require(modulePath);
    Container.bind(typeOfAdapter).to(module.Adapter);
  }

  private registerControllers(): void {

    let pathToControllers: string = '../controller';
    this.resolveModules(pathToControllers);
  }

  private resolveModules(pathFragment: string): void {

    let fullModulePath: string = this.resolveAbsolutePath(pathFragment, '');

    let fileStatus: fs.Stats = fs.statSync(fullModulePath);
    if (fileStatus.isDirectory()) {

      let filenamesInFolder: Array<string> = fs.readdirSync(fullModulePath);
      for (var filename of filenamesInFolder) {
        let fullFilePath: string = this.resolveAbsolutePath(fullModulePath, filename);
        console.log(fullFilePath);

        let module = require(fullFilePath);
        console.log(module);
      }
    } else {
      throw new Error('Modules could not be resolved by path. Path does not exists [' + pathFragment + '].');
    }
  }

  private resolveAbsolutePath(path: string, filename: string): string {

    if (path.indexOf(this.settings.basePath) === -1) {
      path = __dirname + '/' + path;
    }

    let tempPath: string = path + '/' + filename;
    let absoluteFilePath: string = fs.realpathSync(tempPath);
    return absoluteFilePath;
  }

  private initializeContext(): void {
    this._context = Container.get(ApplicationContext);
  }

  private initializeRoutes(): void {
    let router: any = this.context.framework.router;
    let iternalServer: InternalServer = new InternalServer(router);
    iternalServer.buildServices();
  }

  public abstract execute(): void;
}