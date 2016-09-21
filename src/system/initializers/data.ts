import {IInitializer, CallbackHandler} from "typescript-mvc";

import * as DataStore from "../adapter/data";

export class Initializer implements IInitializer {
  public provider;
  public execute(cb: CallbackHandler) {
    const dsa = new DataStore.Adapter();
    dsa.initialize(cb);

    this.provider = dsa.provider;
  }
}
