var expect = require('chai').expect;
var loadFileToSTring = require('./test-utils').loadFileToSTring;

var Promise = require('bluebird');
var promisify = Promise.promisify;
var parseString = require('xml2js').parseString;
var parseXMLString = promisify(parseString);

var rssSpec = require('rss-spec');
var ContentChild = rssSpec.ContentChild;
var RSSItem = rssSpec.RSSItem;
var RSSFeed = rssSpec.RSSFeed;

var RssXmlTransformer = require('../dist').default;

describe('RssXmlTransformer', function() {
  var transformer;

  before(function() {
    transformer = new RssXmlTransformer();
  });

  describe('rssItemFromXMLObject', function() {
    var simpleItemFileName = './test-data/sample-item-1.xml';
    var exhaustiveItemFileName = './test-data/sample-item-2.xml';

    describe('required fields', function() {
      it('should have expected values filled and undefined for optional', (done) =>
        new Promise((resolve, reject) => {
          var xmlSampleData = loadFileToSTring(simpleItemFileName);
          return parseXMLString(xmlSampleData, RssXmlTransformer.defaultXMLParseOptions)
            .then((wrapped) => wrapped.item)
            .then(transformer.rssItemFromXMLObject)
            .then((item) => {
              expect(item).to.be.instanceof(RSSItem);
              expect(item).to.have.property('description').that.is.an.instanceof(ContentChild);
              expect(item).to.have.property('title').that.is.an.instanceof(ContentChild);
              for(var key of Object.keys(item)) {
                if (key !== 'title' && key !== 'description') {
                  expect(item[key]).to.be.undefined;
                }
              }
            })
            .then(resolve).catch(reject);
        }).then(done).catch(done)
      );

      it('should throw error on invalid input');
    });

    describe('optional fields', function() {
      it('should have no undefined values for spec defined fields', (done) =>
        new Promise((resolve, reject) => {
          var xmlSampleData = loadFileToSTring(exhaustiveItemFileName);
          return parseXMLString(xmlSampleData, RssXmlTransformer.defaultXMLParseOptions)
            .then((wrapped) => wrapped.item)
            .then(transformer.rssItemFromXMLObject)
            .then((item) => {
              expect(item).to.be.instanceof(RSSItem);
              for(var key of Object.keys(item)) {
                expect(item[key]).to.not.equal(undefined, key);
              }
            })
            .then(resolve).catch(reject);
        }).then(done).catch(done)
      );

      it('should list invalid input and have undefined for fields that had bad data');
    });
  });

  describe('transformFromString', function() {
    var simpleFeedFileName = './test-data/sample-feed-1.xml';
    var exhaustiveFeedFileName = './test-data/sample-feed-2.xml';

    describe('required fields', function() {
      it('should have expected values filled and undefined for optional', (done) =>
        new Promise((resolve, reject) => {
          var xmlSampleData = loadFileToSTring(simpleFeedFileName);
          return transformer.transformFromString(xmlSampleData)
            .then((feed) => {
              expect(feed).to.be.an.instanceof(RSSFeed);
              expect(feed).to.have.property('description').that.is.an.instanceof(ContentChild);
              expect(feed).to.have.property('title').that.is.an.instanceof(ContentChild);
              expect(feed).to.have.property('link').that.is.an.instanceof(ContentChild);
              expect(feed).to.have.property('items').that.is.an.instanceof(Set);
              expect(feed).to.have.property('skipHours').that.is.an.instanceof(Set);
              expect(feed).to.have.property('skipDays').that.is.an.instanceof(Set);
              var requiredKeys = new Set(['title', 'description', 'link', 'items', 'skipHours', 'skipDays']);
              for(var key of Object.keys(feed)) {
                if (!requiredKeys.has(key)) {
                  expect(feed[key]).to.be.undefined;
                }
              }
            })
            .then(resolve).catch(reject);
        }).then(done).catch(done)
      );
    });

    describe('optional fields', function() {
      it('should have no undefined values for spec defined fields', (done) =>
        new Promise((resolve, reject) => {
          var xmlSampleData = loadFileToSTring(exhaustiveFeedFileName);
          return transformer.transformFromString(xmlSampleData)
            .then((feed) => {
              expect(feed).to.be.an.instanceof(RSSFeed);
              for(var key of Object.keys(feed)) {
                expect(feed[key]).to.not.equal(undefined, key);
              }
              expect(feed).to.have.property('skipHours').that.is.an.instanceof(Set);
              expect(feed.skipHours.size).to.be.above(0);
              expect(feed).to.have.property('skipDays').that.is.an.instanceof(Set);
              expect(feed.skipDays.size).to.be.above(0);
            })
            .then(resolve).catch(reject);
        }).then(done).catch(done)
      );
    });

    it('should list invalid optional fields');
    it('should list additional fields and attributes used');
    it('should throw exception for invalid required fields');
    it('should use first value of duplicate single element');
  });
});
