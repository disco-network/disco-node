import {Provided, Provider, Singleton, ConfigurationProviderBase/*, ProvidedByJson*/} from "../adapter/factory";

import {JsonObject, JsonMember} from "typedjson";

@JsonObject
@Singleton
@Provided(new ConfigurationProviderBase(Package))
// TODO: wrap with @ProvidedByJson
export class Package {

  private _protocol: string;
  public get protocol(): string {
    return this._protocol;
  }
  @JsonMember
  public set protocol(v: string) {
    this._protocol = v;
  }

  private _hostname: string;
  public get hostname(): string {
    return this._hostname;
  }
  @JsonMember
  public set hostname(v: string) {
    this._hostname = v;
  }

  private _port: number;
  public get port(): number {
    return this._port;
  }
  @JsonMember
  public set port(v: number) {
    this._port = v;
  }

  private _root: string;
  public get root(): string {
    return this._root;
  }
  @JsonMember
  public set root(v: string) {
    this._root = v;
  }

  private _basePath: string;
  public get basePath(): string {
    return this._basePath;
  }
  @JsonMember
  public set basePath(v: string) {
    this._basePath = v;
  }
}
