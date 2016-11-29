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
      const postReferenceTypes = require(`${dbSeedFolderPath}/15_PostReferenceTypes.json`).value;
      const postReferences = require(`${dbSeedFolderPath}/16_PostReferences.json`).value;
      const origins = require(`${dbSeedFolderPath}/20_Origins.json`).value;
      const users = require(`${dbSeedFolderPath}/21_Users.json`).value;
      const originators = require(`${dbSeedFolderPath}/22_Originators.json`).value;
      const groups = require(`${dbSeedFolderPath}/30_Groups.json`).value;
      const groupMembershipTypes = require(`${dbSeedFolderPath}/31_GroupMembershipTypes.json`).value;
      const groupMemberships = require(`${dbSeedFolderPath}/32_GroupMemberships.json`).value;
      const ratings = require(`${dbSeedFolderPath}/40_Ratings.json`).value;
      const tags = require(`${dbSeedFolderPath}/50_Tags.json`).value;
      const regions = require(`${dbSeedFolderPath}/60_Regions.json`).value;

      seeder.insertMany(seeder.insertCultures, cultures);
      seeder.insertMany(seeder.insertContents, content);
      seeder.insertMany(seeder.insertDescriptors, descriptors);
      seeder.insertMany(seeder.insertPostTypes, postTypes);
      seeder.insertMany(seeder.insertPosts, posts);
      seeder.insertMany(seeder.insertPostReferenceTypes, postReferenceTypes);
      seeder.insertMany(seeder.insertPostReferences, postReferences);
      seeder.insertMany(seeder.insertOrigins, origins);
      seeder.insertMany(seeder.insertUsers, users);
      seeder.insertMany(seeder.insertOriginators, originators);
      seeder.insertMany(seeder.insertGroups, groups);
      seeder.insertMany(seeder.insertGroupMembershipTypes, groupMembershipTypes);
      seeder.insertMany(seeder.insertGroupMemberships, groupMemberships);
      seeder.insertMany(seeder.insertRatings, ratings);
      seeder.insertMany(seeder.insertTags, tags);
      seeder.insertMany(seeder.insertRegions, regions);

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

  public insertPosts(data: DPost) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Posts", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Post", data);

    this.navProperty(uri, "disco:content", "Content", data.ContentId);
    this.navProperty(uri, "disco:postType", "PostTypes", data.PostTypeId);
  }

  public insertContents(data: DContent) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Content", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Content", data);

    if (data.Title)
      this.property(uri, "disco:title", data.Title);
    this.property(uri, "disco:text", data.Text);
    this.navProperty(uri, "disco:culture", "Cultures", data.CultureId);
  }

  public insertCultures(data: DCulture) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Cultures", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Culture", data);

    this.property(uri, "disco:code", data.Code);
    this.property(uri, "disco:name", data.Name);
  }

  public insertPostTypes(data: DPostType) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("PostTypes", data.Id);

    this.applyEntityBaseProperties(uri, "disco:PostType", data);

    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertDescriptors(data: DDescriptor) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Descriptors", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Descriptor", data);

    this.property(uri, "disco:name", data.Name);
    this.property(uri, "disco:description", data.Description);
    this.navProperty(uri, "disco:culture", "Cultures", data.CultureId);
  }

  public insertPostReferenceTypes(data: DPostReferenceType) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("PostReferenceTypes", data.Id);

    this.applyEntityBaseProperties(uri, "disco:PostReferenceType", data);

    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertPostReferences(data: DPostReference) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("PostReferences", data.Id);

    this.applyEntityBaseProperties(uri, "disco:PostReference", data);

    this.navProperty(uri, "disco:referrer", "Posts", data.ReferrerId);
    this.navProperty(uri, "disco:referree", "Posts", data.ReferreeId);
    this.navProperty(uri, "disco:referenceType", "Posts", data.ReferenceTypeId);
  }

  public insertOrigins(data: DOrigin) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Origins", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Origin", data);

    this.property(uri, "disco:uri", data.Uri);
    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertUsers(data: DUser) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Users", data.Id);

    this.applyEntityBaseProperties(uri, "disco:User", data);

    this.property(uri, "disco:alias", data.Alias);
    this.property(uri, "disco:token", data.Token);
    this.navProperty(uri, "disco:origin", "Origins", data.OriginId);
  }

  public insertOriginators(data: DOriginator) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Originators", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Originator", data);

    this.navProperty(uri, "disco:author", "Users", data.AuthorId);
    this.navProperty(uri, "disco:origin", "Origins", data.OriginId);
  }

  public insertGroups(data: DGroup) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Groups", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Group", data);

    this.property(uri, "disco:alias", data.Alias);
    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
    this.navProperty(uri, "disco:parent", "Groups", data.ParentId);
  }

  public insertGroupMembershipTypes(data: DGroupMembershipType) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("GroupMembershipTypes", data.Id);

    this.applyEntityBaseProperties(uri, "disco:GroupMembershipType", data);

    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertGroupMemberships(data: DGroupMembership) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("GroupMemberships", data.Id);

    this.applyEntityBaseProperties(uri, "disco:GroupMembership", data);

    this.navProperty(uri, "disco:membershipType", "GroupMembershipTypes", data.MembershipTypeId);
  }

  public insertRatings(data: DRating) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Ratings", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Rating", data);

    this.property(uri, "disco:score", data.Score);
    this.navProperty(uri, "disco:post", "Posts", data.PostId);
    this.navProperty(uri, "disco:user", "Users", data.UserId);
  }

  public insertTags(data: DTag) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Tags", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Tag", data);

    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
  }

  public insertRegions(data: DRegion) {
    if (!this.readyForSeeding) throw new Error("not ready for seeding, call begin().");
    const uri = this.genEntityUri("Regions", data.Id);

    this.applyEntityBaseProperties(uri, "disco:Region", data);

    this.property(uri, "disco:code", data.Code);
    this.navProperty(uri, "disco:description", "Descriptors", data.DescriptionId);
    this.navProperty(uri, "disco:parent", "Groups", data.ParentId);
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

export interface DPostReferenceType extends DEntity {
  readonly DescriptionId: string;
}

export interface DPostReference extends DEntity {
  readonly ReferrerId: string;
  readonly ReferreeId: string;
  readonly ReferenceTypeId: string;
}

export interface DOrigin extends DEntity {
  readonly Uri: string;
  readonly DescriptionId: string;
}

export interface DUser extends DEntity {
  readonly Alias: string;
  readonly Token: string;
  readonly OriginId: string;
}

export interface DOriginator extends DEntity {
  readonly AuthorId: string;
  readonly OriginId: string;
}

export interface DGroup extends DEntity {
  readonly Alias: string;
  readonly DescriptionId: string;
  readonly ParentId: string;
}

export interface DGroupMembershipType extends DEntity {
  readonly DescriptionId: string;
}

export interface DGroupMembership extends DEntity {
  readonly MembershipTypeId: string;
}

export interface DRating extends DEntity {
  readonly Score: string;
  readonly PostId: string;
  readonly UserId: string;
}

export interface DTag extends DEntity {
  readonly DescriptionId: string;
}

export interface DRegion extends DEntity {
  readonly Code: string;
  readonly DescriptionId: string;
  readonly ParentId: string;
}
