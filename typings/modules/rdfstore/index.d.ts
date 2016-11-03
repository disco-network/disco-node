declare var QueryEngine: any;
declare var InMemoryQuadBackend: any;
declare var PersistentBackend: any;
declare var InMemoryLexicon: any;
declare var PersistentLexicon: any;
declare var RDFModel: any;
declare var _: any;
declare var connect: () => void;


declare module "rdfstore" {
  export class Store {
    constructor(cb?: (error: any, store: Store) => void);
    public rdf: any;
    public insert(arg1: any, arg2: any, arg3: any);
  }

  function create(cb: (error: any, store: Store) => void): any;
  function create(options: {}, cb: (error: any, store: Store) => void): any;

  export { create };
}