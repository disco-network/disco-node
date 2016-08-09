// This should have no dependencies on anything else!

// Fake interfaces for DI!
// Those needs to be an 'abstract class' for now, 
// because interfaces have no runtime representation yet, that could be used for type registration.

export abstract class IAdapter {
  public name: string;
}


export abstract class ILogger {
  abstract log(message?: any, ...optionalParams: any[]): void;
}

import * as http from "http";
import {HttpVerb} from "../router/enums";

export abstract class IRouter {
  abstract addRequestHandler(name: string, handler: any): void;
  abstract register(httpVerb: HttpVerb, path: string, handler: any);  
}

export abstract class IFramework {
  public router: IRouter;
  abstract startWebServer(port: number, hostname: string, callback?: Function): http.Server;
}