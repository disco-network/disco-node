import {Controller, Route, IActionResult, ResponseData} from "typescript-mvc";
import {Promise} from "typescript-mvc";

import { IHttpRequestHandler, IHttpResponseSender } from "odata-rdf-interface";

import { GetHandler, OptionsHandler } from "odata-rdf-interface";
import { Schema } from "odata-rdf-interface";

import * as url from "url";

@Route("/api")
export class ODataController extends Controller {

  @Route("/odata/:query")
  public OData(query: string): any {

    console.log("ODataController called!");

    let urlParts: url.Url = url.parse(this.request.url);

    query = urlParts.query;
    console.log("OData query:", query);
    let pathname = urlParts.pathname.substring(urlParts.pathname.lastIndexOf("/"));
    console.log("OData entity:", pathname);

    let oneof = false;
    if (this.request.headers.origin) {
      this.response.header("Access-Control-Allow-Origin", this.request.headers.origin);
      this.response.header("Access-Control-Allow-Credentials", true);
      this.response.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE,PUT,HEAD");
      this.response.header("Access-Control-Allow-Headers",
        "authorization,content-type,dataserviceversion,maxdataserviceversion,accept");
      this.response.header("Access-Control-Expose-Headers", "dataserviceversion,maxdataserviceversion");
      oneof = true;
    }
    /*    if (oneof) {
          this.response.header("Access-Control-Max-Age", 60 * 60 * 24 * 365);
        }
    */
    // intercept OPTIONS method
    if (oneof && this.request.method === "OPTIONS") {
      this.response.send(200);
    }
    else {
      let engine: IHttpRequestHandler;
      let responseSender: IHttpResponseSender = new ResponseSender();

      if (this.request.method === "GET") {
        engine = new GetHandler(new Schema(), this.context.dataProvider, responseSender);
      }
      else if (this.request.method === "OPTIONS") {
        engine = new OptionsHandler(responseSender);
      }
      else {
        this.response.send(403);
      }

      engine.query(convertHttpRequest(this.request));

      return responseSender;
    }
  }
}

class ResponseSender implements IHttpResponseSender, IActionResult<ResponseData> {

  private resolve: (data: ResponseData) => void;
  private reject: (error: string) => void;

  public promise: Promise<ResponseData>;
  public data: ResponseData;

  constructor() {
    this.promise = new Promise((resolve: (data: ResponseData) => void, reject: () => void) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.data = new ResponseData();
  }

  public sendStatusCode(code: number) {
    this.data.code = code;
  }

  public sendBody(body: string) {
    this.data.body = body;
  }

  public sendHeader(key: string, value: string) {
    this.data.headers[key] = value;
  }

  public finishResponse() {
    this.resolve(this.data);
  }
}

function convertHttpRequest(req) {
  return {
    relativeUrl: req.url.substring(req.url.lastIndexOf("/")),
    body: "@todo",
  };
}
