const https = require('https');

const ROUTES = {
  'eclipse/jkube': 'jkubeio/ci'
};
const VALID_ACTIONS = ['opened', 'synchronize'];

const isApplicable = ({action = '', pullRequest, repositoryFullName}) =>
  pullRequest && ROUTES[repositoryFullName] && VALID_ACTIONS.includes(action);

const repositoryDispatch = (req, res) => {
  const {
    action,
    sender: {login},
    pull_request: pullRequest,
    repository: {full_name: repositoryFullName}
  } = req.body;
  console.log('GHT: '+`Basic ${Buffer.from(`${process.env.VERCEL_GH_USER}:${process.env.VERCEL_ACCESS_TOKEN}`).toString('base64')}`);
  if (isApplicable({action, pullRequest, repositoryFullName})) {
    console.log(`Request received - ${action}: ${repositoryFullName} (${login}): #${pullRequest.number}`);
    console.log('GHU: '+process.env.VERCEL_GH_USER);
    console.log('GHT: '+`Basic ${Buffer.from(`${process.env.VERCEL_GH_USER}:${process.env.VERCEL_ACCESS_TOKEN}`).toString('base64')}`);
    const dispatchRequest = https.request({
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${ROUTES[repositoryFullName]}/dispatches`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.everest-preview+json',
        Authorization: `Basic ${Buffer.from(`${process.env.VERCEL_GH_USER}:${process.env.VERCEL_ACCESS_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }, dispatchResponse => {
      console.log(`Dispatch request status: ${dispatchResponse.statusCode}`);
    });
    const body = {'event_type': 'pull_request', 'client_payload': {pr: pullRequest.number}};
    dispatchRequest.write(JSON.stringify(body));
    dispatchRequest.end();
  }
  res.status(200).send(`200 Healthy`)
}

module.exports = repositoryDispatch;
