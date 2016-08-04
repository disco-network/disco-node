import {InternalServer} from "./internalserver";
import {HttpVerb} from "./enums";

import * as metadata from "../router/metadata";

export function Route(path: string) {
  return function (...args: any[]) {
    if (args.length == 1) {
      return RouteTypeDecorator.apply(this, [args[0], path]);
    }
    else if (args.length == 3 && typeof args[2] === "object") {
      return RouteMethodDecorator.apply(this, [args[0], args[1], args[2], path]);
    }

    throw new Error("Invalid @Path Decorator declaration.");
  }
}

function RouteTypeDecorator(target: Function, path: string) {
  let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
  classData.path = path;
}

function RouteMethodDecorator(target: any, propertyKey: string,
  descriptor: PropertyDescriptor, path: string) {
  let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
  if (serviceMethod) { // does not intercept constructor
    serviceMethod.path = path;
    serviceMethod.httpMethod = HttpVerb.GET;
    serviceMethod.name = propertyKey;
  }
}
