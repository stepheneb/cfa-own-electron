
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

Open the directory that contains the packaged application:

1. macos: `$ open out/cfa-own-electron-darwin-x64`
2. Windows: `cfa-own-electron> explorer out\cfa-own-electron-win32-x64`

Run **cfa-own-electron** or **cfa-own-electron.exe**

### Publish a new release.

1. Test and push all code changes.
2. Run `npm version prerelease` which will perform the following tasks:

   1. Update the prerelease version number in package.json and package-log.json and generates a git commit.
   2. Creates a new tag with the new version number.

3. Push the latest commit with the changes in package.json et al
4. Push the new tag: `git push --follow-tags`

Pushing the tag to github will kickoff the `release.yml` github workflow which uses github OS containers running npm and electron-forge to build and publish releases for Windows, macOS, and Linux.

Publishing a new release takes about 30 minutes. Check on progress here: https://github.com/stepheneb/cfa-own-electron/actions
