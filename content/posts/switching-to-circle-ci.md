---
title: Switching to Circle CI
date: 2020-01-26T22:15:00+07:00
categories: [log]
tags: [devops]
images: [/img/circleci.png]
---
I used to use [Travis CI](https://travis-ci.org) for running my test suites. But now I'm switching to [Circle CI](https://circleci.com) for my latest open-source JavaScript project: [helpers](https://github.com/risan/helpers). Though it has no build matrix feature out of the box, the test suites often complete faster (I'm speaking about the free version here).

Similar to Travis CI, Circle CI also uses a YAML file for configuration. We have to store this configuration file in `.circleci/config.yml`. Here's the Circle CI configuration file that I use in my latest JavaScript project. Note that I use [Yarn](https://yarnpkg.com) instead of the built in NPM for the package manager in this project.

```yaml
version: 2.1
jobs:
  build:
    working_directory: ~/repo
    docker:
      - image: circleci/node:10.18.0
    steps:
      - checkout
      - restore_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}
      - run:
          name: install-dependencies
          command: yarn install --frozen-lockfile
      - save_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}
          paths:
            - ~/.cache/yarn
      - run:
          name: run-tests
          command: yarn test
      - run:
          name: upload-coverage
          command: bash <(curl -s https://codecov.io/bash) -t ${CODECOV_TOKEN}
```

* `build` is a special job that will be run every time we push our code to our VCS provider.
* `working_directory` is a directory where the steps will be run. If it doesn't exist, the directory will be created automatically.
* `image` is the docker image that we would like to use. In my case, it's the [`circleci/node:10.18.0`](https://registry.hub.docker.com/layers/circleci/node/10.18.0/images/sha256-76c3eaa8dcc3bc0f812a4c5bcd2c7976204f96d449fb6313d7c60d2b73d90e2e). Since it's the earliest Node version that's still being maintaned. The Yarn package manager is also included in this image.
* `checkout` is a special step that will pull our code to the specified `working_directory`.
* The `restore_cache` is a step that will try to restore the previously saved cache based on its `key`. In our case, the cache is the node modules, that's why we use the `yarn.lock` to uniquely identify the cache.
* While the `save_cache` is a step where we store the cache for any further builds.
* `run` is used for invoking a shell command. The first `run` is for installing all dependencies. The second `run` is for running the test suites.



## Code Coverage

I'm using [Jest](https://jestjs.io/) to run my test suites and it can collect code coverage information out of the box. All we have to do is to set the `collectCoverage` in our `jest.config.js` file to `true`:

```js
module.exports = {
  // other options...

  collectCoverage: true,
};
```

By default, the coverage report will be stored in a `coverage` directory. And in the last `run` I invoke a command to upload this coverage report to [Codecov](https://codecov.io/). I'm using an environment variable named `CODECOV_TOKEN` to store the Codecov upload token. You can set this environment variable in **Project Settings** > **Environment Variables**.

There's also an Orb (sharable configuration element in Circle CI) for Codecov integration that we can use: [codecov/codecov](https://circleci.com/orbs/registry/orb/codecov/codecov). But I think the Codecov bash uploader is a very simple command that we can use directly.

## Note for NPM

If you use a default NPM package manager, there's a slight configuration difference.

```yaml
- restore_cache:
    # Use package-lock.json
    key: dependency-cache-{{ checksum "package-lock.json" }}
- run:
    name: install-dependencies
    command: npm install
- save_cache:
    key: dependency-cache-{{ checksum "package-lock.json" }}
    paths:
      - ./node_modules # Different cache paths
- run:
    name: run-tests
    command: npm run test
```

Also, note that the caching mechanism will only work if you track the generated `yarn.lock` or `package-lock.json`. If you don't track these files, as an alternative you can use the `package.json` file directly to generate a unique checksum for the cache key.
