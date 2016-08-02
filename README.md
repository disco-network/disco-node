# disco-node [![Build status](https://travis-ci.org/disco-network/disco-node.svg)](https://travis-ci.org/disco-network/disco-node)
**An OData and SPARQL endpoint to be part of the d!sco network**

[The d!sco network](https://disco-network.org) is the implementation of a meta discussion system. We rapid prototype an Ontology and Web API to serve as a data hub inside a P2P network. Be involved!

The [`disco-node`](https://github.com/disco-network/disco-node) repository is where we do development and there are many ways you can participate in the project, for example:

* [Submit bugs and feature requests](https://github.com/disco-network/disco-node/issues) and help us verify as they are checked in
* Review [source code changes](https://github.com/disco-network/disco-node/pulls)
* Review the [documentation](https://github.com/disco-network/disco-node-docs) and make pull requests for anything from typos to new content

We are using [`vscode`](https://code.visualstudio.com/) for development.

## Prerequisites

You will need [`nodejs`](https://nodejs.org/), at least v4.4.7, to run [`disco-node`](https://github.com/disco-network/disco-node).

### For Development
We are using [`TypeScript`](https://www.typescriptlang.org/) as programming language.
```
npm install typescript
```

We are using [`gulp`](https://www.gulpjs.org/) as our task runner.
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

## Usage

```shell
gulp server
```

## License

[MIT](https://github.com/disco-network/disco-node/blob/master/LICENSE)