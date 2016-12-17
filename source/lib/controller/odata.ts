import { Trace, Controller, Route } from "irony";
import { OPTIONS, POST } from "irony";
import { NotImplementedError } from "irony";

/* TS2529 Duplicate identifier 'Promise'. 
Compiler reserves name 'Promise' in top level scope of a module containing async functions*/
import { Promise as Promiz, FileSystemHelper } from "irony";

import { IHttpResponseSender } from "odata-rdf-interface";
import { GetHandler, PostHandler } from "odata-rdf-interface";
import { Schema } from "odata-rdf-interface";

import { ResponseSender } from "../system/responsesender";

import * as fs from "fs";

@Trace
@Route("/api/odata")
export class ODataController extends Controller {

  private discoSchema = require("../disco-schema.json");

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
  public batch(): Promiz<string> {
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

    let promise = new Promiz<string>((resolve: (data: string) => void, reject: (reason: string) => void) => {
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
  public async entityset(): Promiz<any> {
    this.context.logger.log("ODataController ENTITYSET called!");

    const entitySetName: string = this.request.params["entity"];
    this.context.logger.log("OData entity set:", entitySetName);
    const query: string = this.request.query;
    this.context.logger.log("OData query:", query);

    const responseSender: IHttpResponseSender = new ResponseSender();

    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    const url = this.request.protocol + "://" + this.request.get("Host") + "/api/odata/";
    const engine = new GetHandler(
      url,
      new Schema(this.discoSchema),
      this.context.dataProvider,
      "http://disco-network.org/resource/",
      this.context.logger);
    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: this.request.body,
    }, responseSender);

    this.context.logger.debug(`Request body: ${this.request.body.substr(0,6)}`);

    return (responseSender as ResponseSender).promise;
  }

  @POST
  @Route("/:entity")
  public async postEntitySet(): Promiz<any> {
    this.context.logger.log("ODataController ENTITYSET called!");

    const entitySetName: string = this.request.params["entity"];
    this.context.logger.log("OData entity set:", entitySetName);
    const query: string = this.request.query;
    this.context.logger.log("OData query:", query);

    const responseSender: IHttpResponseSender = new ResponseSender();

    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    const url = this.request.protocol + "://" + this.request.get("Host") + "/api/odata/";

    const engine = new PostHandler(
      url,
      new Schema(this.discoSchema),
      this.context.dataProvider,
      "http://disco-network.org/resource/");

    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: "@todo",
    }, responseSender);

    return (responseSender as ResponseSender).promise;
  }
}
