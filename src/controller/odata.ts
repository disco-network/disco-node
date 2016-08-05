import {ControllerBase, Route, HttpVerb} from "../system"

import * as util from "util";

@Route('/api')
export class ODataController extends ControllerBase {

  @Route('/odata')
  public OData(): void {
    
    console.log('ODataController called!');

    this.response.writeHead(200, { 'Content-Type': 'text/plain' });
    this.response.end('ODataController called!');
  }
}