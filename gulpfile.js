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

gulp.task("lint", function() {
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
    mapSources: function(sourcePath) {
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

gulp.task("build-spec", function() {
    return build(["source/**/*.ts", "typings/**.d.ts", "!./node_modules/**"], "./source", "");
});
gulp.task("build-lib", function() {
    return build(["source/lib/**/*.ts", "typings/**.d.ts", "!./node_modules/**"], "./source", "lib");
});

gulp.task("build-package.json", function() {
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

gulp.task("copy", function() {
    return gulp.src([
        "./source/lib/*.json",
        "./source/lib/*.xml",
        "README.md",
        "LICENSE"
    ])
        .pipe(gulp.dest("build/lib"));
});

gulp.task("build", function(cb) {
    return runSequence(
        "clean-all",
        ["build-lib", "copy", "build-package.json"],
        cb
    );
});

gulp.task("clean-all", function() {
    return del(["./build"]);
});

gulp.task("specs");

gulp.task("server", function() {
    require("./build/lib/server");
});



gulp.task("build-json-ld", function() {
    buildJsonLd();
});


var storeUri = "http://disco-network.org";
var macros = require("json-ld-macros");
var macroApiTemplate = {
    "@declare":
    {
        "test": "http://socialrdf.org/functions/",
        "test:f": 'function(argument, input, obj){ debugger; return makeId(argument, input, obj); }'
    },

    "http://disco-network.org/{path}/{entityset}":
    {
        "$": // selects the root node / list of root nodes of the JSON document

        {// by default, all properties in the selected nodes will have the 'gh' prefix
            "@ns": { "ns:default": "disco" },
            // a JSON-LD context declaration that will be added to all the selecte nodes
            "@context": { "disco": "http://disco-network.org" },
            // a JSON-LD type declaration that will be added to all the selecte nodes
            // "@type": "http://disco-network.org/resource/{entityset}",

            "@transform": {
                "@id": [{ "f:valueof": "Id" }]
            }
        }
    }
};

function buildJsonLd() {
    macros.JSONLDMacro.clearAPIs();
    macros.JSONLDMacro.registerAPI(macroApiTemplate);

    let fullPath = path.join(__dirname, "db", "seed");
    let filenamesInFolder = fs.readdirSync(fullPath);
    filenamesInFolder.forEach(filename => {

        let match = filename.match(/([^\.]*)\.json$/i);
        if (match) {

            let filePath = path.posix.resolve(fullPath, filename);
            console.log(filePath);

            let entityset = match[1];
            let set = require(filePath);

            let index;
            for (index = 0; index < set.value.length; ++index) {
                let data = set.value[index];
                console.log(data);

                let uri = storeUri + "/resource/" + entityset;
                let jsonld = macros.JSONLDMacro.resolve(uri, data);
                console.log(jsonld);

                let json = JSON.stringify(jsonld, null, 2);
                let filename = path.join(fullPath, "json-ld", entityset + "_" + ("000" + index).slice(-4) + ".jsonld");
                fs.writeFileSync(filename, json);
            }
        }
    });

}
