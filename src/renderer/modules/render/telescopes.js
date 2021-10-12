/*jshint esversion: 6 */
/*global app  */

let telescopes = {};

telescopes.updateVisibility = page => {
  let enabled = page.image.selectedMainLayers;
  let scopes = page.telescopes;
  let id, elem;
  visibilityOff(scopes);
  let count = Math.min(page.canvasImages.rawdataSources.length, 3);
  for (let i = 0; i < count; i++) {
    if (enabled[i] == '1') {
      let key = page.image.sources[i].telescope;
      let index = page.telescopes.findIndex(obj => obj.key == key);
      scopes[index].visible = true;
    }
  }
  scopes.forEach((scope) => {
    id = scope.key;
    elem = document.getElementById(id);
    if (scope.visible) {
      elem.style.display = "block";
    } else {
      elem.style.display = "none";
    }
  });

  updateAboutPositions(scopes);

  function visibilityOff(scopes) {
    scopes.forEach((scope) => {
      scope.visible = false;
    });
  }

  function updateAboutPositions(scopes) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scopes.forEach((scope) => {
          if (scope.visible) {
            let elemScope = document.getElementById(scope.key + '-container');
            let bcrScope = elemScope.getBoundingClientRect();
            let modalId = `${scope.key}-modal`;
            let modalElem = document.getElementById(modalId).querySelector('.telescope');
            let modalImage = modalElem.querySelector('.telescope>.modal-content>.modal-body>.image-container');
            modalImage.style.height = bcrScope.height + 'px';
            modalImage.style.width = bcrScope.width + 'px';
            let top = bcrScope.top - 75;
            modalElem.style.top = top + 'px';
            let right = window.innerWidth - bcrScope.right - (2 + 16 + 21);
            modalElem.style.right = `${right}px`;
          } else {
            scope.bcr = null;
          }
        });
      }, 100);
    });

  }
};

telescopes.render = (page, registeredCallbacks) => {
  let scopes = page.telescopes;
  let html = `<div>${app.telescopeData.prologue}</div>`;
  let modalHtml = '';
  let id, modalId;
  registeredCallbacks.push(callback);
  scopes.forEach(scope => {
    id = scope.key;
    modalId = `${id}-modal`;
    html += `
      <div id="${id}" class="telescope-container" data-bs-toggle="modal" data-bs-target="#${modalId}">
        <div class="about-telescope">${scope.name} Telescope</div>
        <div id="${scope.key}-container" class="telescope-image-container">
          <img src="../${scope.image}"></img>
        </div>
      </div>
    `;

    modalHtml += `
      <div class="modal  fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-title" aria-hidden="true">
        <div class="telescope modal-dialog">
          <div class="modal-content">
          <svg type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
            <circle stroke-opacity='1' fill-opacity='1'/>
            <line x1="38%" y1="33%" x2="62%" y2="67%"/>
            <line x1="62%" y1="33%" x2="38%" y2="67%"/>
          </svg>

            <div class="modal-body">
              <h5 id="${modalId}-title">${scope.name} Telescope</h5>
              <div class="image-container"><img src="../${scope.image}"></img></div>
              ${scope.description}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  return [html, modalHtml];

  function callback(page) {
    telescopes.updateVisibility(page);
  }
};

export default telescopes;
