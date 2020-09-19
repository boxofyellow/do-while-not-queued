![.github/workflows/main.yml](https://github.com/boxofyellow/do-while-not-queued/workflows/.github/workflows/main.yml/badge.svg)

# do-while-not-queued
This action allows repetitively executing the specified command until the specified action is queued.  This can be handy in building a reliability run were you want to run the same part of a work flow many times.

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

        if ([nowSec] > endTime)
        {
            return
        } 
    }

    if (Another Run Of This Workflow Has Been Queue)
    {
        return
    }
}
```

A few things to note:
1. You can use this to create runs that go for a long time, and inturn consume a lot of your compute resources, so consider using this with Self-Hosted runners
1. No timeout is imposed on your command, max-time-seconds only controls how long the action will look for queued items, you need to ensure your command will complete in a reasonable amount of time.
1. Your command will have access to all Environment variables that are available to actions by default, plus any that add to `env:` 
1. To perform various operations (like check if a new instance of this workflow has been queued) requires a valid token.

# Example Usage

``` yaml
uses: boxofyellow/do-while-not-queued@v1
with:
    # Start up powershell
    command-line: 'pwsh'
    # Pass it two parameter -command Start-Sleep -Second 2
    args: '-command;Start-Sleep -Seconds 2'
    # Use the provided git hub variable for the work flow
    workflow: ${{ github.WORKFLOW }}
    # Run this for at most 7 iterations
    max-runs: 7
    # If it runs for more then 10 second, stop checking for new instances and exit
    max-time-seconds: 10
    # Use the provided git hub variable
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
