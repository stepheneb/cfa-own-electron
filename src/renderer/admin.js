/*global ipcRenderer  */

let admin = {};

const restart = document.getElementById('restart');
const quit = document.getElementById('quit');

restart.addEventListener('click', () => {
  console.log("admin:restart button pressed.");
  ipcRenderer.send('restart');
});

quit.addEventListener('click', () => {
  console.log("admin:quit button pressed.");
  ipcRenderer.send('quit');
});
export default admin;
