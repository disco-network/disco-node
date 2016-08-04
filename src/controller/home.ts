import {ControllerBase, Route} from "../system/common"

export class HomeController extends ControllerBase {

  @Route('/')
  public Index(): void {
    console.log('HomeController called!');
  }
}