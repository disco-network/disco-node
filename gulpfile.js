"use strict";
var fs = require("fs");
var path = require("path");
var merge = require('merge2');
var gulp = require("gulp"),
  runSequence = require("run-sequence"),
  del = require("del"),
  jasmine = require("gulp-jasmine"),
  tslint = require("gulp-tslint"),
  ts = require("gulp-typescript"),
  sourcemaps = require("gulp-sourcemaps");

gulp.task("lint", function () {
  return gulp.src([
    "**",
    "!**/*.d.ts",
    "!**/typings/**"
  ])
    .pipe(tslint({}))
    .pipe(tslint.report("verbose"));
});

var sourceMapsConfig = {
  includeContent: false,
  mapSources: function (sourcePath) {
    // HACK: The sourcemaps do not reference source files correctly!
    // The recieved sourcePath always starts with '../../source/lib/',
    // resulting from the current folder structure!
    // This indeed is not feasable for files nested on different levels.
    // Therefor we need to count the folder depth of the current file.
    // This is done by counting the overall slashes within the path.
    // To get the additional ones, we need to subtract the initial path count.
    // For this project setting it is the magic number of 4. Please adjust 
    // this to your project needs. 
    const initialPathCount = 4;
    let depthCount = (sourcePath.match(/\//g) || []).length;
    let pathUps = "../".repeat(Math.max(depthCount, initialPathCount) - initialPathCount);
    return pathUps + sourcePath;
  }
};

var tsProject = ts.createProject("tsconfig.json");

function build(sourcePath, base, targetPath) {
  var tsResult = gulp.src(sourcePath, { base: base })
    .pipe(sourcemaps.init())
    .pipe(tsProject(ts.reporter.longReporter()));

  return merge([
    tsResult.dts
      .pipe(gulp.dest("build/")),
    tsResult.js
      .pipe(sourcemaps.write(".", sourceMapsConfig))
      .pipe(gulp.dest("build/"))
  ]);
};

gulp.task("build-spec", function () {
  return build(["source/**/*.ts", "typings/**.d.ts", "!./node_modules/**"], "./source", "");
});
gulp.task("build-lib", function () {
  return build(["source/lib/**/*.ts", "typings/**.d.ts", "!./node_modules/**"], "./source", "lib");
});

gulp.task("build-package.json", function () {
  var appPackageJson = JSON.parse(fs.readFileSync(__dirname + "/package.json", "utf8"));
  var npmPackageJson = {
    "name": appPackageJson.name,
    "description": appPackageJson.description,
    "version": appPackageJson.version,
    "author": appPackageJson.author,
    "repository": appPackageJson.repository,
    "main": "server.js",      // TODO: generate this from app package.json
    "typings": "server.d.ts", // TODO: generate this from app package.json
    "dependencies": appPackageJson.dependencies,
    "keywords": appPackageJson.keywords,
    "license": appPackageJson.license,
    "bugs": appPackageJson.bugs
  }
  fs.mkdirSync(path.join(__dirname, "build"));
  fs.mkdirSync(path.join(__dirname, "build", "lib"));
  fs.writeFileSync(path.join(__dirname, "build", "lib", "package.json"), JSON.stringify(npmPackageJson, null, 2));
});

gulp.task("copy", function () {
  return gulp.src([
    "./source/lib/*.json",
    "./source/lib/*.xml",
    "README.md",
    "LICENSE"
  ])
    .pipe(gulp.dest("build/lib"));
});

gulp.task("build", function (cb) {
  return runSequence(
    "clean-all",
    ["build-lib", "copy", "build-package.json"],
    cb
  );
});

gulp.task("clean-all", function () {
  return del(["./build"]);
});

gulp.task("specs");

gulp.task("server", function () {
  require("./build/lib/server");
});



gulp.task("build-json-ld", function () {
  buildJsonLd();
});

gulp.task("seed-db", ["build-json-ld"], function () {
  seedDb();
});

gulp.task("clean-db", function () {
  return del(["./db/rdfstorejs_*.json", "./db/seed/data/*.jsonld"]);
});

gulp.task("build-db", function (cb) {
  return runSequence(
    "clean-db",
    ["build-json-ld", "seed-db"],
    cb
  );
});

var macros = require("json-ld-macros");
var rdfstore = require('rdfstore');

var storeUri = "http://disco-network.org/resource/";
var dbSeedFolderPath = path.join(__dirname, "db", "seed");

function seedDb() {

  rdfstore.create({ persistent: true }, function (err, store) {
    // the new store is ready
    if (err) {
      throw err;
    } else {
      // loading local data

      store.rdf.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
      store.rdf.setPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");
      store.rdf.setPrefix("disco", storeUri);

      let jsonldFolderPath = path.join(dbSeedFolderPath, "data");
      let filenamesInFolder = fs.readdirSync(jsonldFolderPath);
      filenamesInFolder.forEach(file => {

        let match = file.match(/([^\.]*)\.jsonld$/i);
        if (match) {

          let entityset = match[1];
          console.log("Process entityset ", "\x1b[36m", entityset, "\x1b[0m");

          let filename = path.join(jsonldFolderPath, file);
          console.log("seed data from file", "\x1b[36m", filename, "\x1b[0m");

          let jsonld = fs.readFileSync(filename).toString();

          store.load("application/ld+json", jsonld, storeUri, function (err, results) {
            if (err) {
              console.log("\x1b[31m", "There was an error seeding the store", err, "\x1b[0m");
            } else {
              store.node("disco:" + entityset + "/1", storeUri, function (err, graph) {

                if (err) {
                  console.log("\x1b[31m", "There was an error retrieving the data for", entityset, err, "\x1b[0m");
                }
                else {
                  let triples = graph.toArray();
                  console.log("\x1b[32m", "Successfully inserted", triples.length, "triples for", entityset, "into the store", "\x1b[0m");
                }
              });
            }
          });

          store.close(); // done ?!??!
        }
      });
    }
  });
}

function buildJsonLd() {

  // macros.JSONLDMacro.clearAPIs();
  // macros.JSONLDMacro.registerAPI(macroApiTemplate);

  let filenamesInFolder = fs.readdirSync(dbSeedFolderPath);
  filenamesInFolder.forEach(file => {

    let match = file.match(/([^\.]*)\.json$/i);
    if (match) {

      let entityset = match[1];
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
        let filename = path.join(dbSeedFolderPath, "data", entityset + ".jsonld");
        fs.writeFileSync(filename, json);
      }
    }
  });
}
