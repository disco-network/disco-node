import {IActionResult, ResponseData} from "typescript-mvc";
import {Promise} from "typescript-mvc";

import {IHttpResponseSender} from "odata-rdf-interface";

export class ResponseSender implements IHttpResponseSender, IActionResult<ResponseData> {

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
