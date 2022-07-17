import { Formatter, Status, formatterHelpers } from '@cucumber/cucumber';
import path from 'path';

let storedFeatureName: string = ``;

export default class TeamCityFormatter extends Formatter {
    constructor(options) {
        super(options);

        options.eventBroadcaster.on('envelope', (envelope) => {
            if (envelope.testCaseStarted) {
                this.logTestCaseStarted(envelope.testCaseStarted.id)
            }
            if (envelope.testCaseFinished) {
                this.logTestCaseFinished(envelope.testCaseFinished.testCaseStartedId)
            }
            if (envelope.testRunFinished) {
                this.log(`##teamcity[testSuiteFinished name='${storedFeatureName}']\n`);
            }
        });
    }

    logTestSuiteChanged(currentFeature): void {
        if (currentFeature.name !== storedFeatureName) {
            if (storedFeatureName) {
                this.log(`##teamcity[testSuiteFinished name='${storedFeatureName}']\n`);
            }
            this.log(`##teamcity[testSuiteStarted name='${this.escape(currentFeature.name)}']\n`);
            storedFeatureName = currentFeature.name;
        }
    }

    logTestCaseStarted(id): void {
        const { gherkinDocument: { feature: currentFeature }, pickle: { name: pickleName} } = this.eventDataCollector.getTestCaseAttempt(id);

        this.logTestSuiteChanged(currentFeature);
        this.log(`##teamcity[testStarted name='${this.escape(pickleName)}' captureStandardOutput='true']\n`);
    }

    logTestCaseFinished(testCaseStartedId): void {
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

    logTestFailed(pickleName, testCaseAttempt, stepStatus): void {
        const details = formatterHelpers.formatIssue({
            colorFns: this.colorFns,
            number: 1,
            snippetBuilder: this.snippetBuilder,
            testCaseAttempt,
            supportCodeLibrary: this.supportCodeLibrary
        });

        this.log(`##teamcity[testFailed name='${this.escape(pickleName)}' message='${this.escape(pickleName + ' ' + stepStatus)}' details='${this.escape(details)}']\n`);
    }

    logArtifacts(pickleName): void {
        if (process.env.TEAMCITY_CUCUMBER_PATH_TO_SCREENSHOTS) {
            const screeshotName: string = process.env.TEAMCITY_CUCUMBER_SCREENSHOT_NAME ? process.env.TEAMCITY_CUCUMBER_SCREENSHOT_NAME : pickleName;
            const screenshotExtension: string = process.env.TEAMCITY_CUCUMBER_SCREENSHOT_EXTENSION ? process.env.TEAMCITY_CUCUMBER_SCREENSHOT_EXTENSION : `png`;
            const pathToScreenshot: string = path.resolve(process.env.TEAMCITY_CUCUMBER_PATH_TO_SCREENSHOTS, `${screeshotName}.${screenshotExtension}`);
            if (process.env.TEAMCITY_CUCUMBER_PUBLISH_ARTIFACTS_RUNTIME) {
                const artifactsPathPostfix: string = process.env.TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER ? ` => ${process.env.TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER}` : ``;
                this.log(`##teamcity[publishArtifacts '${this.escape(pathToScreenshot + artifactsPathPostfix)}']\n`);
            }
            const artifactsSubFolder: string = process.env.TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER ? `${process.env.TEAMCITY_CUCUMBER_ARTIFACTS_SUB_FOLDER}/` : ``;
            this.log(`##teamcity[testMetadata type='image' name='${this.escape(pickleName)}' value='${this.escape(artifactsSubFolder + `${screeshotName}.${screenshotExtension}`)}']\n`);
        }

    }

    logTestFinished(pickleName, durationInSeconds): void {
        this.log(`##teamcity[testFinished name='${this.escape(pickleName)}' duration='${durationInSeconds}']\n`);
    }

    escape(text): string {
        return text
            .replace(/\|/g, '||')
            .replace(/'/g, '|\'')
            .replace(/\n/g, '|n')
            .replace(/\r/g, '|r')
            .replace(/\[/g, '|[')
            .replace(/]/g, '|]');
    }
}
