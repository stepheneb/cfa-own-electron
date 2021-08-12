/*jshint esversion: 6 */

import gulp from 'gulp';
import browserSync from 'browser-sync';

const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: "./.webpack/renderer",
      index: "main_window/index.html"
    }
  });
  done();
}

// https://publishing-project.rivendellweb.net/migrating-projects-to-gulp-4-0-and-es6/
// https://gist.github.com/townivan/9dd4e55ab19f6eca5be8066e0da58bf5

const watch = () => {
  // "./rawdata/**/*.bmp",
  gulp.watch([
    '.webpack/renderer/**/*.json',
    '.webpack/renderer/**/*.html',
    '.webpack/renderer/**/*.css',
    '.webpack/renderer/**/*.js',
    '.webpack/renderer/images/**/*.js',
  ], reload);
};

const dev = gulp.series(serve, watch);
dev.description = 'Start server and use browsersync to watch files and update pages.';

exports.default = dev;
