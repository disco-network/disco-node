import * as rdfstore from "rdfstore";

const storeUri = "http://disco-network.org/resource/";

export function seed() {
  rdfstore.create({ persistent: true }, (error, store) => {
    if (error)
      console.log("\x1b[31m", "There was an error creating the store", error, "\x1b[0m");
    else {
      const seeder = new Seeder(store);
      seeder.begin();

      seeder.insertMany(seeder.insertCulture, [{
        "Id": "1",
        "Key": "ce30d475-b11e-46ac-8de9-3f3b89a89344",
        "Modified": "2014-03-26T20:03:30.797",
        "Code": "en-US",
        "Name": "english (UK)",
      },
      {
        "Id": "2",
        "Key": "7b5e1699-c6f8-472b-976a-bb37ce517219",
        "Modified": "2014-02-18T22:56:15.003",
        "Code": "de-DE",
        "Name": "german (Germany)",
      }]);

      seeder.insertPostType({
        "Id": "1",
        "Key": "86ca262f-0d31-4e61-bd79-b6de8b784fab",
        "Modified": "2014-02-18T22:56:15.09",
        "Description": null,
        "DescriptionName": "Topic",
        "DescriptionKey": "a3952f8c-ecc5-4aaf-8891-a25952ae523d",
        "DescriptionModified": "2014-02-18T22:56:15.09",
      });

      seeder.insertMany<DPost>(seeder.insertPost, [{
        "Title": null,
        "Text": "Innen, Recht, Demokratie, Sicherheit",
        "Key": "004c55c4-d71c-4307-ab57-36d907b12584",
        "Modified": "2014-02-18T22:56:15.127",
        "CultureId": "2",
        "ContentKey": "da922338-6d8a-4cc0-addc-6670201ad9e1",
        "ContentModified": "2014-02-18T22:56:15.127",
        "PostTypeId": "1",
      },
      {
        "Title": null,
        "Text": "Au\u00dfen, Internationales, Frieden",
        "CultureId": "2",
        "Key": "bf38a895-264f-40d9-81f8-63f224dacc46",
        "Modified": "2014-02-18T22:56:15.103",
        "ContentKey": "bff86dae-58d0-4463-b5e3-7332311ea0b6",
        "ContentModified": "2014-02-18T22:56:15.12",
        "PostTypeId": "1",
      }, {
        "Key": "6099ee26-97a2-4890-85c8-e1c87c63d834",
        "Modified": "2014-02-18T22:56:15.127",
        "PostTypeId": "1",
        "ContentKey": "80616591-0e9f-41d3-9b73-7adef946edaf",
        "ContentModified": "2014-02-18T22:56:15.127",
        "Title": null,
        "Text": "Konzepte f\u00fcr Basisdemokratie",
        "CultureId": "2",
      }]);

      seeder.save(storeUri, () => store["close"]());
    }
  });
}

export class Seeder {

  private readyForSeeding = false;
  private graph;

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

  public insertMany<T>(insertionFn: (T) => void, data: T[]) {
    for (let entry of data) {
      insertionFn.call(this, entry);
    }
  }

  public insertPost(data: DPost) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const postUri = this.uri(this.genEntityUri("Posts", data.Id));
    const contentUri = this.genEntityUri("Content", data.ContentId);
    const postTypeUri = this.genEntityUri("PostTypes", data.PostTypeId);

    this.triple(postUri, this.resolve("rdf:type"), this.resolve("disco:Post"));
    this.applyEntityBaseProperties(postUri, "disco:Post", data);
    this.triple(postUri, this.resolve("disco:content"), this.uri(contentUri));
    this.triple(postUri, this.resolve("disco:postType"), this.uri(postTypeUri));
  }

  public insertContent(data: DContent) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const contentUri = this.uri(this.genEntityUri("Content", data.Id));

    this.applyEntityBaseProperties(contentUri, data);
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

  public applyEntityBaseProperties(uri, rdfType: string, data: DEntity) {
    this.triple(uri, this.resolve("rdf:type"), this.literal(rdfType));
    this.triple(uri, this.resolve("disco:id"), this.literal(data.Id));
    this.triple(uri, this.resolve("disco:key"), this.literal(data.Key));
    this.triple(uri, this.resolve("disco:modified"), this.literal(data.Modified));
  }

  private genEntityUri(entitySet: string, entityId: string) {
    return `http://disco-network.org/resource/${entitySet}/${entityId}`;
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

export interface DEntity {
  readonly Id: string;
  readonly Key: string;
  readonly Modified: string;
}

/* D is prefix for data structures */
export interface DPost extends DEntity {
  readonly ContentId: string;
  readonly PostTypeId: string;
}

export interface DContent extends DEntity {
  readonly Title?: string;
  readonly Text: string;
  readonly CultureId: string;
}

export interface DCulture extends DEntity {
  readonly Code: string;
  readonly Name: string;
}

export interface DPostType extends DEntity {
  readonly DescriptionId: string;
}

export interface DDescriptor extends DEntity {
  readonly Name: string;
  readonly Description: string;
  readonly CultureId: string;
}
