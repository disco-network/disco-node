import {Controller, Route} from "typescript-mvc-web-api";

export class HomeController extends Controller {

  @Route("/")
  public Index(): void {

    console.log("HomeController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end("HomeController called!");
  }
}
