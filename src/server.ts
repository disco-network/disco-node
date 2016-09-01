import {WebServer} from "typescript-mvc";

class Server extends WebServer {

    public execute(): void {
        /*
            /api/odata/*

            /api/sparql/*

                let routes = [
                    new Route('/', { controller: 'Home', action: 'index' }),
                    new Route('/', { controller: 'Home', action: 'index' }),
                ];
        */

        this.context.framework.router.addRequestHandler("/", (request: any, response: any, next: any) => {
          this.context.logger.log("Unhandled request:", request.url);

          next();
        });

        let url = this.context.settings.protocol
            + "://" + this.context.settings.hostname
            + ":" + this.context.settings.port
            + this.context.settings.root;

        this.context.logger.log("Server running at", url);

        this.context.framework.startWebServer(this.context.settings.port, this.context.settings.hostname);
    }
}

let server = new Server();
server.initialize();
