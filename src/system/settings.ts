import {Provided, Provider} from "typescript-ioc";

import {JsonObject, JsonMember, TypedJSON} from "typedjson"

import * as fs from "fs";

const settingsProvider: Provider = {
  get: (): Settings => {
    let configJson: Buffer = fs.readFileSync(__dirname + '/../settings.json');
    let config: Settings = TypedJSON.parse(configJson.toString(), Settings);
    return config;
  }
};

@JsonObject
@Provided(settingsProvider)
export class Settings {

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
