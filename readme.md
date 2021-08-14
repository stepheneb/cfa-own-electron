
WIP: testing github workflows with a commit and push ...

## Building

Successfully built with:

- Node lts/fermium which is currently at v14.17.4, https://modejs.org
- npm 6.14.14

On macOS I typically use nvm to manage multiple versions of node: https://github.com/nvm-sh/nvm

### Install dependencies

After cloning repository install the dependencies for building and running.
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

  **`$ open out/cfa-own-electron-darwin-x64/cfa-own-electron.app`**

Windows:

**`"cfa-own-electron>"out\CfA OWN Electron-win32-x64\CfA OWN Electron.exe"`**

### Publish a new release.

1. Test and push all code changes.
2. Run `npm version prerelease` which will perform the following tasks:

   1. increment the prerelease version number in package.json and package-log.json and generate a git commit.
   2. Create a git tag with the version number.

3. Push the latest commit with the changes in package.json et al: `git push origin main`
4. Push the new tag: `git push --follow-tags`

Pushing the tag to github will kickoff the `release.yml` github workflow which uses github OS containers running npm and electron-forge to build and publish releases for Windows, macOS, and Linux.

Publishing a new release takes about 30 minutes. Check on progress here: https://github.com/stepheneb/cfa-own-electron/actions

References:
- https://dev.to/erikhofer/build-and-publish-a-multi-platform-electron-app-on-github-3lnd
- https://docs.github.com/en/actions


## Setup for Kiosk mode on Windows


Disable edge swipes that bring up system UI
https://www.tenforums.com/tutorials/48507-enable-disable-edge-swipe-screen-windows-10-a.html
