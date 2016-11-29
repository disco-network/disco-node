import { IActionResult, ResponseData } from "typescript-mvc";
import { Promise } from "typescript-mvc";

import { IHttpResponseSender } from "odata-rdf-interface";

export class ResponseSender implements IHttpResponseSender, IActionResult<ResponseData> {

  private resolve: (data: ResponseData) => void;
  private reject: (error: any) => void;

  public promise: Promise<ResponseData>;
  public data: ResponseData;

  constructor(public requestUrl: string) {
    this.promise = new Promise((resolve: (data: ResponseData) => void, reject: (error: any) => void) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.data = new ResponseData();
  }

  public sendStatusCode(code: number) {
    this.data.code = code;
  }

  public sendBody(body: string) {
    // TODO: how to define the RDF uri and how should it be rewritten to the current hostname of a disco-node?
    this.data.body = body.replace(/http\:\/\/disco\-network\.org\/resource\//g, this.requestUrl);
  }

  public sendHeader(key: string, value: string) {
    if (key !== "Content-Length") {
      this.data.headers[key] = value;
    }
  }

  public finishResponse() {
    if (this.data.code !== 500) {
      this.resolve(this.data);
    } else {
      this.reject(new Error("OData request failed! " + this.data.body));
    }
  }
}
