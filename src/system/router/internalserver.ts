import {HttpVerb, ParamType} from "../router/enums";
import * as metadata from "../router/metadata";

import * as express from "express"; // TODO: remove dependency

export class InternalServer {
	static serverClasses: Array<metadata.ServiceClass> = new Array<metadata.ServiceClass>();
	// TODO: static serverClasses: Map<string, metadata.ServiceClass> = new Map<string, metadata.ServiceClass>();
	// TODO: static paths: Map<string, Set<HttpVerb>> = new Map<string, Set<HttpVerb>>();
	static pathsResolved: boolean = false;

	private router: express.Router;
	constructor(router: any) {
		this.router = <express.Router>router;
	 }

	static registerServiceClass(target: any): metadata.ServiceClass {
		InternalServer.pathsResolved = false;
		let name: string = target.name || target.constructor.name;
		if (!InternalServer.serverClasses.hasOwnProperty(name)) {
			InternalServer.serverClasses[name] = new metadata.ServiceClass(target);
		}
		let serviceClass: metadata.ServiceClass = InternalServer.serverClasses[name];
		return serviceClass;
	}

	static registerServiceMethod(target: Function, methodName: string): metadata.ServiceMethod {
		if (methodName) {
			InternalServer.pathsResolved = false;
			let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
			if (!classData.methods.hasOwnProperty(methodName)) {
				classData.methods[methodName] = new metadata.ServiceMethod();
			}
			let serviceMethod: metadata.ServiceMethod = classData.methods[methodName];
			return serviceMethod;
		}
		return null;
	}

	public buildServices() {
		for (let classData in InternalServer.serverClasses) {
			if (InternalServer.serverClasses.hasOwnProperty(classData)) {
				let classX = InternalServer.serverClasses[classData];
				for (let methodData in classX.methods) {
					if (classX.methods.hasOwnProperty(methodData)) {
						let methodeX = classX.methods[methodData];
						this.buildService(classX, methodeX);		
					}
				}
			}
		}
		/* TODO: InternalServer.serverClasses.forEach(classData => {
			classData.methods.forEach(method => {
				this.buildService(classData, method);
			});
		});*/
		InternalServer.pathsResolved = true;
	}

	buildService(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod) {
		let handler = (req, res, next) => {
			this.callTargetEndPoint(serviceClass, serviceMethod, req, res, next);
		};

		if (!serviceMethod.resolvedPath) {
			InternalServer.resolveProperties(serviceClass, serviceMethod);
		}

		let middleware: Array<express.RequestHandler> = this.buildServiceMiddleware(serviceMethod);
		let args: any[] = [serviceMethod.resolvedPath];
		args = args.concat(middleware);
		args.push(handler);
		switch (serviceMethod.httpMethod) {
			case HttpVerb.GET:
				this.router.get.apply(this.router, args);
				break;
			case HttpVerb.POST:
				this.router.post.apply(this.router, args);
				break;
			case HttpVerb.PUT:
				this.router.put.apply(this.router, args);
				break;
			case HttpVerb.DELETE:
				this.router.delete.apply(this.router, args);
				break;
			case HttpVerb.HEAD:
				this.router.head.apply(this.router, args);
				break;
			case HttpVerb.OPTIONS:
				this.router.options.apply(this.router, args);
				break;
			case HttpVerb.PATCH:
				this.router.patch.apply(this.router, args);
				break;

			default:
				throw Error("Invalid http method for service [" + serviceMethod.resolvedPath + "]");
		}
	}

	private buildServiceMiddleware(serviceMethod: metadata.ServiceMethod): Array<express.RequestHandler> {
		let result: Array<express.RequestHandler> = new Array<express.RequestHandler>();
		return result;
	}

	private callTargetEndPoint(serviceClass: metadata.ServiceClass, serviceMethod: metadata.ServiceMethod,
		req: express.Request, res: express.Response, next: express.NextFunction) {
		let context: metadata.ServiceContext = new metadata.ServiceContext();
		context.request = req;
		context.response = res;
		context.next = next;

		/* TODO: this.checkAcceptance(serviceMethod, context);*/
		let serviceObject = this.createService(serviceClass, context);
		let args = [];/* TODO: this.buildArgumentsList(serviceMethod, context);*/
		let result = serviceClass.targetClass.constructor.prototype[serviceMethod.name].apply(serviceObject, args);
		this.processResponseHeaders(serviceMethod, context);
		this.sendValue(result, res, next);
	}

	private sendValue(value: any, res: express.Response, next: express.NextFunction) {
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
				if (value.location && value instanceof metadata.ReferencedResource) {
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

	private processResponseHeaders(serviceMethod: metadata.ServiceMethod, context: metadata.ServiceContext) {
		if (serviceMethod.resolvedLanguages) {
			if (serviceMethod.httpMethod === HttpVerb.GET) {
				context.response.vary("Accept-Language");
			}
			context.response.set("Content-Language", context.language);
		}
		if (serviceMethod.resolvedAccepts) {
			context.response.vary("Accept");
		}
	}

	private createService(serviceClass: metadata.ServiceClass, context: metadata.ServiceContext) {

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

	private static resolveProperties(serviceClass: metadata.ServiceClass,
		serviceMethod: metadata.ServiceMethod): void {
		/* TODO: InternalServer.resolveLanguages(serviceClass, serviceMethod);
		InternalServer.resolveAccepts(serviceClass, serviceMethod);*/
		InternalServer.resolvePath(serviceClass, serviceMethod);
	}

	private static resolvePath(serviceClass: metadata.ServiceClass,
		serviceMethod: metadata.ServiceMethod): void {
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
		declaredHttpMethods[serviceMethod.httpMethod];
		serviceMethod.resolvedPath = resolvedPath;
	}
}