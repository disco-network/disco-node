import {WebServer} from "typescript-mvc";
import {AutoWired, Provides} from "typescript-mvc";

@AutoWired
@Provides(WebServer)
class Server extends WebServer { }

Server.start();
