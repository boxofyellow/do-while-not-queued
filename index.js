const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const { Octokit } = require('@octokit/action');
const octokit = new Octokit()

// After making changes here make sure to compile it into dist with
// ncc build index.js

function getIntegerInput(core, name, min = null, max = null) {
    const raw = core.getInput(name);
    const result = Number(raw);

    if (Number.isNaN(result) || !Number.isInteger(result)) {
        core.setFailed(`${name} needs to be a an integer, found ${raw}`);
        return null;
    }

    if (min !== null && result < min) {
        core.setFailed(`${name} needs to be greater than or equal to ${min}, found ${raw}`);
        return null;
    }

    if (max !== null && result > max) {
        core.setFailed(`${name} needs to be less than or equal to ${max}, found ${raw}`);
        return null;
    }

    return result;
}

async function run() {
    try {
        const commandLine = core.getInput('command-line');
        const args = core.getInput('args');
        const separator = core.getInput('args-separator');
        const workflow = core.getInput('workflow');

        const checkEvery = getIntegerInput(core, 'check-every', 1);
        if (checkEvery === null) {
            return;
        }

        const detailLevel = getIntegerInput(core, 'detail-level', 0, 2);
        if (detailLevel === null) {
            return;
        }

        const maxRuns = getIntegerInput(core, 'max-runs');
        if (maxRuns === null) {
            return;
        }

        const maxTimeSec = getIntegerInput(core, 'max-time-seconds');
        if (maxTimeSec === null) {
            return;
        }

        const startTime = new Date().getTime(); 
        const endTime = startTime + (maxTimeSec * 1000);

        if (detailLevel > 0) {
            console.log(`Looking for workflow: ${workflow}`);
        }

        var argumentsToPass = null;
        if (args) {
            argumentsToPass = args.split(separator);
        }

        const options = {
            silent: detailLevel < 2
        };

        const owner = github.context.payload.repository.owner.name;
        const repo = github.context.payload.repository.name;

        var count = 0;
        while (true) {
            for (var i = 0; i < checkEvery; i++) {
                count++;

                if (maxRuns > 0 && count > maxRuns) {
                    console.log(`Reached ${count}`);
                    return;
                }

                if (detailLevel > 0) {
                    console.log(`Starting ${count}`);
                }

                var exitCode = await exec.exec(commandLine, argumentsToPass, options);
                if (exitCode !== 0)
                {
                    console.setFailed(`Got a non-zero exit code ${exitCode}`);
                }

                var now = new Date().getTime();
                if (maxTimeSec > 0 && (now > endTime)) {
                    var ranFor = (now - startTime) / 1000;
                    console.log(`Ran for ${ranFor}s`);
                    return;
                }
            }

            var result = await octokit.actions.listWorkflowRunsForRepo({
                owner: owner,
                repo: repo,
                workflow_file_name: workflow,
                status: 'queued'
            });

            if (result.status !== 200) {
                const payload = JSON.stringify(result, undefined, 2);
                core.setFailed(`Failed to read runs: ${payload}`);
                return;
            }

            if (result.data.total_count > 0) {
                if (detailLevel > 1) {
                    const payload = JSON.stringify(result, undefined, 2);
                    console.log(`Found at least queued item: ${payload}`);
                }
                return;
            }
        }

    } catch (error) {
        console.log(error.stack);
        core.setFailed(error.message);
    }
}

run();
