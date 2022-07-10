# cucumber-formatter-teamcity

[![npm version](https://badge.fury.io/js/cucumber-formatter-teamcity.svg)](https://www.npmjs.com/package/cucumber-formatter-teamcity)
[![Build Status](https://github.com/RockMinsk/cucumber-formatter-teamcity/actions/workflows/continuous-build.yml/badge.svg)](https://github.com/RockMinsk/cucumber-formatter-teamcity/actions/workflows/continuous-build.yml)

> TeamCity formatter for @cucumber/cucumber npm package

## Install

```sh
$ npm install cucumber-formatter-teamcity --save-dev
```

## Usage

There are 2 ways to use cucumber-formatter-teamcity as described [here](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)

### 1. On the CLI:

```sh
$ cucumber-js --format node_modules/cucumber-formatter-teamcity
```

### 2. In a configuration file:

```sh
{ format: node_modules/cucumber-formatter-teamcity }
```

### Note:
If you need to use cucumber-formatter-teamcity only on CI, you can specify it in such way in configuration file:

```javascript
    format: [
        `json:${pathToCucumberJsonReport}`,
        `summary`,
        `progress-bar`,
        ...(process.env.CI ? [`node_modules/cucumber-formatter-teamcity`] : [])
    ],
```

## Configuration

You have possibility
* to publish artifacts (only screenshots for now) related to failed tests while TeamCity build is running;
* to link artifacts (only screenshots for now) with failed tests - in this case screenshot will be available in `Tests` tab, in expanded section of failed test:

| Example of screenshot linked to failed test |
|:-------------------------:|
|![Example Errors Report](https://i.postimg.cc/WbNtkFr3/Screenshot-1.png) |

To do this you need to use the following environment variables (set appropriate values):

* `CUCUMBER_TEAMCITY_LOCAL_SCREENSHOT_DIR` - set path to local directory where stored screenshots 
* `CUCUMBER_TEAMCITY_SCREENSHOT_NAME` - set name + extension (e.g. `TEST_NAME.png`) of the screenshot that saved - you can do it in `After` hook for each failed test
* `CUCUMBER_TEAMCITY_ARTIFACTS_SUBDIR` - set this variable if you use some subdirectory for screenshots inside the TeamCity artifacts storage. Don't set it if you save screenshots directly in Artifacts.

| Example of TeamCity artifacts subdirectories |
|:-------------------------:|
|![Example Errors Report](https://i.postimg.cc/QMdpJ8zg/Screenshot-2.png) |