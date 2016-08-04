// This should have no dependencies on anything else!

// Fake interfaces for DI!
// Those needs to be an 'abstract class' for now, 
// because interfaces have no runtime representation yet, that could be used for type registration.

export abstract class ILogger {
  abstract log(message?: any, ...optionalParams: any[]): void;
}

export abstract class IFramework {
  public router: any;
  abstract addRoutingHandler(name: string, handler: any): void;
  abstract initialize(port: number, hostname: string, callback?: Function): any;
}