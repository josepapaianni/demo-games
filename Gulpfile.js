'use strict';

//var watchify = require('watchify');
var gulp = require('gulp');
var argv = require('yargs').argv;
var clean = require('gulp-clean');
var imagemin = require('gulp-imagemin');
var template = require('gulp-template');
var browserify = require('browserify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var source = require('vinyl-source-stream');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var fs = require('fs');


var config = {
  gameName: argv.game ? argv.game : 'default'
};

var release = false;
var timeStamp = new Date();

var pathConfig = {
  commonSrcPath: 'app/common',
  defaultSrcPath: 'app/partials/door-palooza',
  partialSrcPath: argv.game ? 'app/partials/' + argv.game : 'app/partials/door-palooza',
  devPath: '.tmp',
  buildPath: function () {
    if (release){
      var month = Number(timeStamp.getMonth())+1;
      return argv.game ? 'dist/fdv_sbg-' + argv.game + '_' + config.gameVersion + '_' + month + timeStamp.getDate()+ timeStamp.getFullYear() : 'dist/default';
    } else {
      return argv.game ? 'dist/' + argv.game + '-v' + config.gameVersion : 'dist/default';
    }
  }
};


//Todo: automatic version numbering on each build
function getVersionNumber(callback) {
  fs.readFile('./version.json', 'utf8', function (err, data) {
    var tmp = JSON.parse(data);
    if (tmp[config.gameName]) {
      //tmp[config.gameName] = Number((tmp[config.gameName] + 0.1).toFixed(1));
      tmp[config.gameName] = Number((tmp[config.gameName] + 1).toFixed(1));
    } else {
      //tmp[config.gameName] = 0.1;
      tmp[config.gameName] = 1;
    }
    config.gameVersion = tmp[config.gameName];
    console.log(config.gameVersion);
    fs.writeFile('./version.json', JSON.stringify(tmp), function (err) {
      if (err) {
        console.log(err)
      }
    });
    callback();
  })
}

function getReleaseVersionNumber(callback) {
  fs.readFile('./version-release.json', 'utf8', function (err, data) {
    var tmp = JSON.parse(data);
    if (tmp[config.gameName]) {
      //tmp[config.gameName] = Number((tmp[config.gameName] + 0.1).toFixed(1));
      tmp[config.gameName] = Number((tmp[config.gameName] + 1).toFixed(1));
    } else {
      //tmp[config.gameName] = 0.1;
      tmp[config.gameName] = 1;
    }
    config.gameVersion = tmp[config.gameName];
    console.log(config.gameVersion);
    fs.writeFile('./version.json', JSON.stringify(tmp), function (err) {
      if (err) {
        console.log(err)
      }
    });
    callback();
  })
}

function parseXml() {
  var xmlConfig = fs.readFileSync(pathConfig.partialSrcPath + '/config.xml');
  var w = /<width>(.*?)<\/width>/gm.exec(xmlConfig.toString());
  var h = /<height>(.*?)<\/height>/gm.exec(xmlConfig.toString());
  //return {width: p[1], height: g[1] };
  if (Number(w[1]) > Number(h[1])) {
    return {
      src: 'http://cdn.pch.com/spectrum/games/images/gs-d-h.gif',
      width: w[1],
      height: h[1]
    }
  } else {
    return {
      src: 'http://cdn.pch.com/spectrum/games/images/gs-m-v.gif',
      width: w[1],
      height: h[1]
    }
  }
}

function checkPath(callback) {
  fs.access(pathConfig.partialSrcPath, fs.R_OK | fs.W_OK, function (err) {
    if (err) {
      callback({pass: false, msg: "\x1b[31m\x1b[1mWarning: \x1b[31mThe specified path does not exist"})
    } else {
      callback({pass: true, msg: "Game building started..."})
    }
  })
}

gulp.task('dev-clean', function () {
  //checkPath();
  ////console.log(checkPath().pass);
  return gulp.src('.tmp/*', {read: false})
    .pipe(clean({force: true}));
});

gulp.task('dev-browserify', ['dev-clean'], function () {
  return browserify(pathConfig.partialSrcPath + '/js/main.js', {
    debug: true
  })
    .bundle()
    .on('error', function (err) {
      console.log('browserify: '+ err);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(pathConfig.devPath + '/js'));
});

gulp.task('dev-copyLibs', ['dev-clean'], function () {
  return gulp.src('node_modules/phaser/build/phaser.js')
    .pipe(gulp.dest(pathConfig.devPath + '/libs'));
});

gulp.task('dev-optimizeGameImages', ['dev-clean'], function () {
  return gulp.src(pathConfig.partialSrcPath + '/assets/**/*')
    .pipe(gulp.dest(pathConfig.devPath + '/assets'))
});

gulp.task('dev-optimizeNonGameImages', ['dev-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/images/**/*')
    .pipe(gulp.dest(pathConfig.devPath + '/assets/images'))
});

gulp.task('dev-copyFonts', ['dev-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/fonts/**/*')
    .pipe(gulp.dest(pathConfig.devPath + '/assets/fonts'))
});

gulp.task('dev-copyCommonSounds', ['dev-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/audio/**/*')
    .pipe(gulp.dest(pathConfig.devPath + '/assets/sounds'))
});

gulp.task('dev-templateHtml', ['dev-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/base.html')
    .pipe(template({
      name: 'Skill Games',
      build: false,
      width: parseXml().width,
      height: parseXml().height,
      src: parseXml().src
    }))
    .pipe(rename("index.html"))
    .pipe(gulp.dest(pathConfig.devPath))
});

gulp.task('dev-sass', ['dev-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/sass/*.sass')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(pathConfig.devPath + '/css'))
});

/////// BUILD TASKS ////////

gulp.task('build-clean', function () {
  //checkPath();
  ////console.log(checkPath().pass);
  return gulp.src([pathConfig.buildPath(), "dist/" + config.gameName + '.zip'], {read: false})
    .pipe(clean());
});


gulp.task('build-browserify', ['build-clean'], function () {
  return browserify(pathConfig.partialSrcPath + '/js/main.js', {
    debug: false
  })
    .ignore('./app/common/proxys/default-proxy.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(pathConfig.buildPath() + '/js'));
});

//Phaser lib is loaded in the main frame of the frontend
gulp.task('build-copyLibs', ['build-clean'], function () {
  return gulp.src('node_modules/phaser/build/phaser.min.js')
    .pipe(gulp.dest(pathConfig.buildPath() + '/libs'));
});

gulp.task('build-xml', ['build-clean'], function () {
  return gulp.src(pathConfig.partialSrcPath + '/config.xml')
    .pipe(gulp.dest(pathConfig.buildPath()));
});

gulp.task('build-optimizeGameImages', ['build-clean'], function () {
  return gulp.src(pathConfig.partialSrcPath + '/assets/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(pathConfig.buildPath() + '/assets'))
});

gulp.task('build-optimizeNonGameImages', ['build-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest(pathConfig.buildPath() + '/assets/images'))
});

gulp.task('build-copyCommonSounds', ['build-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/audio/**/*')
    .pipe(gulp.dest(pathConfig.buildPath() + '/assets/sounds'))
});

gulp.task('build-copyFonts', ['build-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/fonts/**/*')
      .pipe(gulp.dest(pathConfig.buildPath() + '/assets/fonts'))
});

gulp.task('build-templateHtml', ['build-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/base.html')
    .pipe(template({
      name: 'Skill Games',
      build: true,
      width: parseXml().width,
      height: parseXml().height,
      src: parseXml().src
    }))
    .pipe(rename("index.php"))
    .pipe(gulp.dest(pathConfig.buildPath()))
});

gulp.task('build-sass', ['build-clean'], function () {
  return gulp.src(pathConfig.commonSrcPath + '/sass/*.sass')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(pathConfig.buildPath() + '/css'))
});

gulp.task('build-zip', ['build-clean', 'build-browserify', 'build-templateHtml', 'build-sass', 'build-optimizeGameImages', 'build-optimizeNonGameImages'], function () {
  return gulp.src(pathConfig.buildPath() + '/**/*')
    .pipe(zip(pathConfig.buildPath() + '.zip',{compress: false}))
    .pipe(gulp.dest('./'))
});

gulp.task('webserver', ['dev-clean', 'dev-copyLibs', 'dev-browserify', 'dev-templateHtml', 'dev-sass', 'dev-optimizeGameImages', 'dev-optimizeNonGameImages'], function () {
  gulp.src('.tmp')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      fallback: 'index.html',
      open: true,
      host: '0.0.0.0'
    }));
});

gulp.task('watch', function () {
  gulp.watch([pathConfig.partialSrcPath + '/**/*', pathConfig.commonSrcPath + '/**/*'], ['prebuild']);
});

gulp.task('serve', ['dev-clean', 'dev-copyLibs', 'dev-browserify', 'dev-templateHtml', 'dev-sass', 'dev-optimizeGameImages', 'dev-optimizeNonGameImages', 'dev-copyFonts', 'dev-copyCommonSounds', 'watch', 'webserver']);

gulp.task('prebuild', ['dev-copyLibs', 'dev-browserify', 'dev-templateHtml', 'dev-sass', 'dev-optimizeGameImages', 'dev-optimizeNonGameImages', 'dev-copyFonts', 'dev-copyCommonSounds']);

gulp.task('build', function () {
  checkPath(function (result) {
    if (result.pass) {
      console.log(result.msg);
      getVersionNumber(function () {
        gulp.start('build-clean', 'build-browserify', 'build-templateHtml', 'build-sass', 'build-optimizeGameImages', 'build-xml', 'build-optimizeNonGameImages', 'build-copyFonts', 'build-copyCommonSounds', 'build-zip')
      })
    } else {
      console.log(result.msg);
    }
  });
});

gulp.task('release', function () {
  release = true;
  checkPath(function (result) {
    if (result.pass) {
      console.log(result.msg);
      getReleaseVersionNumber(function () {
        gulp.start('build-clean', 'build-browserify', 'build-templateHtml', 'build-sass', 'build-optimizeGameImages', 'build-xml', 'build-optimizeNonGameImages', 'build-copyFonts', 'build-copyCommonSounds', 'build-zip')
      })
    } else {
      console.log(result.msg);
    }
  });
});

