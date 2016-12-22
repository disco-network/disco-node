import { Trace, Controller, Route } from "irony";
import { OPTIONS, POST } from "irony";
import { Param, PathParam, HeaderParam, QueryParam, BodyParam } from "irony";
import { NotImplementedError } from "irony";

/* TS2529 Duplicate identifier 'Promise'. 
Compiler reserves name 'Promise' in top level scope of a module containing async functions*/
import { FileSystemHelper } from "irony";

import { IHttpResponseSender } from "odata-rdf-interface";
import { GetHandler, PostHandler } from "odata-rdf-interface";
import { Schema } from "odata-rdf-interface";

import { ResponseSender } from "../system/responsesender";

import * as fs from "fs";

const CONTROLLER_ROUTE = "/api/odata";

@Trace
@Route(CONTROLLER_ROUTE)
export class ODataController extends Controller {

  private discoSchema = require("../disco-schema.json");

  private getHandler = new GetHandler(
    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    this.context.settings.rootUrl + CONTROLLER_ROUTE.substr(1) + "/",
    new Schema(this.discoSchema),
    this.context.dataProvider,
    "http://disco-network.org/resource/",
    this.context.logger);

  private postHandler = new PostHandler(
    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    this.context.settings.rootUrl + CONTROLLER_ROUTE.substr(1) + "/",
    new Schema(this.discoSchema),
    this.context.dataProvider,
    "http://disco-network.org/resource/");

  @OPTIONS
  @Route("/\*")
  public options(): void {
    this.context.logger.log("ODataController OPTIONS called!");

    this.response.header("Access-Control-Allow-Headers",
      "authorization,content-type,dataserviceversion,maxdataserviceversion,accept,odata-maxversion,odata-version,content-id");
    this.response.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS,DELETE,PUT,HEAD");
    // this.response.header("Access-Control-Expose-Headers", "dataserviceversion,maxdataserviceversion");
  }

  @Route("/\\$batch")
  public batch(): Promise<string> {
    this.context.logger.log("ODataController BATCH called!");

    throw new NotImplementedError();
  }

  @Route("/\\$metadata")
  public metadata(): any {
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

  @Route("/:entity*")
  public entityset( @PathParam("entity") entitySetName: string): Promise<any> {

    this.context.logger.debug(`OData entity set: ${entitySetName}`);
    this.context.logger.debug(`OData query: ${this.request.query}`);

    const responseSender: IHttpResponseSender = new ResponseSender();

    this.getHandler.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: "",
    }, responseSender);

    return (responseSender as ResponseSender).promise;
  }

  @POST
  @Route("/:entity")
  public postEntitySet(
    @PathParam("entity") entitySetName: string,
    @BodyParam body: string
    ): Promise<any> {

    this.context.logger.debug(`OData entity set: ${entitySetName}`);
    this.context.logger.debug(`OData query: ${this.request.query}`);
    this.context.logger.debug(`Request body: ${body}`);

    const responseSender: IHttpResponseSender = new ResponseSender();

    this.postHandler.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: (typeof body === "string") ? body : "",
    }, responseSender);

    return (responseSender as ResponseSender).promise;
  }
}
