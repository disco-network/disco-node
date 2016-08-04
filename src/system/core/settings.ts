import {Provided, Provider, Singleton} from "../adapter/factory";

import {JsonObject, JsonMember, TypedJSON} from "typedjson";

import * as fs from "fs";

const settingsProvider: Provider = {
  get: (): Settings => {
    let configJson: Buffer = fs.readFileSync(__dirname + '/../../settings.json');
    let config: Settings = TypedJSON.parse(configJson.toString(), Settings);
    return config;
  }
};

@JsonObject
@Singleton
@Provided(settingsProvider)
export class Settings {

  private defaultProtocol: string = 'http';
  private defaultHostname: string = '127.0.0.1';
  private defaultPort: number = 80;
  private defaultRoot: string = '/';
  private defaultBasePath: string = '/src';

  private _protocol: string;
  public get protocol(): string {
    return this._protocol || this.defaultProtocol;
  }
  @JsonMember
  public set protocol(v: string) {
    this._protocol = v;
  }

  private _hostname: string;
  public get hostname(): string {
    return this._hostname || this.defaultHostname;
  }
  @JsonMember
  public set hostname(v: string) {
    this._hostname = v;
  }

  private _port: number;
  public get port(): number {
    return this._port || this.defaultPort;
  }
  @JsonMember
  public set port(v: number) {
    this._port = v;
  }

  private _root: string;
  public get root(): string {
    return this._root || this.defaultRoot;
  }
  @JsonMember
  public set root(v: string) {
    this._root = v;
  }

  private _basePath: string;
  public get basePath(): string {
    return this._basePath || this.defaultBasePath;
  }
  @JsonMember
  public set basePath(v: string) {
    this._basePath = v;
  }
}
