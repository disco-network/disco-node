import {Controller, Route} from "typescript-mvc";

export class HomeController extends Controller {

  @Route("/")
  public Index(): void {

    this.context.logger.log("HomeController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end("HomeController called!");
  }
}
