import { Controller, Route } from "typescript-mvc";
import { OPTIONS } from "typescript-mvc";
import { NotImplementedError } from "typescript-mvc";
import { Promise, FileSystemHelper } from "typescript-mvc";

import { IHttpResponseSender } from "odata-rdf-interface";
import { GetHandler } from "odata-rdf-interface";
import { Schema } from "odata-rdf-interface";

import { ResponseSender } from "../system/responsesender";

import * as fs from "fs";

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

  @Route("/:entity")
  public entityset(): any {
    this.context.logger.log("ODataController ENTITYSET called!");

    let entitySetName: string = this.request.params["entity"];
    this.context.logger.log("OData entity set:", entitySetName);
    let query: string = this.request.query;
    this.context.logger.log("OData query:", query);

    let url = this.request.protocol + "://" + this.request.get("Host") + "/api/";
    let responseSender: IHttpResponseSender = new ResponseSender(url);
    let engine =
      new GetHandler(
        new Schema(this.discoSchema),
        this.context.dataProvider,
        this.context.dataProvider.graphName,
        this.context.logger);
    engine.query({
      relativeUrl: this.request.url.substring(this.request.url.lastIndexOf("/api/odata/") + 10),
      body: "@todo",
    }, responseSender);

    return (<ResponseSender>responseSender).promise;
  }
}
