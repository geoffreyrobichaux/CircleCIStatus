# CircleCIStatus
Monitor the status of your CircleCI Builds directly in page.

# Install

`npm install circleci_build_status`

# Usage


The token used below is a CircleCI Personal API, which means it's pretty sensitive and should be guarded. 
```
(new CircleCIBuildStatus()).monitor(document.body, {
      refresh_in_min: 5,
      url: 'https://circleci.com/api/v1.1/projects?circle-token=TOKEN',
      headers: {},
      branch: 'master'
    });
```

The use of a HTTP proxy can hide that url, such as a lambda function that stores the circle api url. In that scenario, the url and headers can be set as below.
```
url: 'https://xxxxx.us-east-1.amazonaws.com/default/FUNCTION_NAME',
headers: {'X-Api-Key': 'API_KEY'},
```

The branch name may need to be dynamic if this is added to a multi-host development environment. Thus url detection or injecting the branch name would work equally well.

Enjoy.