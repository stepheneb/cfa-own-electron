/*jshint esversion: 6 */

// Test for browser features

let checkBrowser = () => {
  if (typeof createImageBitmap != "function") {
    requestAnimationFrame(function () {
      alert("This browser doesn't support the createImageBitmap() function. Please try again with Chrome, Firefox, Edge, or recent versions of Safari Technology Preview.");
    });
    return false;
  } else {
    return true;
  }
};

export default checkBrowser;
