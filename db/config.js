"use strict";
var fs = require("fs");
var path = require("path");

var macros = require("json-ld-macros");
var rdfstore = require('rdfstore');

var storeUri = "http://disco-network.org/resource/";
var dbSeedFolderPath = path.join(__dirname, "seed");

module.exports.seedDb = function () {

  rdfstore.create({ persistent: true }, function (err, store) {
    // the new store is ready
    if (err) {
      console.log("\x1b[31m", "There was an error creating the store", err, "\x1b[0m");
    } else {
      // loading local data

      store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
      store.rdf.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");
      store.rdf.setPrefix("disco", storeUri);

      let jsonldFolderPath = path.join(dbSeedFolderPath, "data");
      let filenamesInFolder = fs.readdirSync(jsonldFolderPath);
      filenamesInFolder.forEach(file => {

        let match = file.match(/([^\_]{1,4}\_)?([^\.]*)\.jsonld$/i);
        if (match) {

          let entityset = match[2];
          console.log("Process entityset ", "\x1b[36m[", entityset, "]\x1b[0m");

          let filename = path.join(jsonldFolderPath, file);
          console.log("seed data from file", "\x1b[36m", filename, "\x1b[0m");

          let jsonld = fs.readFileSync(filename).toString();

          store.load("application/ld+json", jsonld, storeUri, function (err, results) {
            if (err) {
              console.log("\x1b[31m", "There was an error seeding the store", err, "\x1b[0m");
            } else {
              let json = JSON.parse(jsonld);
              let entitytype = json["@graph"][0]["@type"];

              let query = "PREFIX disco: <" + storeUri + ">\
                           SELECT ?s \
                           WHERE  { ?s a disco:" + entitytype + " . }";

              console.log("execute query [\x1b[7m", query.replace(/\s+/g, " "), "\x1b[0m]");
              store.executeWithEnvironment(query, [storeUri], [], (success, results) => {
                console.log("\x1b[32m", results.length, "node(s) in store for type [", entitytype, "]\x1b[0m");
              });
            }
          });

          store.close(); // done ?!??!
        }
      });
    }
  });
}

module.exports.executeSparql = function (query) {
  rdfstore.create({ persistent: true }, function (err, store) {
    if (err) {
      console.log("\x1b[31m", "There was an error creating the store", err, "\x1b[0m");
    } else {

      let sparqlQuery = "PREFIX disco: <" + storeUri + "> " + query;

      console.log("execute query [\x1b[7m", sparqlQuery.replace(/\s+/g, " "), "\x1b[0m]");
      store.executeWithEnvironment(sparqlQuery, [storeUri], [], (error, results) => {
        if (error) {
          console.log("\x1b[31m", "There was an error executing the query", error, "\x1b[0m");
          throw error;
        } else {
          console.log("\x1b[32m", results.length, "node(s) in store\x1b[0m");
          results.forEach(element => {
            console.log(element);
          });
        }
      });
    }
  });
}

module.exports.buildJsonLd = function () {

  let filenamesInFolder = fs.readdirSync(dbSeedFolderPath);
  filenamesInFolder.forEach(file => {

    let match = file.match(/([^\_]{1,4}\_)?([^\.]*)\.json$/i);
    if (match) {

      let order = match[1];
      let entityset = match[2];
      console.log("Process entityset ", "\x1b[36m", entityset, "\x1b[0m");

      let datafile = path.posix.resolve(dbSeedFolderPath, file);
      let dataset = require(datafile);
      let uri = storeUri + entityset;

      let template = null;
      let templatefile = path.join(dbSeedFolderPath, "templates", entityset + ".json");
      try {
        template = require(templatefile);
        console.log("\x1b[32m", "Successfully loaded template file", "\x1b[0m", templatefile);
      } catch (err) {
        console.log("\x1b[31m", "Failed to load template file", templatefile, "\x1b[0m");
      }

      if (template) {
        let transformation = macros.JSONLDMacro.buildTransformation(template[storeUri + entityset]);
        let jsonld = macros.JSONLDMacro.applyTransformation(transformation, dataset);

        let json = JSON.stringify(jsonld, null, 2);
        let orderedEntityName = (order || "") + entityset;
        let filename = path.join(dbSeedFolderPath, "data", orderedEntityName + ".jsonld");

        let folderPath = path.join(dbSeedFolderPath, "data");
        try { fs.accessSync(folderPath, "w"); } catch (err) { fs.mkdirSync(folderPath); }
        fs.writeFileSync(filename, json);
      }
    }
  });
}

// TODO: define xsd.guid
/*

<?xml version="1.0" encoding="utf-8"?>
<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    targetNamespace="http://microsoft.com/wsdl/types/" >
    <xsd:simpleType name="guid">
        <xsd:annotation>
            <xsd:documentation xml:lang="en">
                The representation of a GUID, generally the id of an element.
            </xsd:documentation>
        </xsd:annotation>
        <xsd:restriction base="xsd:string">
            <xs:pattern value="([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}"/>
        </xsd:restriction>
    </xsd:simpleType>
</xsd:schema>

*/