import {AutoWired, Inject} from "../adapter/factory";

import {HttpVerb, ParamType} from "../router/enums";
import {RouteArea, RouteHandler, RequestContext, ReferencedResource} from "../router";

import {IRouter} from "../core/interfaces";

import * as http from "http";

@AutoWired
export class Registrar {
	static routeAreas: Array<RouteArea> = new Array<RouteArea>();
	static pathsResolved: boolean = false;

	private router: IRouter;
	constructor(@Inject router: IRouter) {
		this.router = router;
	 }

	static addRouteArea(target: any): RouteArea {
		Registrar.pathsResolved = false;
		let name: string = target.name || target.constructor.name;
		if (!Registrar.routeAreas.hasOwnProperty(name)) {
			Registrar.routeAreas[name] = new RouteArea(target);
		}
		let routeArea: RouteArea = Registrar.routeAreas[name];
		return routeArea;
	}

	static addRouteHandler(target: Function, methodName: string): RouteHandler {
		if (methodName) {
			Registrar.pathsResolved = false;
			let routeArea: RouteArea = Registrar.addRouteArea(target);
			if (!routeArea.handlers.hasOwnProperty(methodName)) {
				routeArea.handlers[methodName] = new RouteHandler();
			}
			let routeHandler: RouteHandler = routeArea.handlers[methodName];
			return routeHandler;
		}
		return null;
	}

	public registerRoutes() {
		for (let area in Registrar.routeAreas) {
			if (Registrar.routeAreas.hasOwnProperty(area)) {
				let routeArea = Registrar.routeAreas[area]; // TODO: needed???
				for (let handler in routeArea.handlers) {
					if (routeArea.handlers.hasOwnProperty(handler)) {
						let routeHandler = routeArea.handlers[handler];
						this.buildRoute(routeArea, routeHandler);		
					}
				}
			}
		}
		Registrar.pathsResolved = true;
	}

	buildRoute(routeArea: RouteArea, routeHandler: RouteHandler) {
		let handlerCallback = (req, res, next) => {
			this.callRouteHandler(routeArea, routeHandler, req, res, next);
		};

		if (!routeHandler.resolvedPath) {
			Registrar.resolveProperties(routeArea, routeHandler);
		}


		this.router.register(routeHandler.httpVerb, routeHandler.resolvedPath, handlerCallback);
	}

	private callRouteHandler(routeArea: RouteArea, routeHandler: RouteHandler, req: any, res: any, next: any) {
		//req: express.Request, res: express.Response, next: express.NextFunction) {
		let context: RequestContext = new RequestContext();
		context.request = req;
		context.response = res;
		context.next = next;

		/* TODO: this.checkAcceptance(serviceMethod, context);*/
		let serviceObject = this.createService(routeArea, context);
		let args = [];/* TODO: this.buildArgumentsList(serviceMethod, context);*/
		let result = routeArea.targetClass.constructor.prototype[routeHandler.name].apply(serviceObject, args);
		this.processResponseHeaders(routeHandler, context);
		this.sendValue(result, res, next);
	}

	private sendValue(value: any, res: any/*express.Response*/, next: any/*express.NextFunction*/) {
		switch (typeof value) {
			case "number":
				res.send(value.toString());
				break;
			case "string":
				res.send(value);
				break;
			case "boolean":
				res.send(value.toString());
				break;
			case "undefined":
				if (!res.headersSent) {
					res.sendStatus(204);
				}
				break;
			default:
				if (value.location && value instanceof ReferencedResource) {
					res.set("Location", value.location);
					res.sendStatus(value.statusCode);
				}
				/*else if (value.then && value instanceof Promise) {
					let self = this;
					value.then(function(val) {
						self.sendValue(val, res, next);
					}).catch(function(err) {
						next(err);
					});
				}*/
				else {
					res.json(value);
				}
		}
	}

	private processResponseHeaders(serviceMethod: RouteHandler, context: RequestContext) {
		if (serviceMethod.resolvedLanguages) {
			if (serviceMethod.httpVerb === HttpVerb.GET) {
				context.response.vary("Accept-Language");
			}
			context.response.set("Content-Language", context.language);
		}
		if (serviceMethod.resolvedAccepts) {
			context.response.vary("Accept");
		}
	}

	private createService(serviceClass: RouteArea, context: RequestContext) {

		let serviceObject = Object.create(serviceClass.targetClass);
    let result = serviceClass.targetClass.constructor.apply(serviceObject, [context.request, context.response, context.next]);

		if (serviceClass.hasProperties()) {
			serviceClass.properties.forEach((paramType, key) => {
				switch (paramType) {
					case ParamType.context:
						serviceObject[key] = context;
						break;
					case ParamType.context_accept_language:
						serviceObject[key] = context.language;
						break;
					case ParamType.context_accept:
						serviceObject[key] = context.preferredMedia;
						break;
					case ParamType.context_request:
						serviceObject[key] = context.request;
						break;
					case ParamType.context_response:
						serviceObject[key] = context.response;
						break;
					case ParamType.context_next:
						serviceObject[key] = context.next;
						break;
					default:
						break;
				}
			})
		}
		return serviceObject;
	}

	private static resolveProperties(serviceClass: RouteArea,
		serviceMethod: RouteHandler): void {
		/* TODO: InternalServer.resolveLanguages(serviceClass, serviceMethod);
		InternalServer.resolveAccepts(serviceClass, serviceMethod);*/
		Registrar.resolvePath(serviceClass, serviceMethod);
	}

	private static resolvePath(serviceClass: RouteArea,
		serviceMethod: RouteHandler): void {
		let classPath: string = serviceClass.path ? serviceClass.path.trim() : "";
		let resolvedPath = '';/* TODO: classPath.startsWith('/') ? classPath : '/' + classPath;
		if (resolvedPath.endsWith('/')) {
			resolvedPath = resolvedPath.slice(0, resolvedPath.length - 1);
		}*/

		if (serviceMethod.path) {
			let methodPath: string = serviceMethod.path.trim();
			resolvedPath = classPath + (/* TODO: methodPath.startsWith('/') ? methodPath : '/' + */methodPath);
		}

		let declaredHttpMethods: Array<HttpVerb> = []; /* TODO: Set<HttpMethod> = InternalServer.paths.get(resolvedPath);
		if (!declaredHttpMethods) {
			declaredHttpMethods = new Set<HttpMethod>();
			InternalServer.paths.set(resolvedPath, declaredHttpMethods);
		}
		if (declaredHttpMethods.has(serviceMethod.httpMethod)) {
			throw Error("Duplicated declaration for path [" + resolvedPath + "], method ["
				+ serviceMethod.httpMethod + "]. ");
		}*/
		declaredHttpMethods[serviceMethod.httpVerb];
		serviceMethod.resolvedPath = resolvedPath;
	}
}