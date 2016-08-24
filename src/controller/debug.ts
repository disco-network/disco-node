import {ControllerBase, Route} from "../system";

import * as util from "util";

export class DebugController extends ControllerBase {

  @Route("/debug")
  public Debug(): void {

    console.log("DebugController called!");

    this.response.writeHead(200, { "Content-Type": "text/plain" });
    this.response.end(util.inspect(this.request));
  }
}
