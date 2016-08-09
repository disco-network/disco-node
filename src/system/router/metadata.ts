import {HttpVerb, ParamType} from "../router/enums";

export class RouteArea {
	constructor(targetClass: Function) {
		this.targetClass = targetClass;
		this.handlers = new Array<RouteHandler>();
	}

	targetClass: Function;
	path: string;
	handlers: Array<RouteHandler>;
	languages: Array<string>;
	accepts: Array<string>;
	properties: Array<ParamType>;
	
	addProperty(key: string, paramType: ParamType) {
		if (!this.hasProperties()) {
			this.properties = new Array<ParamType>();
		}
		this.properties[key] = paramType;
	}

	hasProperties(): boolean {
		return (this.properties && this.properties.length > 0);
	}
}

export class RouteHandler {
	name: string;
	path: string;
	resolvedPath: string;
	httpVerb: HttpVerb;
	parameters: Array<MethodParam> = new Array<MethodParam>();
	mustParseCookies: boolean = false;
	files: Array<FileParam> = new Array<FileParam>();
	mustParseBody: boolean = false;
	mustParseForms: boolean = false;
	languages: Array<string>;
	accepts: Array<string>;
	resolvedLanguages: Array<string>;
	resolvedAccepts: Array<string>;
}

export class FileParam {
	constructor(name: string, singleFile: boolean) {
		this.name = name;
		this.singleFile = singleFile;
	}

	name: string;
	singleFile: boolean;
}

export class MethodParam {
	constructor(name: string, type: Function, paramType: ParamType) {
		this.name = name;
		this.type = type;
		this.paramType = paramType;
	}

	name: string;
	type: Function;
	paramType: ParamType;
}

export class RequestContext {
	/**
	 * The resolved language to be used in the current request handling. 
	 */
	language: string;
	/**
	 * The preferred media type to be used in the current request handling. 
	 */
	preferredMedia: string;
	/**
	 * The request object. 
	 */
	request: any; // TODO: express.Request;
	/**
	 * The response object 
	 */
	response: any; // TODO: express.Response; 
	/**
	 * The next function. It can be used to delegate to the next middleware
	 * registered the processing of the current request. 
	 */
	next: any; // TODO: express.NextFunction;
}

export abstract class ReferencedResource {
	/**
	 * Constructor. Receives the location of the resource.
	 * @param location To be added to the Location header on response
	 * @param statusCode the response status code to be sent
	 */
	constructor(public location: string, public statusCode: number) {}
}