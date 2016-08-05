import {ControllerBase, Route, HttpVerb} from "../system"

export class HomeController extends ControllerBase {

  @Route('/')
  public Index(): void {
    
    console.log('HomeController called!');

    this.response.writeHead(200, { 'Content-Type': 'text/plain' });
    this.response.end('HomeController called!');
  }
}