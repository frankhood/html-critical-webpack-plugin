const assert = require('assert');
const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const path = require('path');
const webpackConfig = require('./webpack.config');
const webpack = require('webpack');
const merge = require('webpack-merge');

describe('HtmlCriticalWebpackPlugin Cases: Generate Critical CSS', () => {
  const buildDirectory = path.resolve(__dirname, 'build');

  describe('minimum configuration', () => {
    let indexHtmlString;
    let indexHtmlDom;

    before((done) => {
      webpack(webpackConfig, () => {
        indexHtmlString = fs.readFileSync(`${buildDirectory}/index.html`, { encoding: 'utf8' });
        indexHtmlDom = new JSDOM(indexHtmlString);

        done();
      });
    });

    it('should generate the expected critical inline <style> tag', () => {
      const inlineStyleTags = indexHtmlDom.window.document.querySelectorAll('style');

      assert.equal(inlineStyleTags.length, 1);
      assert.equal(inlineStyleTags[0].getAttribute('type'), 'text/css');
    });

    it('should generate the expected critical <link> tag', () => {
      const linkTags = indexHtmlDom.window.document.querySelectorAll('link');
      
      assert.equal(linkTags.length, 2);
      assert.equal(linkTags[0].getAttribute('rel'), 'preload');
      assert.equal(linkTags[0].getAttribute('as'), 'style');

      assert.equal(linkTags[1].getAttribute('rel'), 'preload');
      assert.equal(linkTags[1].getAttribute('as'), 'style');
    });

    it('should generate the expected critical <noscript> tag', () => {
      const noscriptTags = indexHtmlDom.window.document.querySelectorAll('noscript');
      
      assert.equal(noscriptTags.length, 2);
    });

  });

  describe('public path', () => {
    let indexHtmlString;
    let indexHtmlDom;

    const config = merge({ output: { publicPath: '//cdn.example.com/' } }, webpackConfig);

    before((done) => {
      webpack(config, () => {
        indexHtmlString = fs.readFileSync(`${buildDirectory}/index.html`, { encoding: 'utf8' });
        indexHtmlDom = new JSDOM(indexHtmlString);
        
        done();
      });
    });

    it('should generate the expected critical inline <style> tag', () => {
      const inlineStyleTags = indexHtmlDom.window.document.querySelectorAll('style');

      assert.equal(inlineStyleTags.length, 1);
      assert.equal(inlineStyleTags[0].getAttribute('type'), 'text/css');
    });
  });

});