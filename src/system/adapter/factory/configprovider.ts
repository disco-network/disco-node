import {Provided, Provider, Singleton} from "../factory";

import {fsHelper} from "../../core/helper";

import {TypedJSON} from "typedjson";
import * as fs from "fs";

export function ProvidedByJson(): Function {
  return function (target: Function): Function {
    return Provided(new ConfigurationProviderBase(target))
  };
}

export class ConfigurationProviderBase implements Provider {
  private type: any;

  constructor(type: any) {
    this.type = type;
  }

  public get(): Object {
    let name: string = this.type.name.toLowerCase() + '.json';
    let configJson: Buffer = fsHelper.locateAndReadFile(name);
    let config: any = TypedJSON.parse(configJson.toString(), this.type);
    return config;
  }
}
