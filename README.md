# teamcity-cucumber-formatter

[![npm version](https://badge.fury.io/js/teamcity-cucumber-formatter.svg)](https://www.npmjs.com/package/teamcity-cucumber-formatter)
[![Build Status](https://github.com/RockMinsk/teamcity-cucumber-formatter/actions/workflows/continuous-build.yml/badge.svg)](https://github.com/RockMinsk/teamcity-cucumber-formatter/actions/workflows/continuous-build.yml)

> TeamCity formatter for [@cucumber/cucumber](https://www.npmjs.com/package/@cucumber/cucumber) npm package

## Install

```sh
$ npm install teamcity-cucumber-formatter --save-dev
```

## Usage

There are 2 ways to use teamcity-cucumber-formatter as described [here](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)

### 1. On the CLI (Cucumber v.7.0.0 - 9.6.0):

```sh
$ cucumber-js --format ./node_modules/teamcity-cucumber-formatter
```

### 2. In a configuration file (Cucumber v.7.0.0 - 9.6.0):

```javascript
{ format: './node_modules/teamcity-cucumber-formatter' }
```

### 3. In a configuration file (Cucumber v.10.0.0+):
```javascript
import * as path from 'path';
import { pathToFileURL } from 'url';

const teamCityModulePath = path.resolve('node_modules', 'teamcity-cucumber-formatter', 'dist', 'teamcity-cucumber-formatter.js');
const teamCityModuleFilePath = pathToFileURL(teamCityModulePath).href;
...
{ format: [`"${teamCityModuleFilePath}"`] }
```

### Note:
If you need to use teamcity-cucumber-formatter only on CI, you can specify it in such way in configuration file:

Cucumber v.7.0.0 - 9.6.0:
```javascript
    format: [
        `json:${pathToCucumberJsonReport}`,
        `summary`,
        `progress-bar`,
        ...(process.env.CI ? [path.resolve('node_modules', 'teamcity-cucumber-formatter')] : [])
    ],
```
Cucumber v.10.0.0+:
```javascript
    const teamCityModulePath = path.resolve('node_modules', 'teamcity-cucumber-formatter', 'dist', 'teamcity-cucumber-formatter.js');
    const teamCityModuleFilePath = pathToFileURL(teamCityModulePath).href;
    
    format: [
        `json:${pathToCucumberJsonReport}`,
        `summary`,
        `progress-bar`,
        ...(process.env.CI ? [`"${teamCityModuleFilePath}"`] : [])
    ],
```

## Configuration

You have possibility
* to publish artifacts (only screenshots for now) related to failed tests while TeamCity build is running as described [here](https://www.jetbrains.com/help/teamcity/service-messages.html#Publishing+Artifacts+While+Build+is+in+Progress);
* to link artifacts (only screenshots for now) with failed tests as described [here](https://www.jetbrains.com/help/teamcity/reporting-test-metadata.html#Images+from+Artifacts+Directory). In this case screenshot will be available in `Tests` tab, in expanded section of failed test:

| Example of screenshot linked to failed test |
|:-------------------------:|
|![Example Errors Report](https://i.postimg.cc/WbNtkFr3/Screenshot-1.png) |

To have possibility to link and publish artifacts you need to use the following environment variables (set appropriate values):

* `TEAMCITY_CUCUMBER_PATH_TO_SCREENSHOTS` - set a relative path (from project root, e.g. `./test_artifacts/screenshots`) to local directory where screenshots are stored.
* `TEAMCITY_CUCUMBER_SCREENSHOT_NAME` (optional) - set a name of saved screenshot (e.g. `TIMESTAMP_TEST_NAME`). You can do it in `After` hook for each failed test. By default a `pickle.name` value is used.
* `TEAMCITY_CUCUMBER_SCREENSHOT_EXTENSION` - set an extension of saved screenshot. Be default a `png` format is used.
* `TEAMCITY_CUCUMBER_PUBLISH_ARTIFACTS_RUNTIME` - set this variable (e.g. use `true` value) if you want to publish artifacts while TeamCity build is running.
* `TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER` - set this variable if some subfolder for screenshots is used inside the TeamCity artifacts storage (e.g. `screenshots`). Don't set it if you save screenshots directly in Artifacts.

| Example of TeamCity artifacts subdirectories |
|:-------------------------:|
|![Example Errors Report](https://i.postimg.cc/QMdpJ8zg/Screenshot-2.png) |