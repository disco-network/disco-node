import { Trace, Controller, Route } from "typescript-mvc";
import { OPTIONS } from "typescript-mvc";
import { NotImplementedError } from "typescript-mvc";

/* TS2529 Duplicate identifier 'Promise'. 
Compiler reserves name 'Promise' in top level scope of a module containing async functions*/ 
import { Promise as Promiz, FileSystemHelper } from "typescript-mvc";

import { IHttpResponseSender } from "odata-rdf-interface";
import { GetHandler } from "odata-rdf-interface";
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
      "authorization,content-type,dataserviceversion,maxdataserviceversion,accept");
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

    let entitySetName: string = this.request.params["entity"];
    this.context.logger.log("OData entity set:", entitySetName);
    let query: string = this.request.query;
    this.context.logger.log("OData query:", query);

    let responseSender: IHttpResponseSender = new ResponseSender();

    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    let url = this.request.protocol + "://" + this.request.get("Host") + "/api/odata/";
    let engine = await
      new GetHandler(
        url,
        new Schema(this.discoSchema),
        this.context.dataProvider,
        "http://disco-network.org/resource/",
        this.context.logger);
    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: "@todo",
    }, responseSender);

    return (<ResponseSender>responseSender).promise;
  }
}
