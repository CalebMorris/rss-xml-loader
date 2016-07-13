/* eslint no-param-reassign: 0 */

import { RSSCategory, RSSCloud, RSSEnclosure, RSSFeed, RSSImage, RSSItem } from 'rss-spec';
import { parseString } from 'xml2js';

import Promise, { promisify } from 'bluebird';
import getContentStorage from '../../state/base/content-storage';

const storage = getContentStorage();
const parseXMLString = promisify(parseString);

function stripArrayFromXMLObject(nodeData: any): any {
  if (nodeData && typeof nodeData === 'object') {
    Object.keys(nodeData).forEach((key: string) => {
      if (Array.isArray(nodeData) && nodeData.length > 0) {
        nodeData[key] = stripArrayFromXMLObject(nodeData[0]);
      }
    });
  }
  return nodeData;
}

function rssItemFromXMLObject(itemData: any): string {
  const { category, enclosure, ...feedItem } = itemData;

  if (category && category.length > 0) {
    const itemCategoryObject = RSSCategory.fromObject(stripArrayFromXMLObject(category[0]));
    storage.setItem(itemCategoryObject);
    feedItem.category = itemCategoryObject.hash;
  }

  if (enclosure && enclosure.length > 0) {
    const itemEnclosureObject = RSSEnclosure.fromObject(stripArrayFromXMLObject(enclosure[0]));
    storage.setItem(itemEnclosureObject);
    feedItem.enclosure = itemEnclosureObject.hash;
  }

  const feedItemObject = RSSItem.fromObject(stripArrayFromXMLObject(feedItem));
  storage.setItem(feedItemObject);

  return feedItemObject.hash;
}

export default function rssFeedFromXml(xml: string): Promise<string> {
  return parseXMLString(xml, { trim: true })
    .then((xmlObj: any): string => {
      if (
        !xmlObj || !xmlObj.rss ||
        !xmlObj.rss.channel || !xmlObj.rss.channel.length === 0
      ) {
        // TODO: Bubble parse failures
        return null;
      }

      const { category, cloud, image, item, ...feedData } = xmlObj.rss.channel[0];

      if (category && category.length > 0) {
        const categoryObject = RSSCategory.fromObject(stripArrayFromXMLObject(category[0]));
        storage.setItem(categoryObject);
        feedData.category = categoryObject.hash;
      }

      if (cloud && cloud.length > 0) {
        const cloudObject = RSSCloud.fromObject(stripArrayFromXMLObject(cloud[0]));
        storage.setItem(cloudObject);
        feedData.cloud = cloudObject.hash;
      }

      if (image && image.length > 0) {
        const imageObject = RSSImage.fromObject(stripArrayFromXMLObject(image[0]));
        storage.setItem(imageObject);
        feedData.image = imageObject.hash;
      }

      feedData.version = xmlObj.rss.$.version;
      feedData.items = new Set([]);
      [].concat(item || []).map(rssItemFromXMLObject).forEach((rssItem: any) => {
        feedData.items.add(rssItem);
      });

      const feedObject = RSSFeed.fromObject(feedData);
      storage.setItem(feedObject);

      return feedObject.hash;
    });
}
