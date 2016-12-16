# disco-node [![Build status](https://travis-ci.org/disco-network/disco-node.svg)](https://travis-ci.org/disco-network/disco-node)
**An [OData v4.0](https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part1-protocol.html) and [SPARQL](https://www.w3.org/TR/rdf-sparql-query/) endpoint to be part of the [Discussion Ontology Network](http://disco-network.org/)**

The [Discussion Ontology Network](https://disco-network.org) (d!sco) is the implementation of a meta discussion system. We emphasizes free and open source technology and support standardized technology like the [OASIS Open Data Protocol (OData)](https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part1-protocol.html) and [SPARQL Query Language for RDF](https://www.w3.org/TR/rdf-sparql-query/). Be involved!

The [`disco-node`](https://github.com/disco-network/disco-node) repository is where we do development and there are many ways you can participate in the project, for example:

* [Submit bugs and feature requests](https://github.com/disco-network/disco-node/issues) and help us verify as they are checked in
* Review [source code changes](https://github.com/disco-network/disco-node/pulls)
* Review the [documentation](https://github.com/disco-network/disco-node-docs) and make pull requests for anything from typos to new content

## Prerequisites

You will need [`nodejs`](https://nodejs.org/), at least v4.4.7, to run [`disco-node`](https://github.com/disco-network/disco-node).

Create your workspace:
```shell
md workspace && cd workspace
```

### Get the Code

```shell
git clone https://github.com/disco-network/disco-node.git disco-node
cd disco-explorer
```

### Development

We are using [`vscode`](https://code.visualstudio.com/) for development.

#### Dependencies

We are using [`TypeScript`](https://www.typescriptlang.org/) as programming language.
```
npm install typescript
```

We are using [`gulp`](https://www.gulpjs.org/) as our advanced task runner.
```
npm install gulp
```

We are using [`jasmine`](https://jasmine.github.io/) for unit testing.
```
npm install jasmine
```

## Installing

```shell
npm install
```

## Database

You need a triple store to persist the data.

Currently [Apache Jena Fuseki2](https://jena.apache.org/documentation/fuseki2/index.html) needs to be installed on your machine. You can download it [here](http://apache.mirror.iphh.net/jena/binaries/apache-jena-fuseki-2.4.1.tar.gz). If you unpack it next to the `disco-node` folder, all scripts work out of the box.

## Usage

Start the triple store:
```shell
npm run store
```

Start the web server:
```shell
npm run server
```

## License

[MIT](https://github.com/disco-network/disco-node/blob/master/LICENSE)
