/*jshint esversion: 6 */

//
// Animate Images Over Time
//

import u from '../utilities.js';
import svg from './svg.js';

let animate = {};

animate.render = (page, registeredCallbacks) => {
  let id = 'animate-player';
  let idControls = 'animate-controls';
  let stepBackId = 'animate-step-back';
  let playId = "animate-play";
  let pauseId = "animate-pause";
  let stepForwardId = "animate-step-forward";
  let previewImageBackNameId = "preview-image-back-name";
  let previewImageCenterNameId = "preview-image-center-name";
  let previewImageNextNameId = "preview-image-next-name";

  let html = `
    <div id='${id}'>
      <div class="row">
        <div class="col-4 m-0 p-0">
          <div class="animate-left px-3 mt-2 mb-2 pt-3 pb-3">
            <div id="preview-image-back-canvas-container" class="animate"></div>
          </div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageBackNameId}" class="px-2 pt- pb-1">name</div>
          </div>
        </div>
        <div class="col-4 animate-center px-2 pt-4 pb-3">
          <div id="preview-image-center-canvas-container" class="animate"></div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageCenterNameId}" class="px-2 pt-4 pb-2">name</div>
          </div>
        </div>
        <div class="col-4 m-0 p-0">
          <div class="animate-right px-3 mt-2 mb-2 pt-3 pb-3">
            <div id="preview-image-next-canvas-container" class="animate"></div>
          </div>
          <div class="d-flex justify-content-center">
            <div id="${previewImageNextNameId}" class="px-2 pt- pb-1">name</div>
          </div>
        </div>
      </div>

      <div id="${idControls}" class="d-flex flex-row justify-content-evenly align-items-center">

        <div type="button" id="${stepBackId}" class="animate-control step back unselectable d-flex flex-row">
          <div class="label">back</div>
          <div>${svg.stepBack}</div>
        </div>

        <div id="${playId}" class="animate-control playpause unselectable">
          <i class="bi bi-play-circle"></i>
        </div>

        <div id="${pauseId}" class="animate-control playpause unselectable">
          <i class="bi bi-pause-circle"></i>
        </div>

        <div id="${stepForwardId}"  type="button" class="animate-control step next unselectable d-flex flex-row">
          <div>${svg.stepNext}</div>
          <div class="label">next</div>
        </div>
      </div>
    </div>
  `;

  registeredCallbacks.push(callback);

  return html;

  function callback() {
    let controls = document.getElementById(idControls);
    let stepBack = document.getElementById(stepBackId);
    let play = document.getElementById(playId);
    let pause = document.getElementById(pauseId);
    let stepForward = document.getElementById(stepForwardId);
    let previewImageBackName = document.getElementById(previewImageBackNameId);
    let previewImageCenterName = document.getElementById(previewImageCenterNameId);
    let previewImageNextName = document.getElementById(previewImageNextNameId);
    let mainImageLabel = document.getElementById("main-image-label");

    let stepDuration = (page.stepDuration || 250);

    let sources = page.canvasImages.rawdataSources;
    let len = sources.length;
    let layerNum = page.selectedSourceNumber;

    updateNames();

    u.addExtendedClickHandler('animate', stepBack, () => {
      animationStop();
      animationStep(-1);
    });

    u.addExtendedClickHandler('animate', play, () => {
      controls.classList.add('playing');
      animationStep(1);
      page.animate = setInterval(() => {
        animationStep(1);
      }, stepDuration);
    });

    u.addExtendedClickHandler('animate', pause, () => {
      animationStop();
    });

    u.addExtendedClickHandler('animate', stepForward, () => {
      animationStop();
      animationStep(1);
    });

    function animationStop() {
      controls.classList.remove('playing');
      if (page.animate) {
        clearInterval(page.animate);
      }
    }

    function animationStep(step) {
      layerNum = newLayerNum(layerNum, step);
      page.image.selectedSourceNumber = layerNum;
      page.canvasImages.renderAnimatePreviews(page.selectedSource);
      page.canvasImages.renderCanvasRGB1(page.selectedSource);
      updateNames();
      // logger.imageData(this.canvasImages, this.canvasImages.selectedSource);
    }

    function newLayerNum(num, step) {
      num += step;
      if (num >= len) {
        num = 0;
      } else if (num < 0) {
        num = len - 1;
      }
      return num;
    }

    function updateNames() {
      previewImageBackName.innerText = `${page.image.shortname} ${newLayerNum(layerNum, -1)+1}`;
      previewImageCenterName.innerText = `${page.image.shortname} ${layerNum+1}`;
      previewImageNextName.innerText = `${page.image.shortname} ${newLayerNum(layerNum, 1)+1}`;
      mainImageLabel.innerText = previewImageCenterName.innerText;
    }
  }
};

export default animate;
