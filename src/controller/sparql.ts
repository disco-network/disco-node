import {ControllerBase, Route} from "typescript-mvc-web-api";

@Route("/api")
export class SparqlController extends ControllerBase {

  @Route("/sparql")
  public Sparql(): void {

    console.log("SparqlController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end("SparqlController called!");
  }
}
