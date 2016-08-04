import {ControllerBase, Route, HttpVerb} from "../system"

export class HomeController extends ControllerBase {

  @Route('/')
  public Index(): void {
    console.log('HomeController called!');
  }
}