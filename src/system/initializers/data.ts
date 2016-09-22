import {IDataContext, IDataAdapter, IInitializer} from "typescript-mvc";
import {AutoWired, Inject} from "typescript-mvc";
import {Promise} from "typescript-mvc";

import { SparqlProvider } from "odata-rdf-interface";

@AutoWired
export class DataContextInitializer implements IInitializer {

  constructor(
    @Inject private context: IDataContext,
    @Inject private adapter: IDataAdapter<SparqlProvider>) { }

  public execute(): Promise<any> {
    return new Promise((resolve: (data: any) => void, reject: (reason: string) => void) => {
      this.adapter.initialize((error: string, data: any) => {
        if (error) {
          reject(error);
        } else {
          this.context.provider = data;
          resolve(data);
        }
      });
    });
  }
}
