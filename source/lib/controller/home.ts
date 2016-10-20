import {Controller, Route} from "typescript-mvc";

export class HomeController extends Controller {

  @Route("/")
  public index(): string {
    this.context.logger.log("HomeController called!");

    return "HomeController called!";
  }
}
