const { keyBy, set, get } = require('lodash');
const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git');
const axios = require('axios');
const sha = require('sha.js');
const { performance } = require('node:perf_hooks');

const git = simpleGit()
/**
 * 策略：
 *
 * 1. develop: develop-{hash}
 * 2. release: 1.6.0 (master同，master拿上一次的release版本)
 * 3. feature: feature-{hash}
 * 4. alpha: 1.6.0-alpha-{hash}
 *
 * ps: release 如果已封板，后续hotfix版本号为 1.6.0-hotfix-{hash}
 *
 * 【策略待定】develop 同时前一个版本要 deprecate。（这里用npm查上一个develop分支，干掉就可以了）
 * **/

const publishPackages = ['@janlay/components'];
const makeHash = () => sha('sha256')
    .update(performance.now().toString())
    .digest('hex');

const getExecCommandResult = (command, options = {}) => require('child_process').execSync(command, options);

function getWorkspacePackagesInfo() {
  return getExecCommandResult('yarn workspaces list -v --json')
    .toString()
    .split(require('os').EOL)
    .filter(Boolean)
    .map(x => JSON.parse(x));
}

const getPackageRemoteInfo = async (pkgName) => {
  const json = await axios.get('https://registry.npmjs.org/' + encodeURIComponent(pkgName));
  return json.data;
}

const run = async () => {
  const packagesInfo = keyBy(getWorkspacePackagesInfo(), 'name');
  for (const pkgName of publishPackages) {
    const info = packagesInfo[pkgName];
    if (!info) {
      throw new Error('Package not found');
    }
    const packageLocation = path.join(process.cwd(), info.location);
    const packageJSONLocation = path.join(packageLocation, './package.json');
    if (fs.existsSync(packageJSONLocation)) {
      const json = JSON.parse(fs.readFileSync(packageJSONLocation).toString('utf8'));
      const {current: currentBranch} = await git.branchLocal();

      if (currentBranch === 'master' || currentBranch.indexOf('release')) {
        try {
          const localVersion = currentBranch === 'master' ? json.version : '1.0.0';
          const {versions} = await getPackageRemoteInfo(pkgName);
          if (versions[localVersion]) {
            set(json, 'version', localVersion + '-' + makeHash().slice(0, 6))
          }
          fs.writeFileSync(packageJSONLocation, JSON.stringify(json, null, 2));
        } catch (e) {
          console.log(e);
          if (e && e.response && e.response.status === 404) {
            // 说明第一次发布，不需要动。
          }
        } finally {
          getExecCommandResult('npm publish --access public', {
            cwd: packageLocation
          })
        }
      } else if (currentBranch === 'develop' || currentBranch.indexOf('feature')) {

      }
    }
  }
};

run();
