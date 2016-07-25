import { ExpressBootstrapper } from "./boot";

class Server extends ExpressBootstrapper {

    public start() {

        let context = this.execute();

        let url = context.config.getProtocol()
            + '://' + context.config.getHostname()
            + ':' + context.config.getPort()
            + context.config.getRoot();

        context.logger.log('Server running at', url);
    }
}

var server = new Server();
server.start();
