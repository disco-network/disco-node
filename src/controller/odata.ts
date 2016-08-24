import {ControllerBase, Route} from "typescript-mvc-web-api";

@Route("/api")
export class ODataController extends ControllerBase {

  @Route("/odata")
  public OData(): void {

    console.log("ODataController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end("ODataController called!");
  }
}
