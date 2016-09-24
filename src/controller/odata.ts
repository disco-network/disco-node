import {Controller, Route} from "typescript-mvc";
import {GET, OPTIONS} from "typescript-mvc";
import {Promise, FileSystemHelper} from "typescript-mvc";

import {IHttpRequestHandler, IHttpResponseSender} from "odata-rdf-interface";
import {GetHandler} from "odata-rdf-interface";
import {Schema} from "odata-rdf-interface";

import {ResponseSender} from "../system/responsesender";

import * as url from "url";
import * as fs from "fs";

@Route("/api/odata")
export class ODataController extends Controller {

  @OPTIONS
  @Route("/\*")
  public options(): void {
    this.context.logger.log("ODataController OPTIONS called!");

    this.response.header("Access-Control-Allow-Headers",
      "authorization,content-type,dataserviceversion,maxdataserviceversion,accept");
    this.response.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE,PUT,HEAD");
    // this.response.header("Access-Control-Expose-Headers", "dataserviceversion,maxdataserviceversion");
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
    let engine: IHttpRequestHandler =
      new GetHandler(new Schema(), this.context.dataProvider, this.context.dataProvider.graphName);
    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/")),
      body: "@todo",
    }, responseSender);

    return (<ResponseSender>responseSender).promise;
  }

  @Route("/\*metadata")
  public metadata(): Promise<string> {
    this.context.logger.log("ODataController METADATA called!");

    this.response.header("Content-Type", "application/xml; charset=utf-8");
    this.response.header("DataServiceVersion", "3.0");

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
