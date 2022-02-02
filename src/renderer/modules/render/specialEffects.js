/*jshint esversion: 6 */

import svg from './svg.js';
import Filter from '../filter.js';

let specialEffects = {};

specialEffects.render = (page, registeredCallbacks) => {
  let id, name, elem;
  let formId = 'special-effects';
  let effectsHtml = '';
  let filters = Filter.filters;
  let getId = key => `select-effect-${key}`;
  let getName = key => filters[key].name;

  let keys = Object.keys(filters);
  let rowCount = 3;
  let filterRows = keys.reduce((all, one, i) => {
    const ch = Math.floor(i / rowCount);
    all[ch] = [].concat((all[ch] || []), one);
    return all;
  }, []);
  filterRows.forEach(row => {
    effectsHtml += '<div class="special-effects-row">';
    row.forEach(key => {
      id = getId(key);
      name = getName(key);
      effectsHtml += `
        <div id='${id}' class="effect c-custom-checkbox" data-effect="${key}">
          <input type='checkbox' name='select-effect' value='${id}'>
          <svg width="36" height="36" viewBox="-10 -8 40 40" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r='16' fill="none" stroke-width="3" />
            <circle class='selected' cx="12" cy="12" r='8' fill="white" stroke-width="0" />
          </svg>
          <label for='${id}'>${name}</label>
        </div>
      `;
    });
    effectsHtml += '</div>';
  });
  let html = `
    <div class='special-effects c-custom-checkbox'>
      <div class='title'>Special Effects</div>
      <div class='subtitle notice'>
        ${svg.solidRightArrow}Try an effect to enhance your image
      </div>
      <form id="${formId}">
        ${effectsHtml}
      </form>
    </div>
  `;
  registeredCallbacks.push(callback);
  return html;

  function callback(page) {
    elem = document.getElementById(formId);

    if (page.image.filters && page.image.filters.length > 0) {
      page.canvasImages.scheduleFilters(page.image.filters);
      unCheckAll();
      let effect = page.image.filters[0];
      let target = elem.querySelector(`input[type="checkbox"][value="select-effect-${effect}"]`);
      target.checked = true;
    }

    elem.addEventListener('change', (e) => {
      let isChecked = e.target.checked;
      unCheckAll();
      if (isChecked) {
        e.target.checked = true;
      }
      let checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]'));
      let filters = checkboxes.filter(c => c.checked)
        .map(c => c.parentElement.dataset.effect);

      page.canvasImages.scheduleFilters(filters);
      page.image.filters = filters;
      if (filters.length > 0) {
        page.canvasImages.renderMasterpiece();
      } else {
        page.canvasImages.renderCanvasRGB(page.type);
        page.canvasImages.renderMasterpiece();
      }
    });
  }

  function unCheckAll() {
    let container = document.getElementById('special-effects');
    container.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
  }

};

export default specialEffects;
