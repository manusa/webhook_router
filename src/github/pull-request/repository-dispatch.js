const axios = require('axios');

const ROUTES = {
  'eclipse-jkube/jkube': {
    target: 'eclipse-jkube/ci',
    actions: ['converted_to_draft', 'opened', 'synchronize', 'ready_for_review']
  }
};

const isApplicable = ({action = '', pullRequest, repositoryFullName}) =>
  pullRequest && ROUTES[repositoryFullName] && ROUTES[repositoryFullName].actions.includes(action);

const repositoryDispatch = async req => {
  const {
    action,
    sender: {login},
    pull_request: pullRequest,
    repository: {full_name: repositoryFullName}
  } = req.body;
  if (isApplicable({action, pullRequest, repositoryFullName})) {
    console.log(`Request received - ${action}: ${repositoryFullName} (${login}): #${pullRequest.number}`);
    try {
      const body = {'event_type': 'pull_request', 'client_payload': {pr: pullRequest.number}};
      const response = await axios.post(`https://api.github.com/repos/${ROUTES[repositoryFullName].target}/dispatches`,
        body,
        {
          headers: {
            Accept: 'application/vnd.github.everest-preview+json'
          },
          auth: {
            username: process.env.VERCEL_GH_USER,
            password: process.env.VERCEL_ACCESS_TOKEN
          }
        });
      console.log(`Request complete: ${response.status} - ${response.statusText}`);
    } catch (err) {
      console.error(`Error happened:\n${err}`);
    }
  }
}

module.exports = repositoryDispatch;
