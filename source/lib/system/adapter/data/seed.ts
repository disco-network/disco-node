import * as rdfstore from "rdfstore";

const storeUri = "http://disco-network.org/resource/";

export function seed() {
  rdfstore.create({ persistent: true }, (error, store) => {
    if (error)
      console.log("\x1b[31m", "There was an error creating the store", error, "\x1b[0m");
    else {
      const seeder = new Seeder(store);
      seeder.begin();
      seeder.insertCulture({
        "Id": "2",
        "Key": "7b5e1699-c6f8-472b-976a-bb37ce517219",
        "Modified": "2014-02-18T22:56:15.003",
        "Code": "de-DE",
        "Name": "german (Germany)",
      });
      seeder.insertPostType({
        "Id": "1",
        "Key": "86ca262f-0d31-4e61-bd79-b6de8b784fab",
        "Modified": "2014-02-18T22:56:15.09",
        "Description": null,
        "DescriptionName": "Topic",
        "DescriptionKey": "a3952f8c-ecc5-4aaf-8891-a25952ae523d",
        "DescriptionModified": "2014-02-18T22:56:15.09",
      });
      seeder.insertPost({
        "Text": "Au\u00dfen, Internationales, Frieden",
        "Title": null,
        "Key": "bf38a895-264f-40d9-81f8-63f224dacc46",
        "Modified": "2014-02-18T22:56:15.103",
        "ContentKey": "bff86dae-58d0-4463-b5e3-7332311ea0b6",
        "ContentModified": "2014-02-18T22:56:15.12",
        "CultureId": "2",
        "PostTypeId": "1",
      });
      seeder.save(storeUri, () => store["close"]());
    }
  });
}

export class Seeder {

  private readyForSeeding = false;
  private graph;
  private nextId: { [entitySet: string]: number } = {};

  constructor(private store: rdfstore.Store) { }

  public begin() {
    if (!this.readyForSeeding) {
      this.store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
      this.store.rdf.setPrefix("disco", "http://disco-network.org/resource/");
      this.graph = this.store.rdf.createGraph();

      this.readyForSeeding = true;
    }
  }

  public save(graphName: string, cb: () => void) {
    if (this.readyForSeeding) {
      this.store.insert(this.graph, graphName, cb);

      this.graph = undefined;
      this.readyForSeeding = false;
    }
  }

  public insertPost(data: DPost) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const postIdentity = this.genNextIdentity("Posts");
    const contentIdentity = this.genNextIdentity("Content");
    const cultureUri = this.genEntityUri("Cultures", data.CultureId);
    const postTypeUri = this.genEntityUri("PostTypes", data.PostTypeId);

    this.triple(this.uri(postIdentity.uri), this.resolve("rdf:type"), this.resolve("disco:Post"));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:id"), this.literal(postIdentity.id));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:key"), this.literal(data.Key));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:foo"), this.literal("Hi"));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:modified"), this.literal(data.Modified));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:content"), this.uri(contentIdentity.uri));
    this.triple(this.uri(postIdentity.uri), this.resolve("disco:postType"), this.uri(postTypeUri));

    this.triple(this.uri(contentIdentity.uri), this.resolve("rdf:type"), this.resolve("disco:Content"));
    this.triple(this.uri(contentIdentity.uri), this.resolve("disco:id"), this.literal(contentIdentity.id));
    this.triple(this.uri(contentIdentity.uri), this.resolve("disco:key"), this.literal(data.ContentKey));
    this.triple(this.uri(contentIdentity.uri), this.resolve("disco:foo"), this.literal("Hi"));
    this.triple(this.uri(contentIdentity.uri), this.resolve("disco:modified"), this.literal(data.ContentModified));
    this.triple(this.uri(contentIdentity.uri), this.resolve("disco:culture"), this.uri(cultureUri));

    if (data.Title !== null)
      this.triple(this.uri(contentIdentity.uri), this.uri("disco:title"), this.literal(data.Title));

    this.triple(this.uri(contentIdentity.uri), this.uri("disco:text"), this.literal(data.Text));
  }

  public insertCulture(data: DCulture) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");

    const cultureUri = this.genEntityUri("Cultures", data.Id);

    this.triple(this.uri(cultureUri), this.resolve("rdf:type"), this.resolve("disco:Culture"));
    this.triple(this.uri(cultureUri), this.resolve("disco:id"), this.literal(data.Id));
    this.triple(this.uri(cultureUri), this.resolve("disco:key"), this.literal(data.Key));
    this.triple(this.uri(cultureUri), this.resolve("disco:foo"), this.literal("Hi"));
    this.triple(this.uri(cultureUri), this.resolve("disco:modified"), this.literal(data.Modified));
    this.triple(this.uri(cultureUri), this.resolve("disco:code"), this.literal(data.Code));
    this.triple(this.uri(cultureUri), this.resolve("disco:name"), this.literal(data.Name));
  }

  public insertPostType(data: DPostType) {
    const postTypeUri = this.genEntityUri("PostTypes", data.Id);
    const descriptionIdentity = this.genNextIdentity("Descriptors");

    this.triple(this.uri(postTypeUri), this.resolve("rdf:type"), this.resolve("disco:PostType"));
    this.triple(this.uri(postTypeUri), this.resolve("disco:id"), this.literal(data.Id));
    this.triple(this.uri(postTypeUri), this.resolve("disco:key"), this.literal(data.Key));
    this.triple(this.uri(postTypeUri), this.resolve("disco:foo"), this.literal("Hi"));
    this.triple(this.uri(postTypeUri), this.resolve("disco:modified"), this.literal(data.Modified));
    this.triple(this.uri(postTypeUri), this.resolve("disco:description"), this.uri(descriptionIdentity.uri));

    this.triple(this.uri(descriptionIdentity.uri), this.resolve("rdf:type"), this.resolve("disco:Descriptor"));
    this.triple(this.uri(descriptionIdentity.uri), this.resolve("disco:id"), this.literal(descriptionIdentity.id));
    this.triple(this.uri(descriptionIdentity.uri), this.resolve("disco:key"), this.literal(data.DescriptionKey));
    this.triple(this.uri(descriptionIdentity.uri), this.resolve("disco:foo"), this.literal("Hi"));
    this.triple(
      this.uri(descriptionIdentity.uri), this.resolve("disco:modified"), this.literal(data.DescriptionModified));
    this.triple(this.uri(descriptionIdentity.uri), this.resolve("disco:name"), this.literal(data.DescriptionName));
    if (data.Description !== null)
      this.triple(this.uri(descriptionIdentity.uri), this.resolve("disco:description"), this.literal(data.Description));
  }

  private genNextIdentity(entitySet: string): { id: string; uri: string } {
    const id = this.genNextId(entitySet);
    const uri = this.genEntityUri(entitySet, id);
    return { id, uri };
  }

  private genEntityUri(entitySet: string, entityId: string) {
    return `http://disco-network.org/resource/${entitySet}/${entityId}`;
  }

  private genNextId(entitySet: string): string {
    this.nextId[entitySet] = this.nextId[entitySet] || 1;
    return (this.nextId[entitySet]++).toString();
  }

  private triple(s, p, o) {
    this.graph.add(this.store.rdf.createTriple(s, p, o));
  }

  private uri(uri: string) {
    return this.store.rdf.createNamedNode(uri);
  }

  private resolve(prefixed: string) {
    return this.store.rdf.createNamedNode(this.store.rdf.resolve(prefixed));
  }

  private literal(value: string, type?: string) {
    return this.store.rdf.createLiteral(value, type);
  }
}

/* D is prefix for data structures */
export interface DPost {
  readonly Key: string;
  readonly ContentKey: string;
  readonly Title?: string;
  readonly Text: string;
  readonly Modified: string;
  readonly ContentModified: string;
  readonly CultureId: string;
  readonly PostTypeId: string;
}

export interface DCulture {
  readonly Id: string;
  readonly Key: string;
  readonly Modified: string;
  readonly Code: string;
  readonly Name: string;
}

export interface DPostType {
  readonly Id: string;
  readonly Key: string;
  readonly Modified: string;

  readonly Description: string;
  readonly DescriptionName: string;
  readonly DescriptionKey: string;
  readonly DescriptionModified: string;
}

export interface DDescriptor {
  readonly Id: string;
  readonly Key: string;
  readonly Modified: string;
  readonly Name: string;
  readonly Description: string;
  readonly CultureId: string;
}
