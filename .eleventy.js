const { DateTime } = require('luxon');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const htmlmin = require('html-minifier');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const Image = require('@11ty/eleventy-img');
const timeToRead = require('eleventy-plugin-time-to-read');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const { Transform } = require('readable-stream');
const posthtml = require('posthtml');

require('dotenv').config();

/**
 * Fix public asset path relative to "src" folder
 */
function fixSrcPath(url) {
  if (url.startsWith('/')) {
    return '.' + url;
  } else {
    return url;
  }
}

module.exports = function (eleventyConfig) {
  // plugins

  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Reading Time
  eleventyConfig.addPlugin(timeToRead, {
    language: 'fr',
    speed: '280 words a minute',
  });

  eleventyConfig.addAsyncFilter('removeFootnotes', async function (value) {
    let { tree } = await posthtml().process(value);
    tree.match({ tag: 'section', attrs: { class: 'footnotes' } }, (node) => {
      node.tag = false;
      node.content = [];
      return node;
    });
    return tree.render(tree);
  });

  eleventyConfig.addAsyncFilter('countFootnotes', async function (value) {
    let { tree } = await posthtml().process(value);
    let countLi = 0;
    tree.match({ tag: 'section', attrs: { class: 'footnotes' } }, (node) => {
      countLi = node.content.find((child) => child.tag === 'ol').content.filter((child) => child.tag === 'li').length;
    });
    if (countLi > 0) {
      return `+ ${countLi} note${countLi > 1 ? 's' : ''}`;
    }
    return '';
  });

  // RSS feeds
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addLiquidFilter('dateToRfc3339', pluginRss.dateToRfc3339);
  eleventyConfig.addLiquidFilter('dateToRfc822', pluginRss.dateToRfc822);

  eleventyConfig.addFilter('removeStyles', function (value) {
    const regex = /(style=".+?")/gm;
    return value.replace(regex, '');
  });

  eleventyConfig.addFilter('removeScripts', function (value) {
    const regex = /<script(?:(?!\/\/)(?!\/\*)[^'"]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*(?:\n)|\/\*(?:(?:.|\s))*?\*\/)*?<\/script>/gm;
    return value.replace(regex, '');
  });

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don???t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Add support for maintenance-free post authors
  // Adds an authors collection using the author key in our post frontmatter
  // Thanks to @pdehaan: https://github.com/pdehaan
  // eleventyConfig.addCollection("authors", collection => {
  //   const blogs = collection.getFilteredByGlob("posts/*.md");
  //   return blogs.reduce((coll, post) => {
  //     const author = post.data.author;
  //     if (!author) {
  //       return coll;
  //     }
  //     if (!coll.hasOwnProperty(author)) {
  //       coll[author] = [];
  //     }
  //     coll[author].push(post.data);
  //     return coll;
  //   }, {});
  // });

  // Returns 1200px wide JPEG social-media (open-graph) image path.
  eleventyConfig.addAsyncShortcode('SocialImagePath', async (src) => {
    if (!src) return '';
    src = fixSrcPath(src);

    let meta = await Image(src, {
      widths: [1200],
      formats: ['jpeg'],
      urlPath: '/img/',
      outputDir: './_site/img/',
    });
    return meta.jpeg && meta.jpeg.length > 0 ? meta.jpeg[0].url : '';
  });

  // Date formatting (human readable)
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy');
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter('machineDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  });

  // Minify CSS

  const minifyCSS = function (code) {
    return new CleanCSS({}).minify(code).styles;
  };

  eleventyConfig.addFilter('cssmin', minifyCSS);

  // Minify JS
  const minifyJS = (code) => {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  };

  eleventyConfig.addFilter('jsmin', minifyJS);

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath.indexOf('.html') > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('static/fonts');
  eleventyConfig.addPassthroughCopy('static/data');
  eleventyConfig.addPassthroughCopy({ 'static/root/*': '/' });
  eleventyConfig.addPassthroughCopy('admin/');
  eleventyConfig.addPassthroughCopy('_includes/assets/css/inline.css');

  /* Markdown Plugins */
  const markdownIt = require('markdown-it');
  const markdownItAnchor = require('markdown-it-anchor');
  const markdownItEmoji = require('markdown-it-emoji');
  const markdownItFootnote = require('markdown-it-footnote');
  const markdownItTexmath = require('markdown-it-texmath');
  const latexEngine = require('katex');

  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
  })
    .use(markdownItAnchor, {
      permalink: false,
    })
    .use(markdownItEmoji)
    .use(markdownItFootnote)
    .use(markdownItTexmath, {
      engine: latexEngine,
      delimiters: 'dollars',
    });

  md.renderer.rules.footnote_caption = (tokens, idx) => {
    var n = Number(tokens[idx].meta.id + 1).toString();

    if (tokens[idx].meta.subId > 0) {
      n += ':' + tokens[idx].meta.subId;
    }

    return n;
  };

  eleventyConfig.setLibrary('md', md);

  /* dynamically loaded JS modules */
  eleventyConfig.addPassthroughCopy(
    {
      'node_modules/@justinribeiro/lite-youtube/lite-youtube.js': 'js-modules/lite-youtube.js',
      'js-modules/political-plot.js': 'js-modules/political-plot.js',
      'js-modules/service-worker.js': 'service-worker.js',
    },
    {
      transform: (src, dest, stats) => {
        return new Transform({
          transform(chunk, enc, done) {
            done(null, minifyJS(chunk.toString()));
          },
        });
      },
    }
  );

  /* dynamically loaded css files */
  eleventyConfig.addPassthroughCopy(
    {
      '_includes/assets/css/tex.css': '/tex.css',
    },
    {
      transform: (src, dest, stats) => {
        return new Transform({
          transform(chunk, enc, done) {
            done(null, minifyCSS(chunk.toString()));
          },
        });
      },
    }
  );

  /* custom shortcodes */
  eleventyConfig.addShortcode(
    'tweet-link',
    (id, author = 'n031d') =>
      `<a href="https://twitter.com/${author}/status/${id}"><img src="/static/img/icons/twitter-link.svg" class="icon twitter-link-icon" alt="tweet original"></img></a>`
  );

  eleventyConfig.addShortcode(
    'video-gif',
    (title, src, poster, maxWidth) =>
      `<video title="${title}" src="${src}" poster="${poster}" loop muted playsinline controls controlslist="nofullscreen nodownload noremoteplayback" preload="none" disablePictureInPicture ${
        maxWidth ? `style="max-width: ${maxWidth}"` : ``
      }></video>`
  );

  /* custom collections */
  eleventyConfig.addCollection('postsWithComments', function (collection) {
    const postsWithComments = new Set();

    collection.getFilteredByTag('post').forEach((item) => {
      let comments = [];

      if (item.data.comments) {
        comments = Object.values(item.data.comments)
          .filter((comment) => comment.post === item.fileSlug)
          .map((comment) => ({ ...comment, date: comment.date && new Date(comment.date) }));
      }

      item.data.staticmanEntries = comments;

      postsWithComments.add(item);
    });

    return [...postsWithComments];
  });

  return {
    templateFormats: ['md', 'njk', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don???t worry about it.
    // If you don???t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
