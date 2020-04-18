![.github/workflows/main.yml](https://github.com/boxofyellow/do-while-not-queued/workflows/.github/workflows/main.yml/badge.svg)

# do-while-not-queued
This action allows repetitively execute the specified command until the specified action is queued.  This can be handy in building a reliability run were you want run the same part of a work flow many times.

You can think of this as operating with the follow pseudocode

```
count = 0
endTime = [nowSec] + [$maxTimeSec: default = 2700]
while(true)
{
    for (i = 0; i < [$checkEvery: default = 1] ;i++)
    {
        count++
        if (count > [$maxRuns: default = 1000])
        {
            return
        }

        if (Run [$commandLine] With [$args] Does Not yield Exit Code 0)
        {
            return
        }

        if ([nowSec] > endTime)
        {
            return
        } 
    }

    if (another_run_of_this_workflow_has_been_queue)
    {
        return
    }
}
```

A few things to note:
1. You can use this to create run go for a long time, and inturn consume a lot of your compute resources, so consider using this with Self-Hosted runners
1. To perform various operations (like check if a new instance of this workflow has been queued) a valid token required.  The one that is provided when the job starts is only good for 1 hour.  So keep that in mind when selecting maxTimeSec
1. While on the topic of maxTimeSec, no time out is imposed on your command, this only controls how long the action will look queued items, you need to ensure your command will complete in a reasonable about of time.
1. Your command will have access to all Environment variables 

# Example Usage

``` yaml
uses: boxofyellow/do-while-not-queued@v1
with:
    # Start up powershell
    commandLine: 'pwsh'
    # Pass it two parameter -command Start-Sleep -Second 2
    args: '-command;Start-Sleep -Seconds 2'
    # Use the provided git hub variable for the work flow
    workflow: ${{ github.WORKFLOW }}
    # Run this for at most 7 iterations
    maxRuns: 7
    # If it runs for more then 10 second, stop checking for new instances and exit
    maxTimeSec: 10
    # Use the provided git hub variable
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```