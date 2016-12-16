import { ServiceBasedSparqlProvider } from "odata-rdf-interface";
import { ISparqlProvider } from "odata-rdf-interface/build/lib/sparql/sparql_provider_base";

import {IDataAdapter, CallbackHandler, ILogger, Inject, AutoWired} from "irony";

@AutoWired
export class Adapter extends IDataAdapter<ISparqlProvider> {

  public provider: ISparqlProvider;

  constructor(@Inject private logger: ILogger) {
    super();
  }

  public initialize(cb: CallbackHandler): void {
    this.provider = new ServiceBasedSparqlProvider("http://localhost:3030/api");
    cb(null, this.provider);
  }
}
