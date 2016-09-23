import {Controller, Route} from "typescript-mvc";

@Route("/api")
export class SparqlController extends Controller {

  @Route("/sparql")
  public sparql(): void {

    this.context.logger.log("SparqlController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end("SparqlController called!");
  }
}
