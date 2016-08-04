import {AutoWired, Inject, Singleton, Container, Settings, ILogger} from "./common";
import {ApplicationContext} from "./core";

export function Reflector() {
  return function (...args: any[]) {
    console.log('Reflector executed...');
  };
}

export enum HttpVerb {
  GET = 1,
  POST,
  UPDATE,
  DELETE,
  OPTIONS,
  PATCH,
  HEAD
}

export function Route(path: string, verb?: HttpVerb) {
  console.log('Route Decorator declaration called...');

  // target: any, propertyKey: string, descriptor: PropertyDescriptor
  return function (...args: any[]) {
    //return RouteHandler.apply(this, [path, verb]);


    //let handler = new RouteHandler(path, args[0], args[1], args[2]);



    return RouteHandlerX.apply(this, [path, args[0], args[1], args[2]]);

    //methode['path'] = path; 
    //context.framework.addRoutingHandler(path, methode.apply(this));
  }
}

/**
 * Decorator processor for [[Route]] decorator on classes
 */
function RouteHandlerX(path: string, target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log('RouteHandler called...');
  let that = this;

  let context: ApplicationContext = Container.get(ApplicationContext);
  context.routings[path] = descriptor;

  context.framework.addRoutingHandler(path, (request: any, response: any, next?: any) => {
    console.log('RequestHandler executed...');

    let path = that.path;
  });
}

export class RouteHandler {

  private path: string;

  constructor(path: string, target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log('RouteHandler created...');

    this.path = path;
  }

  public HandleRoute(request: any, response: any, next?: any): void {
    console.log('HandleRoute executed...');

    let context: ApplicationContext = Container.get(ApplicationContext);
    let callback: Function = context.routings[this.path];
    callback.apply(this, [request, response, next]);
  }
}