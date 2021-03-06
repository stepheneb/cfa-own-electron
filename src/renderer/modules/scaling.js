/*jshint esversion: 6 */
/*global app  */

import canvasUtils from './canvasUtils.js';
import svg from './render/svg.js';
import u from './utilities.js';

const platform = require('platform');

class Scaling {
  constructor(scalingCanvas, panArrowLayer, sourceImageBitmap, previewZoomCanvas, findApolloSiteContainerId, sourceCtx, landing) {
    this.scalingCanvas = scalingCanvas;
    this.panArrowLayer = panArrowLayer;
    this.findApolloSiteContainerId = findApolloSiteContainerId;
    this.mainCanvasWrapper = document.getElementById('main-canvas-wrapper');
    this.sourceCtx = sourceCtx;
    this.landing = landing;
    this.findApolloSiteContainer = null;
    this.matchingApolloSiteScale = false;
    this.clientDimensions = {};
    this.imageWidth = 0;
    this.imageHeight = 0;

    this.eventListeners = {
      change: [],
      resize: []
    };

    // https://github.com/mdn/dom-examples/blob/master/pointerevents/Pinch_zoom_gestures.html
    this.evCache = [];
    this.previousDistance = -1;
    this.previousCenter = -1;

    this.previousImageWidth = 0;
    this.previousImageHeight = 0;

    this.w = 0;
    this.h = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.arrowDrawn = false;

    this.queuedmoves = [];
    this.scalingCanvasDrawfinished = true;
    this.tick = false;

    this.sourceImageBitmap = sourceImageBitmap;
    this.previewZoomCanvas = previewZoomCanvas;
    this.pzcZoomRectDisplayed = false;
    this.pzcClientWidth = null;
    this.pzcClientHeight = null;
    this.pczScaleToPos = 1;

    this.lastChangeIn = "";

    this.mainEvents = null;
    this.previewZoomEvents = null;

    this.wheeling = "idle";
    this.wheelingTimeOut = null;

    this.panning = "idle";
    this.panningTimeOut = null;

    this.bindCallbacks();
    this.setupButtons();
    this.touchinfo = document.querySelector('span.touchinfo');
    this.ctx = this.scalingCanvas.getContext('2d');
    // this.imageData = this.ctx.getImageData();
    this.nx = sourceImageBitmap.width;
    this.ny = sourceImageBitmap.height;

    this.max1to1 = true;
    this.minScale = 1;
    this.scale = this.minScale;
    this.maxScale1to1 = 2;
    this.maxScale = 2;

    this.ratio = 0;
    this.scaleFactor = 1.05;
    this.gestureScaleFactor = 1.02;
    this.scaleDraw = null;
    this.distance = 0;

    this.zp = null;

    this.lastDistance = 0;
    this.previewZoomLastDistance = 0;

    this.scaling = false;
    this.previewZoomScaling = false;

    this.dragStarted = false;
    this.previewZoomDragStarted = false;

    this.isDragging = false;
    this.previewZoomIsDragging = false;

    this.startCoords = { x: 0, y: 0 };
    this.previewZoomStartCoords = { x: 0, y: 0 };

    this.lastMove = { x: 0, y: 0 };
    this.lastPreviewZoomMove = { x: 0, y: 0 };

    this.lastDraggedPos = { x: 0, y: 0 };
    this.lastDraggedPreviewZoomPos = { x: 0, y: 0 };

    this.moveX = 0;
    this.previewZoomMoveX = 0;

    this.moveY = 0;
    this.previewZoomMoveY = 0;

    this.redraw = null;
    this.dxOld = 0;
    this.dyOld = 0;

    this.startup();
  }

  update(im) {
    this.sourceImageBitmap = im;
    this.scalingCanvasDraw();
  }

  bindCallbacks() {
    [
      'scalingCanvasDraw',
      'scaleCanvas',
      'scaleCanvasTouch',
      'buttonListener',
      'listenerMouseDownTouchStart',
      'listenerMouseMoveTouchMove',
      'listenerMouseUpTouchEnd',
      'listenerMouseLeave',
      'listenerUpLeaveEnd',
      'listenerMouseOverZoomRect',
      'listenerMouseMoveZoomRect',
      'listenerMouseOutZoomRect',
      'listenerZoom',
      'previewZoomListenerMouseDownTouchStart',
      'previewZoomListenerMouseMoveTouchMove',
      'previewZoomListenerMouseLeave',
      'previewZoomListenerMouseUpTouchEnd',
      'scalinglistenerPanArrowStart',
      'listenerPanArrowEnd'
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  setupButtons() {
    let buttons = document.querySelectorAll('div.scale button');
    if (buttons.length > 0) {
      [this.zoomInButton, this.zoomOutButton, this.zoomResetButton] = document.querySelectorAll('div.scale button');

      u.addClickAndContextListener('scaling', this.zoomInButton, this.buttonListener);
      u.addClickAndContextListener('scaling', this.zoomOutButton, this.buttonListener);
      u.addClickAndContextListener('scaling', this.zoomResetButton, this.buttonListener);

      this.zoomButtonsEnabled = true;
    }
  }

  resetScaling() {
    this.scale = 1;
    this.scaleDraw = requestAnimationFrame(this.scaleCanvas);
  }

  startup() {
    this.mainCanvasWrapper = document.getElementById('main-canvas-wrapper');
    this.setupScaling2DContext();
    if (this.isTouchDevice()) {
      this.scaleFactor = 1.02;
      this.scalingCanvas.classList.add('touch');
      this.scalingCanvas.addEventListener('touchstart', this.hideTouchTooltip);
    } else {
      this.hideTouchTooltip();
    }

    this.setupPanArrowLayer();
    // Startup ...

    if (this.findApolloSiteContainerId) {
      this.findApolloSiteContainer = document.getElementById(this.findApolloSiteContainerId);
      this.max1to1 = false;
    } else {
      this.max1to1 = true;
    }

    this.mainEvents = [
      ['pointerdown', this.listenerMouseDownTouchStart],
      ['pointermove', this.listenerMouseMoveTouchMove],
      ['pointerup', this.listenerMouseUpTouchEnd],
      ['pointercancel', this.listenerMouseUpTouchEnd],
      ['pointerout', this.listenerMouseUpTouchEnd],
      ['pointerleave', this.listenerMouseUpTouchEnd],
      ['wheel', this.listenerZoom]
    ];

    this.mainEvents.forEach((eventItem) => {
      this.scalingCanvas.addEventListener(eventItem[0], eventItem[1], { passive: true });
    });

    this.panArrowEvents = [
      ['pointerdown', this.scalinglistenerPanArrowStart],
      ['pointerup', this.listenerPanArrowEnd],
      ['pointerout', this.listenerPanArrowEnd],
      ['pointerleave', this.listenerPanArrowEnd]
    ];

    this.panArrowEvents.forEach((eventItem) => {
      this.panArrowLayer.addEventListener(eventItem[0], eventItem[1], { passive: true });
    });

    this.previewZoomEvents = [
      ['mousedown', this.previewZoomListenerMouseDownTouchStart],
      ['touchstart', this.previewZoomListenerMouseDownTouchStart],

      ['mousemove', this.previewZoomListenerMouseMoveTouchMove],
      ['touchmove', this.previewZoomListenerMouseMoveTouchMove],

      ['mouseleave', this.previewZoomListenerMouseLeave],
      ['mouseup', this.previewZoomListenerMouseUpTouchEnd],
      ['touchend', this.previewZoomListenerMouseUpTouchEnd],

      ['mouseover', this.listenerMouseOverZoomRect],
      ['mousemove', this.listenerMouseMoveZoomRect],
      ['mouseout', this.listenerMouseOutZoomRect],

    ];

    if (this.previewZoomCanvas) {
      this.previewZoomEvents.forEach((eventItem) => {
        this.previewZoomCanvas.addEventListener(eventItem[0], eventItem[1], { passive: true });
      });
    }

    this.setupButtons();
    this.handleResize();
    this.updateZoomButtons();
    this.showTouchTooltip();

    window.addEventListener('resize', () => {
      this.handleResize();
    });

  }

  setupPanArrowLayer() {
    this.panArrowLayer.insertAdjacentHTML('beforeend', svg.panArrow('up', 0));
    this.panArrowLayer.insertAdjacentHTML('beforeend', svg.panArrow('right', 90));
    this.panArrowLayer.insertAdjacentHTML('beforeend', svg.panArrow('down', 180));
    this.panArrowLayer.insertAdjacentHTML('beforeend', svg.panArrow('left', 270));
    this.panArrowUp = document.getElementById('pan-arrow-up');
    this.panArrowDown = document.getElementById('pan-arrow-down');
    this.panArrowRight = document.getElementById('pan-arrow-right');
    this.panArrowLeft = document.getElementById('pan-arrow-left');
  }

  handleResize() {
    // Remove explicitly set style.width attribute on
    // this.mainCanvasWrapper.style.width before reflow after resize
    // happens so mainCanvasWrapper can initially expand to fill it's parent container
    this.mainCanvasWrapper.style.width = null;
    this.redraw = requestAnimationFrame(() => {
      this.resizeCanvas(this.scalingCanvas);
      this.reCalculatePreviewZoomRect();
      this.sendResizeEvent();
    });
  }

  close() {
    this.mainEvents.forEach((eventItem) => {
      this.scalingCanvas.removeEventListener(eventItem[0], eventItem[1]);
    });

    this.panArrowEvents.forEach((eventItem) => {
      this.panArrowLayer.removeEventListener(eventItem[0], eventItem[1]);
    });

    if (this.previewZoomCanvas) {
      this.previewZoomEvents.forEach((eventItem) => {
        this.previewZoomCanvas.removeEventListener(eventItem[0], eventItem[1]);
      });
    }
    u.removeAllClickAndContextListeners('scaling');
  }

  isTouchDevice() {
    return typeof window.ontouchstart !== "undefined";
  }

  hideTouchTooltip() {
    if (this.touchinfo) {
      this.touchinfo.classList.add('hidden');
    }
  }

  showTouchTooltip() {
    if (this.isTouchDevice() && this.touchinfo) {
      this.touchinfo.classList.remove('hidden');
    } else {
      this.touchinfo.classList.add('hidden');
    }
  }

  setupScaling2DContext() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }

  scaleCanvas() {
    switch (this.scaling) {
    case 'zoomout':
      this.scale = this.scale / this.scaleFactor;
      if (this.scale < this.minScale) this.scale = this.minScale;
      break;
    case 'zoomin':
      this.scale = this.scale * this.scaleFactor;
      if (this.max1to1) {
        this.scale = Math.min(this.scale, this.maxScale1to1);
      } else {
        this.scale = Math.min(this.scale, this.maxScale);
      }
      break;
    case 'zoomreset':
      this.scale = 1;
      break;
    }
    this.finishScaleCanvas();
  }

  scaleCanvasContinuousValue(newScale) {
    this.scale = newScale;
    if (this.scale < this.minScale) this.scale = this.minScale;
    if (this.max1to1) {
      this.scale = Math.min(this.scale, this.maxScale1to1);
    } else {
      this.scale = Math.min(this.scale, this.maxScale);
    }
    this.finishScaleCanvas();
  }

  finishScaleCanvas() {
    this.updateZoomButtons();
    this.scalingCanvasDraw();
  }

  scaleCanvasTouch() {
    if (this.lastDistance > this.distance) {
      this.scale = this.scale / this.scaleFactor;
      if (this.scale < this.minScale) this.scale = this.minScale;
    } else if (this.lastDistance < this.distance) {
      this.scale = this.scale * this.scaleFactor;
      this.scale = Math.min(this.scale, this.maxScale);
    }

    this.queueCanvasDraw();
    // this.redraw = requestAnimationFrame(this.scalingCanvasDraw);

    this.lastDistance = this.distance;
  }

  calcMainWidthsHeightsLimitMoves() {
    this.clientDimensions = this.getWidthHeight(this.scalingCanvas.parentElement);
    this.previousImageWidth = this.imageWidth;
    this.previousImageHeight = this.imageHeight;
    this.imageWidth = this.sourceImageBitmap.width * this.ratio * this.scale;
    this.imageHeight = this.sourceImageBitmap.height * this.ratio * this.scale;
    this.w = Math.min(this.clientDimensions.width, this.imageWidth);
    this.h = Math.min(this.clientDimensions.height, this.imageHeight);
    this.scalingCanvas.width = this.w;
    this.scalingCanvas.height = this.h;

    this.offsetX = (this.imageWidth - this.scalingCanvas.width) / 2.01;
    this.offsetY = (this.imageHeight - this.scalingCanvas.height) / 2.01;

    this.minMoveX = -(this.imageWidth - this.offsetX - this.w);
    this.minMoveY = -(this.imageHeight - this.offsetY - this.h);

    if (this.previousImageWidth > 0 && this.previousImageWidth != this.imageWidth) {
      this.moveX *= 1 + (this.imageWidth / this.previousImageWidth - 1);
      this.lastMove.x = this.moveX;
      this.lastPreviewZoomMove.x = this.applyScaleToMoveX(this.lastMove.x);
      this.reCalculatePreviewZoomRect();
    }
    if (this.previousImageHeight > 0 && this.previousImageHeight != this.imageHeight) {
      this.moveY *= 1 + (this.imageHeight / this.previousImageHeight - 1);
      this.lastMove.y = this.moveY;
      this.lastPreviewZoomMove.y = this.applyScaleToMoveX(this.lastMove.y);
      this.reCalculatePreviewZoomRect();
    }

    this.moveX = Math.min(this.moveX, this.offsetX);
    this.moveX = Math.max(this.moveX, this.minMoveX);

    this.moveY = Math.min(this.moveY, this.offsetY);
    this.moveY = Math.max(this.moveY, this.minMoveY);

    this.dx = -this.offsetX + this.moveX;
    this.dy = -this.offsetY + this.moveY;
  }

  updatePanArrows() {
    let panArrows = this.panArrowLayer.querySelectorAll('.pan-arrow');
    if (this.scale == this.minScale) {
      hidePanArrows();
    } else {
      showPanArrows();
      // this.panArrowUp.classList.add('show');
      // this.panArrowDown.classList.add('show');
    }
    if (this.scalingCanvas.width >= this.mainCanvasWrapper.parentElement.clientWidth) {
      checkLeftRight(this);
    } else {
      this.panArrowLeft.classList.add('disabled');
      this.panArrowRight.classList.add('disabled');
    }

    checkUpDown(this);

    function checkUpDown(scaling) {
      if (scaling.moveY >= scaling.offsetY) {
        scaling.panArrowUp.classList.add('disabled');
      } else {
        scaling.panArrowUp.classList.remove('disabled');
      }

      if (scaling.moveY <= scaling.minMoveY) {
        scaling.panArrowDown.classList.add('disabled');
      } else {
        scaling.panArrowDown.classList.remove('disabled');
      }
    }

    function checkLeftRight(scaling) {
      if (scaling.moveX >= scaling.offsetX) {
        scaling.panArrowLeft.classList.add('disabled');
      } else {
        scaling.panArrowLeft.classList.remove('disabled');
      }

      if (scaling.moveX <= scaling.minMoveX) {
        scaling.panArrowRight.classList.add('disabled');
      } else {
        scaling.panArrowRight.classList.remove('disabled');
      }
    }

    function hidePanArrows() {
      panArrows.forEach((arrow) => {
        arrow.classList.remove('show');
      });
    }

    function showPanArrows() {
      panArrows.forEach((arrow) => {
        arrow.classList.add('show');
      });
    }
  }

  queueCanvasDraw() {
    this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
    // this.queuedmoves.push([this.moveX, this.moveY]);
    // if (this.scalingCanvasDrawfinished) {
    //   this.redraw = requestAnimationFrame(() => {
    //     this.scalingCanvasDraw();
    //     this.scalingCanvasDrawfinished = true;
    //   });
    //   this.scalingCanvasDrawfinished = false;
    // }
  }

  scalingCanvasDraw() {
    this.checkIfMatchingApolloSiteScale();
    this.calcMainWidthsHeightsLimitMoves();
    this.updatePanArrows();
    if (app.dev) {
      console.log(`scalingCanvasDraw: move: ${this.moveX}, ${this.moveY}, offset: ${this.offsetX}, ${this.offsetY}`);
    }
    this.ctx.drawImage(
      this.sourceImageBitmap,
      this.dx,
      this.dy,
      this.imageWidth,
      this.imageHeight
    );
    if (this.previewZoomCanvas) {
      this.previewZoomCanvasDraw({
        sw: this.w / this.imageWidth,
        sh: this.h / this.imageHeight,
        sx: -this.dx / this.imageWidth,
        sy: -this.dy / this.imageHeight
      });
      if (this.checkIfGreaterThanOrEqualApolloSiteScale() || this.arrowDrawn) {
        this.drawArrowAndUpdate(this.ctx, this.imageWidth, this.imageHeight);
      }
    }
    this.scalingCanvasDrawfinished = true;
    this.mainCanvasWrapper.style.width = this.imageWidth + 'px';
    this.mainCanvasWrapper.style.height = '72vh';
    if (app.dev) {
      // console.log(this.scalingCanvasDrawArgs());
    }
    this.sendChangeEvent();
  }

  scalingCanvasDrawArgs() {
    let argstr = `
    imageWidth and height to draw source into destination
      dWidth: ${this.imageWidth}
      dHeight: ${this.imageHeight}
    ctx destination:
      width: ${this.scalingCanvas.width}
      height: ${this.scalingCanvas.height}
    maxScale1to1: ${this.maxScale1to1}
    scalingCanvasDraw inputs:
      offset: ${this.offsetX}, ${this.offsetY}
      move: ${this.moveX}, ${this.moveY}
    scale: ${this.scale}
    ratio: ${this.ratio}
    ratio * scale: ${this.ratio * this.scale}
    ctx.drawImage args:
      source imageBitmap:
        width: ${this.sourceImageBitmap.width}
        height: ${this.sourceImageBitmap.height}
      top-left corner in destination to place source image
        dx: ${this.dx}
        dy: ${this.dy}
    `;
    return argstr;
  }

  addListener(type, callback) {
    if (typeof callback == 'function' && this.eventListeners[type]) {
      this.eventListeners[type].push(callback);
    }
  }

  removeListener(type, callback) {
    if (typeof callback == 'function') {
      let callbacks = this.eventListeners[type];
      let matchingIndicies = [];
      if (callbacks && callbacks.length > 0) {
        for (const [i, item] of callbacks.entries()) {
          if (callback == item[1]) {
            matchingIndicies.push(i);
          }
        }
        matchingIndicies.reverse().forEach((i) => callbacks.splice(i, 1));
      }
    }
  }

  removeAllListeners() {
    for (const type in this.eventListeners) {
      this.eventListeners[type] = [];
    }
  }

  sendChangeEvent() {
    this.eventListeners.change.forEach((callback) => {
      if (typeof callback == 'function') {
        // alternative test: if (callback instanceof Function)
        callback(this.generateScalingEvent());
      }
    });
  }

  sendResizeEvent() {
    this.eventListeners.resize.forEach((callback) => {
      if (typeof callback == 'function') {
        // alternative test: if (callback instanceof Function)
        callback(this.generateScalingEvent());
      }
    });
  }

  generateScalingEvent() {
    let scalingEvent = {
      offset: {
        x: this.offsetX,
        y: this.offsetY
      },
      move: {
        x: this.moveX,
        y: this.moveY
      },
      scale: this.scale,
      delta: {
        x: this.dx,
        y: this.dy
      },
      bitmap: {
        width: this.sourceImageBitmap.width,
        height: this.sourceImageBitmap.height
      },
      scaleCanvas: {
        width: this.scalingCanvas.width,
        height: this.scalingCanvas.height
      },
      image: {
        width: this.imageWidth,
        height: this.imageHeight
      }
    };
    return scalingEvent;
  }

  checkIfMatchingApolloSiteScale() {
    let difference = this.maxScale1to1 - this.scale;
    if (this.findApolloSiteContainer) {
      if (Math.abs(difference) < 0.4) {
        this.matchingApolloSiteScale = true;
        // this.findApolloSiteContainer.classList.add("matchingscale");
      } else {
        // this.findApolloSiteContainer.classList.remove("matchingscale");
        this.matchingApolloSiteScale = false;
      }
    }
  }

  checkIfGreaterThanOrEqualApolloSiteScale() {
    let result = false;
    if (this.findApolloSiteContainer) {
      result = this.scale >= this.maxScale1to1;
    }
    return result;
  }

  drawArrowAndUpdate(ctx, imageWidth, imageHeight, arrowScale = 8) {
    let landingX = imageWidth * this.landing.x + this.dx;
    let landingY = imageHeight * this.landing.y + this.dy;
    let color = 'rgba(243, 60, 143, 1.0)';
    this.sourceCtx.strokeStyle = 'rgba(243, 60, 143, 1.0)';
    this.sourceCtx.fillStyle = 'rgba(243, 60, 143, 1.0)';
    this.sourceCtx.lineWidth = 4;

    canvasUtils.canvasArrow(
      ctx,
      landingX - arrowScale * 7,
      landingY,
      landingX,
      landingY,
      false,
      true,
      color,
      arrowScale
    );
    this.arrowDrawn = true;
  }

  previewZoomCanvasDraw(zp) {
    this.zp = zp;
    const ctx = this.previewZoomCanvas.getContext('2d');
    const pzcW = this.previewZoomCanvas.width;
    const pczH = this.previewZoomCanvas.height;
    const strokestyle = 'rgba(255, 255, 255, 0.75)';
    const arrowColor = 'rgba(243, 60, 143, 1.0)';
    // if (this.matchingApolloSiteScale)(
    //   strokestyle = 'rgba(243, 60, 143, 0.75)'
    // );
    ctx.clearRect(0, 0, pzcW, pczH);
    if (this.canDrag()) {
      this.pzcZoomRectDisplayed = true;
      ctx.strokeStyle = strokestyle;
      ctx.lineWidth = 4;
      this.zx = zp.sx * pzcW;
      this.zy = zp.sy * pczH;
      this.zwidth = pzcW * zp.sw;
      this.zheight = pczH * zp.sh;
      ctx.strokeRect(this.zx, this.zy, this.zwidth, this.zheight);
    } else {
      this.pzcZoomRectDisplayed = false;
    }
    if (this.checkIfGreaterThanOrEqualApolloSiteScale()) {
      let landingX = pzcW * this.landing.x;
      let landingY = pczH * this.landing.y;
      ctx.strokeStyle = 'rgba(243, 60, 143, 1.0)';
      ctx.fillStyle = 'rgba(243, 60, 143, 1.0)';
      let arrowScale = 6;
      canvasUtils.canvasArrow(
        this.previewZoomCanvas.getContext('2d'),
        landingX - arrowScale * 8,
        landingY,
        landingX,
        landingY,
        false,
        true,
        arrowColor,
        arrowScale
      );
    }
  }

  calcMaxScale() {
    this.maxScale1to1 = Math.min(this.sourceImageBitmap.height / this.scalingCanvas.height, this.sourceImageBitmap.width / this.scalingCanvas.width);
    this.ratio = 1 / this.maxScale1to1;
    this.maxScale = this.maxScale1to1 * 8;
  }

  getWidthHeight(elem) {
    return { width: elem.clientWidth, height: elem.clientHeight };
  }

  resizeCanvas(c) {
    this.clientDimensions = this.getWidthHeight(this.scalingCanvas.parentElement);
    let clientWidth, clientHeight;
    clientWidth = this.clientDimensions.width;
    clientHeight = this.clientDimensions.height;
    let sourceAspectRatio = this.nx / this.ny;
    let destinationAspectRatio = clientWidth / clientHeight;
    let resizeW, resizeH;
    if (destinationAspectRatio >= sourceAspectRatio) {
      resizeH = clientHeight;
      resizeW = clientHeight * sourceAspectRatio;
    } else {
      resizeW = clientWidth;
      resizeH = clientWidth / sourceAspectRatio;
    }
    c.width = resizeW;
    c.height = resizeH;
    this.calcMaxScale();
    this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
  }

  updateZoomButtons() {
    if (this.zoomButtonsEnabled) {
      this.zoomInButton.disabled = false;
      this.zoomOutButton.disabled = false;
      this.zoomResetButton.disabled = false;
      if (this.scale >= this.maxScale) {
        this.zoomInButton.disabled = true;
      }
      if (this.scale == this.minScale) {
        this.zoomOutButton.disabled = true;
        this.zoomResetButton.disabled = true;
      }
    }
  }

  /// Event Handling ...

  buttonListener(e) {
    this.scaling = e.currentTarget.dataset.scale;
    this.scaleDraw = requestAnimationFrame(this.scaleCanvas);
  }

  // touchpad pinch and two finger swipe AND mouse scrollwheel
  listenerZoom(e) {
    let targetRect = e.target.getBoundingClientRect();
    let pos = {
      x: e.pageX - targetRect.x,
      y: e.pageY - targetRect.y
    };
    var dx = 0;
    var dy = 0;

    if (this.wheeling === 'idle') {
      this.wheeling = 'running';
      // console.log(`wheeling started`);

      if (this.scaling) {
        this.startCoords = {
          x: pos.x - this.lastMove.x,
          y: pos.y - this.lastMove.y
        };

        this.lastDraggedPos = {
          x: pos.x,
          y: pos.y
        };

        this.moveX = pos.x - this.startCoords.x;
        this.moveY = pos.y - this.startCoords.y;

        // this.moveX = pos.x;
        // this.moveY = pos.y;

      } else {
        this.startCoords = {
          x: pos.x - this.lastMove.x,
          y: pos.y - this.lastMove.y
        };

        this.lastDraggedPos = {
          x: pos.x,
          y: pos.y
        };

        this.lastDraggedPreviewZoomPos = {
          x: this.applyScaleToMoveX(pos.x),
          y: this.applyScaleToMoveY(pos.y)
        };

        this.moveX = pos.x - this.startCoords.x;
        this.moveY = pos.y - this.startCoords.y;

      }

      // clear any timeout previously started
      clearTimeout(this.wheelingTimeOut);

      // and start another ...
      this.wheelingTimeOut = setTimeout(() => {
        this.wheeling = 'idle';
        this.lastMove = {
          x: this.moveX,
          y: this.moveY
        };
        this.lastPreviewZoomMove = {
          x: this.previewZoomMoveX,
          y: this.previewZoomMoveY
        };
        // console.log(`wheeling stopped`);
      }, 250); // waiting 250ms to change back to false.
    }

    if (this.wheeling == 'running') {

      if (e.ctrlKey) {
        // zoom
        dy = e.deltaY;
        if (platform.os.family == 'Windows' && (platform.name == 'Chrome' || platform.name == 'Edge')) {
          dy /= 20;
        }
        this.scaling = true;
        this.scale = this.scale * (1 - dy / 100);
        if (this.scale < 1) this.scale = 1;
        this.scale = Math.min(this.scale, this.maxScale);
        this.updateZoomButtons();
        // this.redraw = requestAnimationFrame(this.scaleCanvas);
        this.queueCanvasDraw();
        // console.log(`listenerZoom-pan scale: ${this.scale}; move: ${this.moveX}, ${this.moveY}; pos: ${pos.x}, ${pos.y}`);

      } else {
        // pan
        this.scaling = false;

        switch (platform.os.family) {
        case 'Windows':
          switch (platform.name) {
          case 'Edge':
            dx = e.deltaX * 0.25;
            dy = e.deltaY * 0.25;
            break;
          case 'Chrome':
            if (e.shiftKey) {
              dx = e.deltaY * 0.25;
            } else {
              dy = e.deltaY * 0.25;
            }
            break;
          case 'Firefox':
            dx = e.deltaX * 10;
            dy = e.deltaY * 10;
            break;
          }
          break;
        case 'OS X':
          switch (platform.name) {
          case 'Chrome':
            dx = e.deltaX;
            dy = e.deltaY;
            break;
          case 'Firefox':
            dx = e.deltaX * 0.5;
            dy = e.deltaY * 0.5;
            break;
          }
          break;
        case 'Linux':
          switch (platform.name) {
          case 'Chrome':
            dx = e.deltaX;
            dy = e.deltaY;
            break;
          case 'Firefox':
            dx = e.deltaX;
            dy = e.deltaY;
            break;
          }
          break;
        }

        // console.log(`pan dx, dy: ${dx}, ${dy}`);
        dx = Math.sign(dx) * Math.min(24, Math.abs(dx));
        dy = Math.sign(dy) * Math.min(24, Math.abs(dy));

        dx = this.dxOld + (dx - this.dxOld * 0.5);
        dy = this.dyOld + (dy - this.dyOld * 0.5);

        this.moveX += dx;
        this.moveY += dy;
        this.dxOld = dx;
        this.dxOld = dx;

        if (app.dev) {
          console.log(`listenerZoom-pan move: ${this.moveX}, ${this.moveY}; pos: ${pos.x}, ${pos.y}`);
        }

        this.queueCanvasDraw();
        // this.redraw = requestAnimationFrame(this.scalingCanvasDraw);

        this.previewZoomMoveX = this.applyScaleToMoveX(this.moveX);
        this.previewZoomMoveY = this.applyScaleToMoveX(this.moveY);

      }
    }
  }

  listenerPanArrowEnd() {
    if (this.panning == 'panning') {
      this.panning = 'idle';
    }
  }

  scalinglistenerPanArrowStart(e) {
    this.maxPanArrowStep = 5;
    this.currentPanArrowStep = 1;
    let arrow = e.target;
    this.panArrowDirection = arrow.dataset.direction;
    this.panning = 'panning';
    // and start an interval to run processPan until
    // mouseup, mouseleave, or touchend
    this.panningInterval = setInterval(() => {
      if (this.panning == 'panning') {
        this.processPan(this.currentPanArrowStep);
        if (this.currentPanArrowStep < this.maxPanArrowStep) {
          ++this.currentPanArrowStep;
        }
      } else {
        if (this.currentPanArrowStep > 0) {
          --this.currentPanArrowStep;
          if (this.currentPanArrowStep == 0) {
            clearInterval(this.panningInterval);
          } else {
            this.processPan(this.currentPanArrowStep);
          }
        }
      }
    }, 50);
  }

  processPan(delta) {
    let dx = 0,
      dy = 0;
    this.lastMove = {
      x: this.moveX,
      y: this.moveY
    };
    this.lastPreviewZoomMove = {
      x: this.previewZoomMoveX,
      y: this.previewZoomMoveY
    };

    switch (this.panArrowDirection) {
    case 'up':
      dy = delta;
      break;
    case 'down':
      dy = -delta;
      break;
    case 'right':
      dx = -delta;
      break;
    case 'left':
      dx = delta;
      break;
    }

    // console.log(`pan dx, dy: ${dx}, ${dy}`);
    dx = Math.sign(dx) * Math.min(24, Math.abs(dx));
    dy = Math.sign(dy) * Math.min(24, Math.abs(dy));

    dx = this.dxOld + (dx - this.dxOld * 0.5);
    dy = this.dyOld + (dy - this.dyOld * 0.5);

    this.moveX += dx;
    this.moveY += dy;
    this.dxOld = dx;
    this.dxOld = dx;

    this.queueCanvasDraw();
    // this.redraw = requestAnimationFrame(this.scalingCanvasDraw);

    this.previewZoomMoveX = this.applyScaleToMoveX(this.moveX);
    this.previewZoomMoveY = this.applyScaleToMoveX(this.moveY);
  }

  /*
      POINTER EVENTS for main scaling canvas
  */

  removePointerEventFromCache(e) {
    // Remove this event from the target cache
    if (e.pointerId) {
      for (var i = 0; i < this.evCache.length; i++) {
        if (this.evCache[i].pointerId == e.pointerId) {
          this.evCache.splice(i, 1);
          this.resetTwoPointerStateVars();
          break;
        }
      }
    }
    if (this.evCache.length == 0) {
      this.mouseDownTouchFirstStart = false;
      this.isDragging = this.scaling = false;
    }
  }

  addPointerEventToCache(e) {
    // Add this event from the target cache
    if (e.pointerId) {

      let index = this.evCache.findIndex((item) => item.pointerId == e.pointerId);
      if (index >= 0) {
        this.evCache[index] = e;
      } else {
        this.evCache.push(e);
      }
      if (this.evCache.length > 2) {
        this.resetTwoPointerStateVars();
        while (this.evCache.length > 2) {
          this.evCache.shift();
        }
      }
    }
  }

  resetTwoPointerStateVars() {
    this.previousDistance = -1;
    this.previousCenter = -1;
  }

  canDrag() {
    return this.scale > 1;
  }

  pointerEvents(e) {
    var touch;
    let pos = {
      x: 0,
      y: 0
    };
    let targetRect = e.target.getBoundingClientRect();

    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
      touch = e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove" ||
      e.type == 'pointerdown' ||
      e.type == 'pointermove'
    ) {
      pos.x = e.pageX;
      pos.y = e.pageY;
    }
    pos.x -= targetRect.x;
    pos.y -= targetRect.y;
    return pos;
  }

  // Also supports
  // Two finger pinch-zoom gestures
  // https://github.com/mdn/dom-examples/blob/master/pointerevents/Pinch_zoom_gestures.html
  //
  listenerMouseDownTouchStart(e) {
    let pos = null;
    this.mouseDownTouchFirstStart = true;

    // The pointerdown event signals the start of a touch interaction.
    // This event is cached to support 2-finger gestures
    this.addPointerEventToCache(e);

    if (this.evCache.length == 2) {
      let x1 = this.evCache[0].offsetX;
      let y1 = this.evCache[0].offsetY;
      let x2 = this.evCache[1].offsetX;
      let y2 = this.evCache[1].offsetY;
      pos = this.calcCenter(x1, y1, x2, y2);
    } else {
      pos = this.pointerEvents(e);
    }

    this.dragStarted = true;
    this.isDragging = this.scaling = false;

    this.startCoords = {
      x: pos.x - this.lastMove.x,
      y: pos.y - this.lastMove.y
    };

    this.previewZoomStartCoords = {
      x: this.applyScaleToMoveX(this.startCoords.x),
      y: this.applyScaleToMoveY(this.startCoords.y)
    };

    this.lastDraggedPos.x = pos.x;
    this.lastDraggedPos.y = pos.y;

    this.lastChangeIn = "main";

    this.queueCanvasDraw();

    if (app.dev) {
      console.log(['start startCoords:', this.startCoords.x, this.startCoords.y, ', pos: ', pos.x, pos.y, ', lastMove: ', this.lastMove.x, this.lastMove.y, ', dragStarted: ', this.dragStarted]);
      console.log(this.scalingCanvasDrawArgs());
    }
  }

  calcDistance(x1, y1, x2, y2) {
    let ax = Math.abs(x1 - x2);
    let ay = Math.abs(y1 - y2);
    return Math.sqrt(ax * ax + ay * ay);
  }

  calcCenter(x1, y1, x2, y2) {
    let dx2 = (x1 - x2) / 2;
    let dy2 = (y1 - y2) / 2;
    return {
      x: x2 + dx2,
      y: y2 + dy2
    }
  }

  listenerMouseMoveTouchMove(e) {
    let pos = null;
    this.addPointerEventToCache(e);

    let calcCenterMove = (center1, center2) => {
      let centerMove = -1;
      if (center1 && center1.x) {
        centerMove = this.calcDistance(center1.x, center1.y, center2.x, center2.y);
      }
      return centerMove;
    }

    if (this.evCache.length == 0) return;

    // If two pointers are down, check for pinch and swipe gestures
    if (this.evCache.length == 2) {
      let x1 = this.evCache[0].offsetX;
      let y1 = this.evCache[0].offsetY;
      let x2 = this.evCache[1].offsetX;
      let y2 = this.evCache[1].offsetY;

      if (this.mouseDownTouchFirstStart) {
        this.mouseDownTouchFirstStart = false;
        this.previousCenter = this.calcCenter(x1, y1, x2, y2)
        this.previousDistance = this.calcDistance(x1, y1, x2, y2);
        return;
      }

      if (app.dev) {
        console.log('evCache.length == 2');
      }

      // Calculate the distance between the two pointers
      let currentDistance = this.calcDistance(x1, y1, x2, y2);

      let currentCenter = this.calcCenter(x1, y1, x2, y2);

      let centerMove = calcCenterMove(this.previousCenter, currentCenter);

      if (app.dev) {
        console.log('currentCenter: ', currentCenter, ', centerMove: ', centerMove);
      }

      if (this.previousDistance >= 0 || centerMove >= 0) {
        let deltaDistance = currentDistance - this.previousDistance;

        pos = this.calcCenter(x1, y1, x2, y2);

        this.scalingTrigger = this.scaling ? 0.5 : 5;
        this.panningTrigger = this.isDragging ? 0.5 : 5;

        if (app.dev) {
          console.log('*** before test ***: ', currentDistance, deltaDistance, ', scaling: ', this.scaling, ', isDragging: ', this.isDragging);
        }

        if (deltaDistance >= this.scalingTrigger && !this.isDragging) {
          // The distance between the two pointers has increased
          this.scaling = true;
          pos = null;
          if (app.dev) {
            console.log('*** zoom-in ***: ', currentDistance, deltaDistance);
          }
          let newScale = this.scale * this.gestureScaleFactor;
          this.previousDistance = currentDistance;
          this.scaleCanvasContinuousValue(newScale);
          return;
        } else if (deltaDistance <= -this.scalingTrigger && !this.isDragging) {
          // The distance between the two pointers has decreased
          this.scaling = true;
          pos = null;
          if (app.dev) {
            console.log('*** zoom-out ***: ', currentDistance, deltaDistance);
          }
          let newScale = this.scale / this.gestureScaleFactor;
          this.previousDistance = currentDistance;
          this.scaleCanvasContinuousValue(newScale);
          return;
        } else {
          pos = null;
        }
        if (centerMove > this.panningTrigger && !this.scaling) {
          // process the two-pointer swipe event
          pos = this.calcCenter(x1, y1, x2, y2);
          this.isDragging = true;
          // console.log('panning')
        } else if (centerMove == -1) {
          this.previousCenter = u.deepClone(currentCenter);
        }

      } else {
        // initialize previousDistance
        this.scaling = false;
        this.previousDistance = currentDistance;
        this.previousCenter = u.deepClone(currentCenter);
      }
    } else {
      if (this.scaling) {
        return;
      }
      pos = this.pointerEvents(e);
    }

    // pos is null if a pinch-zoom event was processed
    if (pos) {

      let moveX = (pos.x - this.startCoords.x);
      let moveY = (pos.y - this.startCoords.y);
      let distance = Math.sqrt(moveX * moveX + moveY + moveY);

      // hack to restore regular mouse drag functionality
      let panningTrigger = true;
      if (this.evCache.length >= 2) {
        panningTrigger = (distance > this.panningTrigger)
      }

      if (this.isDragging || this.canDrag() && this.dragStarted && panningTrigger) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        this.moveX = moveX;
        this.moveY = moveY;

        if (app.dev) {
          console.log('dragging', pos, this.startCoords, this.moveX, this.moveY);
        }
        this.calcMainWidthsHeightsLimitMoves();

        this.previewZoomMoveX = this.applyScaleToMoveX(this.moveX);
        this.previewZoomMoveY = this.applyScaleToMoveX(this.moveY);

        this.lastDraggedPos.x = pos.x;
        this.lastDraggedPos.y = pos.y;

        this.lastDraggedPreviewZoomPos.x = this.applyScaleToMoveX(pos.x);
        this.lastDraggedPreviewZoomPos.y = this.applyScaleToMoveY(pos.y);

        // this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
        this.queueCanvasDraw();

        if (app.dev) {
          console.log(`move: ${this.moveX}, ${this.moveY}; pos: ${pos.x}, ${pos.y}`);
        }
      }
    }
  }

  listenerUpLeaveEnd() {
    if (this.dragStarted || this.isDragging) {
      this.lastMove = {
        x: this.moveX,
        y: this.moveY
      };

      this.lastPreviewZoomMove = {
        x: this.previewZoomMoveX,
        y: this.previewZoomMoveY
      };

      this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
      this.dragStarted = this.isDragging = this.scaling = false;
      this.lastChangeIn = "main";
      if (app.dev) {
        console.log([name, 'lastMove: ', this.lastMove.x, this.lastMove.y]);
      }
    }
  }

  listenerMouseLeave() {
    this.listenerUpLeaveEnd('leave');
  }

  listenerMouseUpTouchEnd(e) {
    this.removePointerEventFromCache(e);
    if (app.dev) {
      console.log('MouseUpTouchEnd,', this.evCache.length);
    }
    this.listenerUpLeaveEnd('up-end');
  }

  /*
      POINTER EVENTS for preview zoom canvas
  */

  previewZoomPointerEvents(e) {
    var touch;
    let pos = {
      x: 0,
      y: 0
    };
    let targetRect = e.target.getBoundingClientRect();

    if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend") {
      touch = e.changedTouches[0] || e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove"
    ) {
      pos.x = e.pageX;
      pos.y = e.pageY;
    }
    pos.x -= targetRect.x;
    pos.y -= targetRect.y;
    return [pos, touch];
  }

  inZoomRect(pos) {
    let inside = false;
    let inColumn = false;
    let inRow = false;
    let zx, zy, zw, zh = 0;
    if (this.pzcZoomRectDisplayed) {
      zx = this.zp.sx * this.pzcClientWidth;
      zy = this.zp.sy * this.pzcClientHeight;
      zw = this.zp.sw * this.pzcClientWidth;
      zh = this.zp.sh * this.pzcClientHeight;
      inRow = pos.y >= zy && pos.y <= (zy + zh);
      inColumn = pos.x >= zx && pos.x <= (zx + zw);
      inside = inColumn && inRow;
    }
    return inside;
  }

  listenerMouseOverZoomRect() {
    this.overPreviewZoom = true;
  }

  listenerMouseMoveZoomRect(e) {
    const rect = this.previewZoomCanvas.getBoundingClientRect();
    var pos = {};
    if (this.overPreviewZoom) {
      pos.x = e.clientX - rect.left;
      pos.y = e.clientY - rect.top;
      if (this.inZoomRect(pos)) {
        this.previewZoomCanvas.classList.add('overzoomrect');
      } else {
        this.previewZoomCanvas.classList.remove('overzoomrect');
      }
    }
  }

  listenerMouseOutZoomRect() {
    this.previewZoomCanvas.classList.remove('overzoomrect');
    this.overPreviewZoom = false;
  }

  reCalculatePreviewZoomRect() {
    if (this.previewZoomCanvas) {
      let rect = this.previewZoomCanvas.getBoundingClientRect();
      this.pzcClientWidth = rect.width;
      this.pzcClientHeight = rect.height;
      this.pczScaleToPos = this.pzcClientWidth / this.previewZoomCanvas.width;
      this.scaleToMoveX = this.scalingCanvas.width / -(this.zwidth * this.pczScaleToPos);
      this.scaleToMoveY = this.scalingCanvas.height / -(this.zheight * this.pczScaleToPos);
    }
  }

  applyScaleToPzcMoveX(pzcPosX) {
    return pzcPosX * this.scaleToMoveX;
  }

  applyScaleToPzcMoveY(pzcPosY) {
    return pzcPosY * this.scaleToMoveY;
  }

  applyScaleToMoveX(posX) {
    return posX / this.scaleToMoveX;
  }

  applyScaleToMoveY(posY) {
    return posY / this.scaleToMoveY;
  }

  previewZoomListenerMouseDownTouchStart(e) {
    let [pos, touch] = this.previewZoomPointerEvents(e);

    if (this.inZoomRect(pos)) {
      if (e.type === "touchstart" && touch.length === 2) {
        // touch = e.originalEvent.touches || e.originalEvent.changedTouches;
        touch = e.touches || e.changedTouches;
        this.scaling = true;

        // Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        this.previewZoomLastDistance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      }
      this.previewZoomDragStarted = true;
      this.previewZoomIsDragging = this.previewZoomScaling = false;

      this.previewZoomStartCoords = {
        x: pos.x - this.lastPreviewZoomMove.x,
        y: pos.y - this.lastPreviewZoomMove.y
      };

      this.lastDraggedPreviewZoomPos.x = pos.x;
      this.lastDraggedPreviewZoomPos.y = pos.y;

      // scale and update main image zoom and drag UI variables
      this.startCoords = {
        x: this.applyScaleToPzcMoveX(this.previewZoomStartCoords.x),
        y: this.applyScaleToPzcMoveY(this.previewZoomStartCoords.y)
      };

      this.lastDraggedPos = {
        x: this.applyScaleToPzcMoveX(pos.x),
        y: this.applyScaleToPzcMoveY(pos.y)
      };

      this.calcMainWidthsHeightsLimitMoves();
      this.queueCanvasDraw();

      // console.log(`
      // startPZ: start: $ { this.previewZoomStartCoords.x }, $ { this.previewZoomStartCoords.y };
      // pos: $ { pos.x }, $ { pos.y };
      // lastPzMove: $ { this.lastPreviewZoomMove.x }, $ { this.lastPreviewZoomMove.y }
      // `);
    } else {
      // console.log(['startPZ-out', pos.x, pos.y]);
    }

    this.lastChangeIn = "pzc";

  }

  previewZoomListenerMouseMoveTouchMove(e) {
    let [pos, touch] = this.previewZoomPointerEvents(e);

    if (this.canDrag() && this.previewZoomDragStarted) {
      this.previewZoomIsDragging = true;
    }

    if (this.previewZoomIsDragging && this.canDrag()) {

      if (this.inZoomRect(pos)) {
        this.previewZoomMoveX = (pos.x - this.previewZoomStartCoords.x);
        this.previewZoomMoveY = (pos.y - this.previewZoomStartCoords.y);

        this.lastDraggedPreviewZoomPos.x = pos.x;
        this.lastDraggedPreviewZoomPos.y = pos.y;

        // scale and update main image zoom and drag UI variables
        this.moveX = this.applyScaleToPzcMoveX(this.previewZoomMoveX);
        this.moveY = this.applyScaleToPzcMoveY(this.previewZoomMoveY);

        this.calcMainWidthsHeightsLimitMoves();

        this.lastDraggedPos = {
          x: this.applyScaleToPzcMoveX(pos.x),
          y: this.applyScaleToPzcMoveY(pos.y)
        };

        // this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
        this.queueCanvasDraw();
      }
    } else if (this.scaling === true) {
      if (e instanceof TouchEvent) {
        touch = e.originalEvent.touches || e.originalEvent.changedTouches;

        //Pinch detection credits: http://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch/11183333#11183333
        this.previewZoomDistance = Math.sqrt(
          (touch[0].clientX - touch[1].clientX) *
          (touch[0].clientX - touch[1].clientX) +
          (touch[0].clientY - touch[1].clientY) *
          (touch[0].clientY - touch[1].clientY)
        );
      }
      // this.scaleDraw = requestAnimationFrame(this.scaleCanvasTouch);
      // console.log(['move', this.previewZoomMoveX, this.previewZoomMoveY, this.previewZoomDistance]);
    } else {
      this.previewZoomUpLeaveEnd('move-touch-out', pos);
    }

    this.lastChangeIn = "pzc";

  }

  previewZoomUpLeaveEnd() {
    if (this.previewZoomDragStarted || this.previewZoomIsDragging) {
      this.lastChangeIn = "pzc";
      this.lastPreviewZoomMove = {
        x: this.previewZoomMoveX,
        y: this.previewZoomMoveY
      };
      // update main image zoom and drag UI variables
      this.lastMove = {
        x: this.applyScaleToPzcMoveX(this.lastPreviewZoomMove.x),
        y: this.applyScaleToPzcMoveY(this.lastPreviewZoomMove.y)
      };
      this.redraw = requestAnimationFrame(this.scalingCanvasDraw);
      this.previewZoomDragStarted = this.previewZoomIsDragging = false;

      this.lastChangeIn = "pzc";

      // console.log(`${name}: lastPZMove: $ {this.lastPreviewZoomMove.x}, ${this.lastPreviewZoomMove.y}`);
    }
    // cancelAnimationFrame(this.scaleDraw);
    // cancelAnimationFrame(this.redraw);
  }

  previewZoomListenerMouseLeave() {
    this.previewZoomUpLeaveEnd('leave');
  }

  previewZoomListenerMouseUpTouchEnd() {
    this.previewZoomUpLeaveEnd('up-end');
  }

}

export default Scaling;
