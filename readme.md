

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

#### macos
```
$ open out/cfa-own-electron-darwin-x64
```
Run **cfa-own-electron**

#### Windows
```
cfa-own-electron> explorer out\cfa-own-electron-win32-x64
```
Run **cfa-own-electron.exe**

### Publish a new release.

Edit `package.json` to update the version.

Create the appropriate git tag.
```
$ git tag -a 1.0.0-beta-1 -m "inital beta release"
```

Note: Make sure running the application created by running `npm run make` works correctly first.

Commit and push changes to github.

Perform the publish task.
```
$ npm run publish
```
