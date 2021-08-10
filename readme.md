

## Building

Successfully built with:

- Node lts/fermium which is currently at v14.17.4, https://modejs.org
- npm 6.14.14

On macOS I typically use nvm to manage multiple versions of node: https://github.com/nvm-sh/nvm

After cloning repository install the dependencies for building and running.
```
$ npm install
```

Start the Electron application locally.
```
$ npm start
```

Build production Electron application locally.
```
$ npm run makes
```

Build production Electron application locally.
```
$ npm run make
```

Publishing a new release.

Edit `package.json` to update the version.

Create the appropriate git tag.
```
git tag -a 1.0.0-beta-1 -m "inital beta release"
```

Make sure running the application created by running `npm run make` works correctly.

Commit and push changes to github.

Perform the publish task.
```
$ npm run publish
```
