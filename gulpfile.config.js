const pkg = require('./package.json')
const bourbon = require('node-bourbon')
const notify = require('gulp-notify')
const gutil = require('gulp-util')
const path = require('path')

const isProduction = gutil.env.type === 'production'

module.exports = {
  source: {
    source: './source',
    partials: './source/partials',
    sass: './source/assets/_sass',
    css: './source/assets/stylesheets',
    images: './source/assets/images',
    sw: `./source/assets/javascripts/service-worker.js`
  },
  autoprefixer: {
    browsers: [
      'last 2 versions'
    ],
  },
  rename: {
    suffix: '.min'
  },
  isProduction: isProduction,
  sassSettings: {
    sourcemap: true,
    noCache: true,
    style: 'expanded',
    sourceComments: (isProduction) ? false : 'normal',
    includePaths: [
      path.join(__dirname, 'source/assets/_sass'),
      bourbon.includePaths
    ]
  },
  plumberHandler: {
    errorHandler: notify.onError({
      title: 'Gulp',
      message: 'Error: <%= error.message %>'
    })
  },
  imageMin: {
    pngquant: true,
    optipng: true,
    zopflipng: true,
    advpng: true,
    jpegRecompress: false,
    jpegoptim: true,
    mozjpeg: true,
    gifsicle: true,
    svgo: true
  },
  banner: [
    ' /**',
    '   <%= pkg.name %> - <%= pkg.description %>',
    '   @version v<%= pkg.version %>',
    '   @link <%= pkg.homepage %>',
    '   @license <%= pkg.license %>',
    '  ',
    ' */'
  ]
}
