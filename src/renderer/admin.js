/*global ipcRenderer  */

let admin = {};

const restart = document.getElementById('restart');

restart.addEventListener('click', () => {
  console.log("admin:restart button pressed.");
  ipcRenderer.send('restart');
});

export default admin;
