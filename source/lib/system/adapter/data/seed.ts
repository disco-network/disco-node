import * as rdfstore from "rdfstore";
import * as path from "path";
import * as fs from "fs";

const storeUri = "http://disco-network.org/resource/";

export function seed() {
  rdfstore.create({ persistent: true }, (error, store) => {
    if (error)
      console.log("\x1b[31m", "There was an error creating the store", error, "\x1b[0m");
    else {
      const seeder = new Seeder(store);
      seeder.begin();

      const dbSeedFolderPath = "../../../../../db/seed";

      const cultures = require(`${dbSeedFolderPath}/01_Cultures.json`).value;
      const content = require(`${dbSeedFolderPath}/02_Content.json`).value;
      const descriptors = require(`${dbSeedFolderPath}/03_Descriptors.json`).value;
      const postTypes = require(`${dbSeedFolderPath}/10_PostTypes.json`).value;
      const posts = require(`${dbSeedFolderPath}/11_Posts.json`).value;

      seeder.insertMany(seeder.insertCulture, cultures);
      seeder.insertMany(seeder.insertContent, content);
      seeder.insertMany(seeder.insertDescriptor, descriptors);
      seeder.insertMany(seeder.insertPostType, postTypes);
      seeder.insertMany(seeder.insertPost, posts);

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
    const postUri = this.genEntityUri("Posts", data.Id);

    this.applyEntityBaseProperties(postUri, "disco:Post", data);
    this.navProperty(postUri, "disco:content", "Content", data.ContentId);
    this.navProperty(postUri, "disco:postType", "PostTypes", data.PostTypeId);
  }

  public insertContent(data: DContent) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const contentUri = this.genEntityUri("Content", data.Id);

    this.applyEntityBaseProperties(contentUri, "disco:Content", data);

    if (data.Title)
      this.property(contentUri, "disco:title", data.Title);
    this.property(contentUri, "disco:text", data.Text);
    this.navProperty(contentUri, "disco:culture", "Cultures", data.CultureId);
  }

  public insertCulture(data: DCulture) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");

    const cultureUri = this.genEntityUri("Cultures", data.Id);

    this.applyEntityBaseProperties(cultureUri, "disco:Culture", data);

    this.property(cultureUri, "disco:code", data.Code);
    this.property(cultureUri, "disco:name", data.Name);
  }

  public insertPostType(data: DPostType) {
    const uri = this.genEntityUri("PostTypes", data.Id);

    this.applyEntityBaseProperties(uri, "disco:PostType", data);
    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertDescriptor(data: DDescriptor) {
    const uri = this.genEntityUri("Descriptors", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Descriptor", data);
    this.property(uri, "disco:name", data.Name);
    this.property(uri, "disco:description", data.Description);
    this.navProperty(uri, "disco:culture", "Cultures", data.CultureId);
  }

  public navProperty(uri, property: string, entitySet: string, id: string) {
    this.triple(uri, this.resolve(property), this.genEntityUri(entitySet, id));
  }

  public property(uri, property: string, literal: string) {
    this.triple(uri, this.resolve(property), this.literal(literal));
  }

  public applyEntityBaseProperties(uri, rdfType: string, data: DEntity) {
    this.triple(uri, this.resolve("rdf:type"), this.resolve(rdfType));
    this.triple(uri, this.resolve("disco:id"), this.literal(data.Id));
    this.triple(uri, this.resolve("disco:key"), this.literal(data.Key));
    this.triple(uri, this.resolve("disco:modified"), this.literal(data.Modified));
  }

  private genEntityUri(entitySet: string, entityId: string) {
    return this.uri(`http://disco-network.org/resource/${entitySet}/${entityId}`);
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
