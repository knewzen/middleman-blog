const pkg = require('./package.json')
const config = require('./gulpfile.config')
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')
const runSequence = require('run-sequence')
const swPrecache = require('sw-precache')
const del = require('del')
const fs = require('fs')

const $ = plugins()

gulp.task('clean', () => del([
    `./build`,
    `${config.source.css}/*.css`,
    `!${config.source.css}/*.css.erb`,
    `${config.source.partials}/_inline-stylesheets.html.slim`
  ], {
    dot: true
  }
))

gulp.task('stylesheets', () =>
  gulp.src([`${config.source.sass}/*.sass`])
    .pipe($.plumber(config.plumberHandler))
    .pipe($.sass(config.sassSettings))
    .pipe($.combineMq())
    .pipe(config.isProduction ? $.cssnano({ autoprefixer: config.autoprefixer, add: true, reduceIdents: false }) : $.jsbeautifier())
    .pipe(config.isProduction ? $.rename({ suffix: '.min' }) : $.util.noop())
    .pipe($.header(config.banner.join('\n'), { pkg : pkg } ))
    .pipe($.size({ title: 'Build Stylesheets', showFiles: true }))
    .pipe(gulp.dest(config.source.css))
    .pipe($.plumber.stop()))

gulp.task('replace', () =>
  gulp.src([`${config.source.partials}/_inline-stylesheets.html`])
    .pipe($.plumber(config.plumberHandler))
    .pipe($.replace('__INLINE_STYLESHEET__', function(s) {
      const file = config.isProduction ? 'inline.min.css' : 'inline.css'
      const style = fs.readFileSync(`${config.source.css}/${file}`, 'utf8')
      return 'css:\n  ' + style
    }))
    .pipe($.rename('_inline-stylesheets.html.slim'))
    .pipe($.size({ title: 'Replace stylesheets', showFiles: true }))
    .pipe(gulp.dest(config.source.partials))
    .pipe($.plumber.stop()))

gulp.task('images', () =>
  gulp.src([`${config.source.images}/**/*`])
    .pipe(($.util.env.type === 'compress') ? $.image(config.imageMin) : $.util.noop())
    .pipe(config.isProduction ? gulp.dest(`${config.source.images}`) : $.util.noop()))

gulp.task('generate-service-worker', (callback) => {
  swPrecache.write(config.source.sw, {
    staticFileGlobs: [
      `${config.source.stylesheets}/*.css`,
      `${config.source.javascripts}/*.js`,
      `${config.source.images}/**/*.{png,jpg,svg}`,
      `${config.source.fonts}/**/*`
    ],
    runtimeCaching: [{
      urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
      handler: 'cacheFirst'
    }, {
      urlPattern: /^https:\/\/d2pcfnwkh4jlye\.cloudfront\.net\//,
      handler: 'cacheFirst'
    }],
    stripPrefix: './source',
    cacheId: `${pkg.name}`
  }, callback)
})

gulp.task('watch', ['build'], () => {
  gulp.watch(`${config.source.sass}/**/*`, ['stylesheets'])
})

gulp.task('build', ['clean'], callback =>
  runSequence(
    ['images'],
    ['stylesheets'],
    ['replace'],
    ['generate-service-worker'],
    callback
  )
)

gulp.task('default', [ 'build' ])
