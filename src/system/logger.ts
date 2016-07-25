import {AutoWired, Provides} from "typescript-ioc";

// Fake interface
export abstract class ILogger {
  public abstract log(message?: any, ...optionalParams: any[]): void;
}

@AutoWired
@Provides(ILogger)
export class ConsoleLogger implements ILogger {

  public log(message?: any, ...optionalParams: any[]): void {
    console.log(message, optionalParams);
  }
}