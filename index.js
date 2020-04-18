const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const { Octokit } = require('@octokit/action');
const octokit = new Octokit()

async function run() {
    try {
        const commandLine = core.getInput('commandLine');
        const args = core.getInput('args');
        const separator = core.getInput('argsSeparator');
        const workflow = core.getInput('workflow');

        console.log(`Looking for workflow: ${workflow}`);

        const checkEveryRaw = core.getInput('checkEvery');
        var checkEvery = Number(checkEveryRaw);
        if (Number.isNaN(checkEvery) || !Number.isInteger(checkEvery) || checkEvery < 1)
        {
            core.setFailed(`checkEvery needs to be an integer, grater than 0, found ${checkEveryRaw}`);
            return;
        }

        const detailLevelRaw = core.getInput('detailLevel');
        var detailLevel = Number(detailLevelRaw);
        if (Number.isNaN(detailLevel) || !Number.isInteger(detailLevel) || detailLevel < 0 || detailLevel > 2)
        {
            core.setFailed(`detailLevel needs to be an integer, grater than or equal to 0 and less then or equal to 2, found ${detailLevelRaw}`);
            return;
        }

        const maxRunsRaw = core.getInput('maxRuns');
        var maxRuns = Number(maxRunsRaw);
        if (Number.isNaN(maxRuns) || !Number.isInteger(maxRuns))
        {
            core.setFailed(`maxRuns needs to be an integer, found ${maxRunsRaw}`);
            return;
        }

        const maxTimeSecRaw = core.getInput('maxTimeSec');
        var maxTimeSec = Number(maxTimeSecRaw);
        if (Number.isNaN(maxTimeSec) || !Number.isInteger(maxTimeSec))
        {
            core.setFailed(`maxTimeSec needs to be an integer, found ${maxTimeSecRaw}`);
            return;
        }
        const startTime = new Date().getTime(); 
        const endTime = startTime + (maxTimeSec * 1000);

        var argumentsToPass = null;
        if (args)
        {
            argumentsToPass = args.split(separator);
        }

        const options = {};
        options.listeners = {
            silent: detailLevel > 1
        };

        const owner = github.context.payload.repository.owner.name;
        const repo = github.context.payload.repository.name;

        var count = 0;
        while (true)
        {
            for (var i = 0; i < checkEvery; i++) {
                count++;

                if (maxRuns > 0 && count > maxRuns)
                {
                    console.log(`Reached ${count}`);
                    return;
                }

                var now = new Date().getTime();
                if (maxTimeSec > 0 && (now > endTime))
                {
                    var ranFor = (now - startTime) / 1000;
                    console.log(`Ran for ${ranFor}s`);
                    return;
                }

                if (detailLevel > 0)
                {
                    console.log(`Starting ${count}`);
                }
                await exec.exec(commandLine, argumentsToPass, options);
            }

            var result = await octokit.actions.listRepoWorkflowRuns({
                owner: owner,
                repo: repo,
                workflow_file_name: workflow,
                status: 'queued'
            });

            if (result.status !== 200)
            {
                const payload = JSON.stringify(result, undefined, 2);
                core.setFailed(`Failed to read runs: ${payload}`);
                return;
            }

            if (result.data.total_count > 0)
            {
                if (detailLevel > 1)
                {
                    const payload = JSON.stringify(result, undefined, 2);
                    console.log(`Found at least queued item: ${payload}`);
                }
                return;
            }
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
