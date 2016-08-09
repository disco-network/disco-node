import {Bootstrapper} from "./system";

class Server extends Bootstrapper {

    public execute(): void {
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

        this.context.framework.startWebServer(this.context.settings.port, this.context.settings.hostname);
    }
}

var server = new Server();
server.initialize();
