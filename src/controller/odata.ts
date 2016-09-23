import {Controller, Route, IActionResult, ResponseData} from "typescript-mvc";
import {GET, OPTIONS} from "typescript-mvc";
import {Promise, FileSystemHelper} from "typescript-mvc";

import { IHttpRequestHandler, IHttpResponseSender } from "odata-rdf-interface";

import { GetHandler } from "odata-rdf-interface";
import { Schema } from "odata-rdf-interface";

import * as url from "url";
import * as fs from "fs";

@Route("/api/odata")
export class ODataController extends Controller {

  @OPTIONS
  @Route("/\*")
  public options(): void {
    this.context.logger.log("ODataController OPTIONS called!");

    if (this.request.headers.origin) {
      this.response.header("Access-Control-Allow-Origin", this.request.headers.origin);
      this.response.header("Access-Control-Allow-Credentials", true);
      this.response.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE,PUT,HEAD");
      this.response.header("Access-Control-Allow-Headers",
        "authorization,content-type,dataserviceversion,maxdataserviceversion,accept");
      this.response.header("Access-Control-Expose-Headers", "dataserviceversion,maxdataserviceversion");
      this.response.header("Access-Control-Max-Age", 60 * 60 * 24 * 365);
    }
  }

  @Route("/Posts?:query")
  public odata(query: string): any {
    this.context.logger.log("ODataController called!");

    let urlParts: url.Url = url.parse(this.request.url);

    query = urlParts.query;
    this.context.logger.log("OData query:", query);
    let pathname = urlParts.pathname.substring(urlParts.pathname.lastIndexOf("/"));
    this.context.logger.log("OData entity:", pathname);

    let responseSender: IHttpResponseSender = new ResponseSender();
    let engine: IHttpRequestHandler = new GetHandler(new Schema(), this.context.dataProvider, responseSender);
    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/")),
      body: "@todo",
    });

    return (<ResponseSender>responseSender).promise;
  }

  @Route("/\*metadata")
  public metadata(): Promise<string> {
    this.context.logger.log("ODataController METADATA called!");

    this.response.header("Cache-Control", "no-cache");
    this.response.header("Pragma", "no-cache");
    this.response.header("Content-Type", "application/xml; charset=utf-8");
    this.response.header("Expires", -1);
    this.response.header("DataServiceVersion", "3.0");
    this.response.set("Connection", "close");

    let filename = "disco-metadata.xml";
    let filepath = FileSystemHelper.locateFolderOf(filename);

    let promise = new Promise<string>((resolve: (data: string) => void, reject: (reason: string) => void) => {
      fs.readFile(filepath + "/" + filename, (error: NodeJS.ErrnoException, data: Buffer) => {
        if (error) {
          reject(error.message);
        } else {
          resolve(data.toString());
        }
      });
    });

    return promise;
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
