/*jshint esversion: 11 */

import cmap from './cmap.js';
import svg from './svg.js';
import u from '../utilities.js';

let colorMaps = {};

colorMaps.render = (page, registeredCallbacks) => {
  let id, elem;
  let names = cmap.names();
  let cmapNameGroups = [];
  for (var i = 0; i < names.length; i += 2) {
    cmapNameGroups.push([names[i], names[i + 1]]);
  }

  let getId = cmap => `select-cmap-${cmap}`;
  let cmapsHtml = '';
  cmapNameGroups.forEach(row => {
    cmapsHtml += '<div class="row">';
    row.forEach(cmapName => {
      id = getId(cmapName);
      cmapsHtml += `
        <div class="col-6">
          <div id="${id}" class="row select-cmap" data-cmap="${cmapName}">
            <div class="canvas col-7 d-flex align-items-center" >
              <canvas id="${id}-canvas"></canvas>
            </div>
            <div class="label col-5 d-flex align-items-center">${cmapName}</div>
          </div>
        </div>
      `;
    });
    cmapsHtml += '</div>';
  });
  let html = `
    <div id="select-colormaps" class='color-maps'>
      <div class='title'>Color Maps</div>
      <div class='subtitle notice'>
        ${svg.solidRightArrow}Select a color range to add color to your image
      </div>
      ${cmapsHtml}
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback(page) {
    let cmapName = 'gray';
    if (page.selectedSource.cmapName) {
      cmapName = page.selectedSource.cmapName;
    }
    let cmap = document.getElementById(getId(cmapName));
    cmap.classList.add('selected');
    page.selectedSource.cmapName = cmapName;

    // /* beautify ignore:start */
    // let cmapName = page.image?.cmapName ?? 'gray';
    // /* beautify ignore:end */

    cmapNameGroups.forEach(row => {
      row.forEach(cmapName => {
        id = getId(cmapName);
        elem = document.getElementById(id);
        u.addClickAndContextListener('cmap', elem, event => {
          event.stopPropagation();
          unselectAll();
          event.currentTarget.classList.add('selected');
          let id = event.currentTarget.dataset.cmap;
          page.selectedSource.cmapName = cmapName;
          page.canvasImages.scheduleCmap(cmapName);
          page.canvasImages.renderMasterpiece();
          console.log(`${id} clicked`);
        });
      });
    });
  }

  function unselectAll() {
    let container = document.getElementById('select-colormaps');
    container.querySelectorAll('.row.select-cmap').forEach(c => c.classList.remove('selected'));
  }
};

export default colorMaps;
