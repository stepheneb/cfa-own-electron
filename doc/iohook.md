Research on using iohook to capture native keyboard events.

iohook: Node.js global keyboard and mouse listener.
https://github.com/wilix-team/iohook

Allow accessibility apps to access your Mac
https://support.apple.com/guide/mac-help/allow-accessibility-apps-to-access-your-mac-mh43185/mac


Can an app in the Mac App Store ever get Accessibility permission?
https://stackoverflow.com/questions/61847744/can-an-app-in-the-mac-app-store-ever-get-accessibility-permission


Enabling Hardware Access
https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW11

Entitlements
https://developer.apple.com/documentation/bundleresources/entitlements

Enabling App Sandbox
https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html

App Sandbox and Entitlements
https://github.com/electron/electron-osx-sign/wiki/3.-App-Sandbox-and-Entitlements

electron-osx-sign
https://github.com/electron/electron-osx-sign

Abusing Electron apps to bypass macOS' security controls
https://wojciechregula.blog/post/abusing-electron-apps-to-bypass-macos-security-controls/

Security, Native Capabilities, and Your Responsibility
https://www.electronjs.org/docs/latest/tutorial/security

Accessibility
https://www.electronjs.org/docs/latest/tutorial/accessibility

master branch checked out in stand-alone dir builds -- fails building in electron apps ./node_modules/iohook
https://github.com/wilix-team/iohook/issues/371

```
$ git clone git@github.com:wilix-team/iohook.git
$ cd iohook
$ npm install
$ node build.js --runtime electron --version 13.2.3 --abi 89
```

```
$ npm install github:wilix-team/iohook#229774494 --save
$ cd node_modules/iohook
$ npm install
$ node build.js --runtime electron --version 13.2.3 --abi 89  --upload=false
```


```
$ mkdir -p './out/CfA OWN Electron-darwin-x64/CfA OWN Electron.app/Contents/Resources/app/.webpack/main/builds/electron-v89-darwin-x64/build/Release'
$ cp ../iohook/build/Release/iohook.node './out/CfA OWN Electron-darwin-x64/CfA OWN Electron.app/Contents/Resources/app/.webpack/main/builds/electron-v89-darwin-x64/build/Release'
```
