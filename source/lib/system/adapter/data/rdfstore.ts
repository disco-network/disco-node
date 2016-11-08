import { SparqlProvider } from "odata-rdf-interface";
import * as RdfStore from "rdfstore";

import {IDataAdapter, CallbackHandler} from "typescript-mvc";

export class Adapter extends IDataAdapter<SparqlProvider> {

  public provider: SparqlProvider;

  private storeUri: string = "http://datokrat.sirius.uberspace.de/disco-test";
  private store: RdfStore.Store;

  private onInitialized: CallbackHandler = () => { ; };

  public initialize(cb: CallbackHandler): void {
    this.onInitialized = cb;

    RdfStore.create(
      { persistent: true },
      (error: any, store: RdfStore.Store) => this.createStoreCallbackHandler(error, store));
  }

  private createStoreCallbackHandler(error: any, store: RdfStore.Store): void {
    this.store = store;

    this.provider = new SparqlProvider(this.store, this.storeUri);
    this.seed((err: any) => this.seedCallbackHandler(error));
  }

  private seedCallbackHandler(error: any): void {
    if (error) {
      console.error("seed failed", error);
      this.onInitialized(error, null);
    } else {
      this.onInitialized(null, this.provider);
    }
  }

  private seed(cb: CallbackHandler): void {
    this.store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    this.store.rdf.setPrefix("disco", "http://disco-network.org/resource/");

    let graph = this.store.rdf.createGraph();
    let node = (value: string) => this.createNamedNode(value);
    let literal = (value: string) => this.createLiteral(value);

    graph.add(this.store.rdf.createTriple(
      node("disco:post1"), node("rdf:type"), node("disco:Post")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:post1"), node("disco:id"), literal("1")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:post1"), node("disco:content"), node("disco:content1")
    ));

    graph.add(this.store.rdf.createTriple(
      node("disco:post2"), node("rdf:type"), node("disco:Post")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:post2"), node("disco:id"), literal("2")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:post2"), node("disco:content"), node("disco:content2")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:post2"), node("disco:parent"), node("disco:post1")
    ));

    graph.add(this.store.rdf.createTriple(
      node("disco:content1"), node("disco:id"), literal("1")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:content1"), node("disco:title"), literal("Post Nr. 1")
    ));

    graph.add(this.store.rdf.createTriple(
      node("disco:content2"), node("disco:id"), literal("2")
    ));
    graph.add(this.store.rdf.createTriple(
      node("disco:content2"), node("disco:title"), literal("Post Nr. 2")
    ));

    this.store.insert(graph, this.storeUri, cb);
  }

  private createNamedNode(value: string): any {
    return this.store.rdf.createNamedNode(this.store.rdf.resolve(value));
  }

  private createLiteral(value: string): any {
    return this.store.rdf.createLiteral(value);
  }
}
