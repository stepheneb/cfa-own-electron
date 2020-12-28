const appConfig = require("electron-settings");

/**
 * windowStateKeeper - Description
 *
 * @param {type} windowName Description
 *
 * @return {type} Description
 */
function windowStateKeeper(windowName) {
  let window, windowState;

  function setBounds() {
    // Restore from appConfig
    if (appConfig.has(`windowState.${windowName}`)) {
      windowState = appConfig.get(`windowState.${windowName}`);
      // we also need to check if the screen x and y
      // would end up on is available, and if not fix it
      // app is ready at this point, we can use screen
      const { screen } = require("electron");

      let positionIsValid = false;
      for (let display of screen.getAllDisplays()) {
        let lowestX = display.bounds.x;
        let highestX = lowestX + display.bounds.width;

        let lowestY = display.bounds.y;
        let highestY = lowestY + display.bounds.height;
        if (
          lowestX < windowState.x &&
          windowState.x < highestX &&
          lowestY < windowState.y &&
          windowState.y < highestY
        ) {
          positionIsValid = true;
        }
      }
      if (!positionIsValid) {
        windowState.x = 10;
        windowState.y = 10;
        // or some default other values
      }

      return;
    }
    // Default
    windowState = {
      x: undefined,
      y: undefined,
      width: 800,
      height: 600
    };
  }

  function saveState() {
    if (!windowState.isMaximized) {
      windowState = window.getBounds();
    }
    windowState.isMaximized = window.isMaximized();
    appConfig.set(`windowState.${windowName}`, windowState);
  }

  function track(win) {
    window = win;
    ["resize", "move", "close"].forEach(event => {
      win.on(event, saveState);
    });
  }
  setBounds();
  return {
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track
  };
}

module.exports = windowStateKeeper;
