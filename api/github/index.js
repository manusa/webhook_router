const repositoryDispatch = require('../../src/github/pull-request/repository-dispatch')

const github = async (req, res) => {
  const hooks = [
    repositoryDispatch
  ];
  await Promise.all(hooks.map(func => func(req, res)));
  res.status(200).send(`200 Healthy`);
}

module.exports = github;
