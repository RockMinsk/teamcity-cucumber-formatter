import { Formatter, Status, formatterHelpers } from '@cucumber/cucumber';
import * as path from 'path';

export class TeamCityFormatter extends Formatter {
    constructor(options) {
        super(options);
        this.storedFeatureName = ``;

        options.eventBroadcaster.on('envelope', (envelope) => {
            if (envelope.testCaseStarted) {
                this.logTestCaseStarted(envelope.testCaseStarted.id)
            }
            if (envelope.testCaseFinished) {
                this.logTestCaseFinished(envelope.testCaseFinished.testCaseStartedId)
            }
            if (envelope.testRunFinished) {
                this.log(`##teamcity[testSuiteFinished name='${this.storedFeatureName}']\n`);
            }
        });
    }

    logTestSuiteChanged(currentFeature) {
        if (currentFeature.name !== this.storedFeatureName) {
            if (this.storedFeatureName) {
                this.log(`##teamcity[testSuiteFinished name='${this.storedFeatureName}']\n`);
            }
            this.log(`##teamcity[testSuiteStarted name='${this.escape(currentFeature.name)}']\n`);
            this.storedFeatureName = currentFeature.name;
        }
    }

    logTestCaseStarted(id) {
        const { gherkinDocument: { feature: currentFeature }, pickle: { name: pickleName} } = this.eventDataCollector.getTestCaseAttempt(id);

        this.logTestSuiteChanged(currentFeature);
        this.log(`##teamcity[testStarted name='${this.escape(pickleName)}' captureStandardOutput='true']\n`);
    }

    logTestCaseFinished(testCaseStartedId) {
        const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseStartedId);
        const { pickle: { name: pickleName}, stepResults: currentStepResults } = testCaseAttempt;

        for (const step of Object.values(currentStepResults)) {
            if (step.status === Status.FAILED) {
                this.logTestFailed(pickleName, testCaseAttempt, step.status);
                this.logArtifacts(pickleName);
            }
            if (step.status === Status.AMBIGUOUS) {
                this.logTestFailed(pickleName, testCaseAttempt, step.status);
            }
        }

        const testCaseDurationInSeconds = (Object.values(currentStepResults).map(obj => obj.duration.nanos)
            .reduce((acc, curr) => acc + curr) / 1e9).toFixed(3);

        this.logTestFinished(pickleName, testCaseDurationInSeconds);
    }

    logTestFailed(pickleName, testCaseAttempt, stepStatus) {
        const details = formatterHelpers.formatIssue({
            colorFns: this.colorFns,
            number: 1,
            snippetBuilder: this.snippetBuilder,
            testCaseAttempt,
            supportCodeLibrary: this.supportCodeLibrary
        });

        this.log(`##teamcity[testFailed name='${this.escape(pickleName)}' message='${this.escape(pickleName + ' ' + stepStatus)}' details='${this.escape(details)}']\n`);
    }

    logArtifacts(pickleName) {
        if (process.env.CUCUMBER_TEAMCITY_LOCAL_SCREENSHOT_DIR && process.env.CUCUMBER_TEAMCITY_SCREENSHOT_NAME) {
            const pathToScreenshot = path.resolve(process.env.CUCUMBER_TEAMCITY_LOCAL_SCREENSHOT_DIR, process.env.CUCUMBER_TEAMCITY_SCREENSHOT_NAME);
            const artifactsPathPostfix = process.env.CUCUMBER_TEAMCITY_ARTIFACTS_SUBDIR ? ` => ${process.env.CUCUMBER_TEAMCITY_ARTIFACTS_SUBDIR}` : ``;
            this.log(`##teamcity[publishArtifacts '${this.escape(pathToScreenshot + artifactsPathPostfix)}']\n`);
            const artifactsSubFolder = process.env.CUCUMBER_TEAMCITY_ARTIFACTS_SUBDIR ? `${process.env.CUCUMBER_TEAMCITY_ARTIFACTS_SUBDIR}/` : ``;
            this.log(`##teamcity[testMetadata type='image' name='${this.escape(pickleName)}' value='${this.escape(artifactsSubFolder + process.env.CUCUMBER_TEAMCITY_SCREENSHOT_NAME)}']\n`);
        }

    }

    logTestFinished(pickleName, durationInSeconds) {
        this.log(`##teamcity[testFinished name='${this.escape(pickleName)}' duration='${durationInSeconds}']\n`);
    }

    escape(text) {
        return text
            .replace(/\|/g, '||')
            .replace(/'/g, '|\'')
            .replace(/\n/g, '|n')
            .replace(/\r/g, '|r')
            .replace(/\[/g, '|[')
            .replace(/]/g, '|]');
    }
}
