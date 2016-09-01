import {Controller, Route} from "typescript-mvc";

import * as url from "url";

@Route("/api")
export class ODataController extends Controller {

  @Route("/odata/:query")
  public OData(query: string): void {

    console.log("ODataController called!");

    let urlParts: url.Url = url.parse(this.request.url);

    query = urlParts.query;
    console.log("OData query:", query);
    let pathname = urlParts.pathname;
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
      this.response.end("{ message: 'ODataController called!' }");
    }

    // this.response.header("Access-Control-Allow-Origin", "http://disco-node.local:3000");

    // this.response.header(200, { "Content-Type": "text/plain" });
    // this.response.end("ODataController called!");
  }
}
