/*jshint esversion: 6 */

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
  let rowCount = 2;
  let filterRows = keys.reduce((all, one, i) => {
    const ch = Math.floor(i / rowCount);
    all[ch] = [].concat((all[ch] || []), one);
    return all;
  }, []);
  filterRows.forEach(row => {
    effectsHtml += '<div class="row special-effects">';
    row.forEach(key => {
      id = getId(key);
      name = getName(key);
      effectsHtml += `
        <div id='${id}' class="effect col-6 d-flex align-items-center" data-effect="${key}">
          <input type='checkbox' name='select-effect' value='${id}'>
          <label for='${id}'>${name}</label>
        </div>
      `;
    });
    effectsHtml += '</div>';
  });
  let html = `
    <div class='special-effects'>
      <div class='title'>Special Effects</div>
      <div class='subtitle'><span class="solid-right-arrow">&#11157</span>Try an effect to enhance your image</div>
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
