![.github/workflows/main.yml](https://github.com/boxofyellow/do-while-not-queued/workflows/.github/workflows/main.yml/badge.svg)

# do-while-not-queued
This action allows repetitively executing the specified command until the specified action is queued.  This can be handy in building a reliability run where you want to run the same part of a work flow many times.

You can think of this as operating with the following pseudocode

```
count = 0
endTime = [now-sec] + [$max-time-seconds: default = 2700]
while(true)
{
    for (i = 0; i < [$check-every: default = 1] ;i++)
    {
        count++
        if (count > [$max-runs: default = 1000])
        {
            return
        }

        if (Run [$command-line] With [$args] Does Not yield Exit Code 0)
        {
            return
        }

        if ([now-sec] > endTime)
        {
            return
        } 
    }

    if (Was Another Run Of This Workflow Has Been Queued)
    {
        return
    }
}
```

A few things to note:
1. You can use this to create runs that go for a long time, and in turn consume a lot of your compute resources, so consider using this with Self-Hosted runners
1. No timeout is imposed on your command, max-time-seconds only controls how long the action will look for queued items, you need to ensure your command will complete in a reasonable amount of time.
1. Your command will have access to all Environment variables that are available to actions by default, plus any that add to `env:` 
1. To perform various operations (like check if a new instance of this workflow has been queued) requires a valid token.

# Example Usage

``` yaml
uses: boxofyellow/do-while-not-queued@v2
with:
    # Start up powershell
    command-line: 'pwsh'
    # Pass it two parameter -command Start-Sleep -Second 2
    args: '-command;Start-Sleep -Seconds 2'
    # Use the provided github variable for the work flow
    workflow: ${{ github.WORKFLOW }}
    # Run this for at most 7 iterations
    max-runs: 7
    # If it runs for a total of more than 10 second, stop checking for new instances and exit
    max-time-seconds: 10
    # Use the provided github variable
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

# Maintaining the build Node.js version

The build and release workflows pin the same exact Node.js version using
`# NODE_VERSION_PIN` comments, following the existing `# MAJOR_VERSION_TAG`
marker pattern. Keep both pins in sync.

The `Check pinned Node.js version` workflow runs every Monday at 09:17 UTC and
can also be run manually. It compares the pin with the latest stable release
in the same major version from `https://nodejs.org/dist/index.json`. It fails
with an annotation and job summary when an update is available or the pins
are invalid or inconsistent. On failure (including download or checkout errors),
it creates an issue labeled `node-version-check`, or appends a comment to the
oldest open issue with that label. Each report includes the run link, commit,
and check output when available. Closed issues are not reused; healthy runs do
not create issues or comments. Runs are serialized to avoid duplicate issues.
It does not update files automatically or switch
to a newer major version.

When updating, change both marked pins, rebuild `dist` using the pinned Node.js
version, and commit the updated pins and generated files together. This pin
controls the build runtime, not the runner-provided `node24` runtime used by
consumers of this action.
