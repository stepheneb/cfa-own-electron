
## Building

Successfully built with:

- Node lts/gallium which is currently at v16.13.2, https://modejs.org
- npm 8.1.2

On macOS I typically use nvm to manage multiple versions of node: https://github.com/nvm-sh/nvm

There are multiple options for equivalant functionality on Windows: [Install NodeJS on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)

### Install dependencies

After cloning the repository install the dependencies for building and running.
```
$ npm install
```

### Start the Electron application locally.
```
$ npm start
```

### Build production Electron application locally.
```
$ npm run make
```

### Run the production application.

macOS:

**`$ open out/CfA\ OWN\ Electron-darwin-x64/CfA\ OWN\ Electron.app`**

Windows:

**`"cfa-own-electron>"out\CfA OWN Electron-win32-x64\CfA OWN Electron.exe"`**

### Debugging

When the CfA Electron app starts in development mode `main.js` will automatically open a Chrome devtools window. This window can be used for debugging code running in the webcontext.

To debug code running in the main nodejs process:

1. Open Chrome and open the url: `chrome://inspect/#devices`
2. Make sure **Discover network targets** is checked and confirm that `localhost:9229` is listed in the configuration.
3. Add a `debugger;` statement where you want the code pause.
4. Start the application with remote debugging enabled in **visitor** or **admin** mode:
  - **vistor**: `npm run debug-stop`.
  - **admin**: `npm run debug-stop-admin`

5. This will pause execution at the first executable statement in the nodejs context. When the application has paused an **inspect** link appears for `electron/js2c/browser_init` under **Remote Target** in the `chrome://inspect/#devices` window. Click this link to open a second Chrome devtools window associated with the main nodejs process.
6. At this point only the source for the initial Electron packages `default_app/main.ts` is visible in the **Sources** panel and the debugger is paused at the first executable statment (if the debugger is paused and the source is not visible step forward one statement). This `main.js` is not the application's `src/main.js` code, instead it is code that Electron generates and runs as part of the initial application startup. Click the continue execution button in the top right of the debugger.
7. The devtools window will next pause where you inserted the debugger statement in application code. Additional source files that have been evaluated will now be visible in the **Source** panel in the devtools window.
8. At this point further breakpoints can be added to code visible in the **Sources** panel.

### Publish a new release.

1. Test and push all code changes
   - Run `npm run package` on both macOS and Windows and make sure packaged applications run correctly.
   - Test static site deployed to gh-pages: https://stepheneb.github.io/cfa-own-electron
2. Make sure the git workspace is clean: `git status`.
2. Run `npm version prerelease` which will perform the following tasks:
   - increment the prerelease version number in package.json and package-log.json and generate a git commit.
   - Create a git tag with the version number.

3. Push the latest commit with the changes in package.json et al: `git push origin main`
4. Push the new tag: `git push --follow-tags`

As of the v1.0.0 releease new **patch** releases are generated as follows:

All in one place:
```
git status
npm version patch
git push origin main && git push --follow-tags
```

A pre-release for a patch version:

```
npm version prepatch
git push origin main && git push --follow-tags
```

Pushing the tag to github will kickoff the `release-macos.yml` and `release-windows.yml` github workflows which use github OS containers running npm and electron-forge to build and publish releases for Windows and macOS.

Publishing a new draft release takes about 20 minutes. Check on progress here: https://github.com/stepheneb/cfa-own-electron/actions. After the draft is published add release comments and remove the **draft** status to make the release available for downloading.

Display a summary of changes in the release (useful as a starting point for creating release notes).

```
git log --reverse --pretty=medium v1.0.0-beta.30...v1.0.0-beta.31
```

If the release workflow fails and the failure is caused by an error building the application delete the most recent tag from both local and remote repositories.

```
tag=v1.0.0-beta.39
git tag -d $tag && git push --delete origin $tag
```


If additional commits are need to resolve the errors rebase the new commits and force push the changes:

```
git rebase -i head~
git push origin main -f
```

If some or all the artifacts for a release were generated these must be deleted in the draft release before pushing the re-created version tag are re-generating the release artifacts.

Recreate the local tag and push the recreated tag to the remote repository.

```
tag=v1.0.0-beta.39
git tag -a $tag -m "$tag"
git push origin $tag
```

References:
- https://dev.to/erikhofer/build-and-publish-a-multi-platform-electron-app-on-github-3lnd
- https://docs.github.com/en/actions


### Native modules and ABI versions for electron:

https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules

https://github.com/electron/releases

```
$ node_modules/electron/dist/Electron.app/Contents/MacOS/Electron --help
-i, --interactive     Open a REPL to the main process.
-r, --require         Module to preload (option can be repeated).
-v, --version         Print the version.
-a, --abi             Print the Node ABI version.
```

```
$ node_modules/electron/dist/Electron.app/Contents/MacOS/Electron --version
v13.2.3
```

```
$ node_modules/electron/dist/Electron.app/Contents/MacOS/Electron --abi
89
```

```
$ node_modules/electron/dist/Electron.app/Contents/MacOS/Electron -i

    Welcome to the Electron.js REPL \[._.]/

    You can access all Electron.js modules here as well as Node.js modules.
    Using: Node.js v14.16.0 and Electron.js v13.2.3

> process.versions
{
  node: '14.16.0',
  v8: '9.1.269.39-electron.0',
  uv: '1.40.0',
  zlib: '1.2.11',
  brotli: '1.0.9',
  ares: '1.16.1',
  modules: '89',
  nghttp2: '1.41.0',
  napi: '7',
  llhttp: '2.1.3',
  openssl: '1.1.1',
  icu: '68.1',
  unicode: '13.0',
  electron: '13.2.3',
  chrome: '91.0.4472.164'
}
```

https://github.com/electron/node-abi

```
$ node
Welcome to Node.js v14.18.1.
Type ".help" for more information.
> require('node-abi').getAbi('14.16.0', 'node')
'83'
```

### Debugging a workflow action

The `windows-release.yml` workflow is failing -- perhaps due to an out of memory issue.

I created a github [environment](https://docs.github.com/en/actions/reference/environments)
named `release` in the repository and added two [environmental variables](https://docs.github.com/en/actions/reference/encrypted-secrets)
for enabling increased [debug logging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)
while running a workflow.

- `ACTIONS_RUNNER_DEBUG: true`
- `ACTIONS_STEP_DEBUG: true`

## Setup for Kiosk mode on Windows

Disable edge swipes that bring up system UI
https://www.tenforums.com/tutorials/48507-enable-disable-edge-swipe-screen-windows-10-a.html
