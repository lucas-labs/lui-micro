const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const del = require('del');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const browsersync = require('browser-sync').create();
const run = require('gulp-run');
const rename = require("gulp-rename");

//#region Serve
function browserSyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: './demo'
        }
    });
    cb();
}

function browserSyncReload(cb) {
    console.log('reloading....');
    browsersync.reload();
    cb();
}

function scssTask() {
    return src('demo/**/*.scss', { sourcemaps: false })
        .pipe(sass())
        .pipe(dest('demo'))
        .pipe(postcss([cssnano()]))
        .pipe(rename((path) => {
            path.basename += ".min";
        }))
        .pipe(dest('demo'));
}

function watchTask() {
    watch('demo/**/*.html', browserSyncReload);
    watch(
        ['demo/**/*.scss', 'src/**/*.scss'], 
        series(
            scssTask, 
            browserSyncReload
        )
    );
}

const serveTask = series(
    scssTask,
    browserSyncServe,
    watchTask
);
//#endregion

//#region Dist
function clean() {
    return del('dist');
}

function createDist() {
    return src(['src/**/*.scss', './package.json'])
        .pipe(dest('dist'));
}

const distTask = series(
    clean,
    createDist
);
//#endregion

//#region Release
function npmVersion(version) {
    const cmd = `pnpm version ${version} --no-git-tag-version`;
    console.log(`Running: "${cmd}"`);
    return run(cmd).exec();
}

function releaseMajorTask() {
    return npmVersion('major');
}
function releaseMinorTask() {
    return npmVersion('minor');
}
function releasePatchTask() {
    return npmVersion('patch');
}
function releasePremajorTask() {
    return npmVersion('premajor');
}
function releasePreminorTask() {
    return npmVersion('preminor');
}
function releasePrepatchTask() {
    return npmVersion('prepatch');
}
function releasePrereleaseTask() {
    return npmVersion('prerelease');
}
//#endregion

// exports
exports.serve = serveTask;
exports.dist = distTask;
exports['release:major'] = releaseMajorTask;
exports['release:minor'] = releaseMinorTask;
exports['release:patch'] = releasePatchTask;
exports['release:premajor'] = releasePremajorTask;
exports['release:preminor'] = releasePreminorTask;
exports['release:prepatch'] = releasePrepatchTask;
exports['release:prerelease'] = releasePrereleaseTask;

// dejar este al final
exports.default = serveTask;
