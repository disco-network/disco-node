import {Controller, Route} from "irony";

export class HomeController extends Controller {

  @Route("/")
  public index(): string {
    this.context.logger.log("HomeController called!");

    return "HomeController called!";
  }
}
