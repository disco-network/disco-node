import { IActionResult, ResponseData } from "typescript-mvc";
import { Promise } from "typescript-mvc";

import { IHttpResponseSender } from "odata-rdf-interface";

export class ResponseSender implements IHttpResponseSender, IActionResult<ResponseData> {

  private resolve: (data: ResponseData) => void;
  private reject: (error: any) => void;

  public promise: Promise<ResponseData>;
  public data: ResponseData;

  constructor() {
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
    this.data.body = body;
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
