import {Provided, Provider} from "typescript-ioc";

import {JsonObject, JsonMember, TypedJSON} from "typedjson"

import * as fs from "fs";

export module Config {

  const configProvider: Provider = {
    get: (): Server => {
      let configJson: Buffer = fs.readFileSync(__dirname + '/../settings.json');
      let config: Server = TypedJSON.parse(configJson.toString(), Config.Server);
      return config;
    }
  };

  @JsonObject
  @Provided(configProvider)
  export class Server {

    @JsonMember
    public protocol: string;
    private defaultProtocol: string = 'http';

    @JsonMember
    private hostname: string;
    private defaultHostname: string = '127.0.0.1';

    @JsonMember
    private port: number;
    private defaultPort: number = 80;

    @JsonMember
    private root: string;
    private defaultRoot: string = '/';

    public getProtocol(): string {
      return this.protocol || this.defaultProtocol;
    }

    public getHostname(): string {
      return this.hostname || this.defaultHostname;
    }

    public getPort(): number {
      return this.port || this.defaultPort;
    }

    public getRoot(): string {
      return this.root || this.defaultRoot;
    }
  }
}