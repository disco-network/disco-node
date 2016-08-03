import {Bootstrapper} from "./system/core"

import * as util from "util";

class Server extends Bootstrapper {

    public execute() {

        this.context.framework.addRoutingHandler('/debug', function (request, response) {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end(util.inspect(request));
        });

        /*
            /api/odata/*

            /api/sparql/*

                let routes = [
                    new Route('/', { controller: 'Home', action: 'index' }),
                    new Route('/', { controller: 'Home', action: 'index' }),
                ];
        */

        let url = this.context.settings.getProtocol()
            + '://' + this.context.settings.getHostname()
            + ':' + this.context.settings.getPort()
            + this.context.settings.getRoot();

        this.context.logger.log('Server running at', url);

        this.context.framework.initialize(this.context.settings.getPort(), this.context.settings.getHostname());
    }
}

var server = new Server();
server.execute();
