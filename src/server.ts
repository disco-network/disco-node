import {Bootstrapper} from "./system/core";

//import * as util from "util";

class Server extends Bootstrapper {

    public execute(): void {

/*        this.context.framework.addRoutingHandler('/debug', function (request, response) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end(util.inspect(request));
        });
*/
        /*
            /api/odata/*

            /api/sparql/*

                let routes = [
                    new Route('/', { controller: 'Home', action: 'index' }),
                    new Route('/', { controller: 'Home', action: 'index' }),
                ];
        */

        let url = this.context.settings.protocol
            + '://' + this.context.settings.hostname
            + ':' + this.context.settings.port
            + this.context.settings.root;

        this.context.logger.log('Server running at', url);

        this.context.framework.initialize(this.context.settings.port, this.context.settings.hostname);
    }
}

var server = new Server();
server.initialize();
