# teamcity-cucumber-formatter

[![npm version](https://badge.fury.io/js/teamcity-cucumber-formatter.svg)](https://www.npmjs.com/package/teamcity-cucumber-formatter)
[![Build Status](https://github.com/RockMinsk/teamcity-cucumber-formatter/actions/workflows/continuous-build.yml/badge.svg)](https://github.com/RockMinsk/teamcity-cucumber-formatter/actions/workflows/continuous-build.yml)

> TeamCity formatter for [@cucumber/cucumber](https://www.npmjs.com/package/@cucumber/cucumber) npm package

## Install

```sh
$ npm install teamcity-cucumber-formatte --save-dev
```

## Usage

There are 2 ways to use teamcity-cucumber-formatter as described [here](https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md)

### 1. On the CLI:

```sh
$ cucumber-js --format node_modules/teamcity-cucumber-formatter
```

### 2. In a configuration file:

```sh
{ format: node_modules/teamcity-cucumber-formatter }
```

### Note:
If you need to use teamcity-cucumber-formatter only on CI, you can specify it in such way in configuration file:

```javascript
    format: [
        `json:${pathToCucumberJsonReport}`,
        `summary`,
        `progress-bar`,
        ...(process.env.CI ? [`node_modules/teamcity-cucumber-formatter`] : [])
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
* `TEAMCITY_CUCUMBER_SCREENSHOT_NAME` - set a custom name.extension value of the saved screenshot (e.g. `TIMESTAMP_TEST_NAME.png`). You can do it in `After` hook for each failed test. Don't set it if your screenshot has the same name as a test and you use `png` format (e.g. `TEST_NAME.png`).
* `TEAMCITY_CUCUMBER_PUBLISH_ARTIFACTS_RUNTIME` - set this variable (e.g. use `true` value) if you want to publish artifacts while TeamCity build is running. Don't set it if you save screenshots directly in Artifacts.
* `TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER` - set this variable if some subfolder for screenshots is used inside the TeamCity artifacts storage (e.g. `screenshots`). Don't set it if you save screenshots directly in Artifacts.

| Example of TeamCity artifacts subdirectories |
|:-------------------------:|
|![Example Errors Report](https://i.postimg.cc/QMdpJ8zg/Screenshot-2.png) |