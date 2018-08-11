const fs = require('fs-extra');
const path = require('path');
const sass = require('node-sass');
const browserify = require('browserify');
const babelify = require('babelify');
const vueify = require('vueify');
const config = require('./config');

const cwd = process.cwd();

// fs.ensureDir(config.cssOutput.split('/').slice(0, -1).join('/'));
// fs.ensureDir(config.appSrcOutput.split('/').slice(0, -1).join('/'));
fs.ensureFileSync(config.cssOutput);
fs.ensureFileSync(config.appSrcOutput);

fs.copySync(config.htmlInput, config.htmlOutput);

sass.render({
  file: config.sassInput,
  includePaths: config.sassIncludes,
  outFile: config.cssOutput,
}, function(err, res) {
  if (err !== null) {
    console.error(err);
  } else {
    fs.writeFileSync(config.cssOutput, res.css);
    browserify(config.appSrcInput)
      .transform('babelify')
      .transform('vueify')
      .bundle()
      .pipe(fs.createWriteStream(config.appSrcOutput));
  }
});
