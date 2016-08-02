import { ExpressApplication } from "./system/provider/express";

import * as util from "util";

class Server extends ExpressApplication {

    public execute() {

        this.context.application.use('/debug', function (request, response) {
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

        let url = this.context.config.getProtocol()
            + '://' + this.context.config.getHostname()
            + ':' + this.context.config.getPort()
            + this.context.config.getRoot();

        this.context.logger.log('Server running at', url);

        this.context.start();
    }
}

var server = new Server();
server.execute();
