import { expect } from 'chai';
import { loadFileToSTring } from './test-utils';

import Promise, { promisify } from 'bluebird';
import { parseString } from 'xml2js';
const parseXMLString = promisify(parseString);

import { RSSItem } from 'rss-spec';
import RssXmlTransformer from '../src/rss-feed-from-xml';


describe('RssXmlTransformer', () => {
  let transformer;

  before(() => {
    transformer = new RssXmlTransformer();
  });

  describe('rssItemFromXMLObject', () => {
    const simpleItemFileName = './test-data/sample-item-1.xml';

    describe('required fields', () => {
      it('should have expected values filled and undefined for optional', (done) =>
        new Promise((resolve, reject) => {
          const xmlSampleData = loadFileToSTring(simpleItemFileName);
          return parseXMLString(xmlSampleData, RssXmlTransformer.defaultXMLParseOptions)
            .then((wrapped) => wrapped.item)
            .then(transformer.rssItemFromXMLObject)
            .then((feed) => {
              expect(feed).to.be.an.instanceof(RSSItem);
            })
            .then(resolve).catch(reject);
        }).then(done).catch(done)
      );

      it('should throw error on invalid input');
    });

    describe('optional fields', () => {
      it('should have no undefined values for spec defined fields');

      it('should list invalid input and have undefined for fields that had bad data');
    });
  });
});
