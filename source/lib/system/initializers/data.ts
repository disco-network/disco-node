import {IDataContext, IDataAdapter, IInitializer} from "irony";
import {AutoWired, Inject} from "irony";
import {Promise} from "irony";

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
