import {WebServer} from "typescript-mvc";
import {AutoWired, Provides} from "typescript-mvc";

@AutoWired
@Provides(WebServer)
class Server extends WebServer {

  public onBeforeServerStart(): void {

    this.codeShouldBeMovedIntoFramework();
  }

  // TODO: move this into the mvc framework soon
  private codeShouldBeMovedIntoFramework(): void {
    // TODO: add system default request handlers, e.g. error
    this.context.framework.router.addRequestHandler("/", (request: any, response: any, next: any) => {
      this.context.logger.log("Unhandled request:", request.url);
      next();
    });

    // TODO: add processing of application level adapter registrations for ILogger, IFactory, IDataStore etc.
    //

  }
}

Server.start();
