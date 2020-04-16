const core = require('@actions/core');
const exec = require('@actions/exec');

try {
  const commandLine = core.getInput('commandLine');
  const args = core.getInput('args');
  const separator = core.getInput('argsSeparator');

  const checkEveryRaw = core.getInput('checkEvery');
  var checkEvery = Number(checkEveryRaw);
  if (Number.isNaN(checkEvery) || !Number.isInteger(checkEvery) || checkEvery < 1)
  {
    core.setFailed(`checkEvery needs to be a integer, grater than 0, found ${checkEveryRaw}`);
    return;
  }

  const detailLevelRaw = core.getInput('detailLevel');
  var detailLevel = Number(detailLevelRaw);
  if (Number.isNaN(detailLevel) || !Number.isInteger(detailLevel) || detailLevel < 0 || detailLevel > 2)
  {
    core.setFailed(`detailLevel needs to be a integer, grater than or equal to 0 and less then or equal to 2, found ${detailLevelRaw}`);
    return;
  }

  var argumentsToPass = null;
  if (args)
  {
      argumentsToPass = args.split(separator);
  }

  const options = {};
  options.listeners = {
    silent: detailLevel > 1
  };

  var count = 0;
  for (var i = 0; i < checkEvery; i++) {
    count++;
    if (detailLevel > 0)
    {
        console.log(`Starting ${count}`);
    }
    exec.exec(commandLine, argumentsToPass, options);
  }

} catch (error) {
  core.setFailed(error.message);
}
