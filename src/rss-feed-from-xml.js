import Promise, { promisify } from 'bluebird';
import { RSSCategory, RSSCloud, RSSEnclosure, RSSFeed, RSSImage, RSSItem } from 'rss-spec';
import { parseString } from 'xml2js';

import RssXmlTransformerError from './RssXmlTransformerError.js';
import { stripSingleItemArrayFromXMLObject } from './util';

const parseXMLString = promisify(parseString);

type GenerateGUIDType = (obj: RSSCategory | RSSCloud | RSSEnclosure | RSSFeed | RSSImage | RSSItem, classType: string) => string;

function rssItemFromXMLObject(generateGUID: GenerateGUIDType, itemData: any): string {
  const { category, enclosure, ...feedItem } = itemData;

  if (category && category.length > 0) {
    const itemCategoryObject = RSSCategory.fromObject(stripSingleItemArrayFromXMLObject(category[0]));
    feedItem.category = generateGUID(itemCategoryObject, RSSCategory.name);
  }

  if (enclosure && enclosure.length > 0) {
    const itemEnclosureObject = RSSEnclosure.fromObject(stripSingleItemArrayFromXMLObject(enclosure[0]));
    feedItem.enclosure = generateGUID(itemEnclosureObject, RSSEnclosure.name);
  }

  const feedItemObject = RSSItem.fromObject(stripSingleItemArrayFromXMLObject(feedItem));

  return generateGUID(feedItemObject, RSSItem.name);
}

export default class RssXmlTransformer {
  constructor(generateGUID: GenerateGUIDType) {
    if (! generateGUID || typeof generateGUID !== 'function') {
      throw new RssXmlTransformerError('Invalid GUID function');
    }
    this.generateGUID = generateGUID;
  }

  transformFromString(xml: string) : Promise<string> {
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
          const categoryObject = RSSCategory.fromObject(stripSingleItemArrayFromXMLObject(category[0]));
          feedData.category = this.generateGUID(categoryObject, RSSCategory.name);
        }

        if (cloud && cloud.length > 0) {
          const cloudObject = RSSCloud.fromObject(stripSingleItemArrayFromXMLObject(cloud[0]));
          feedData.cloud = this.generateGUID(cloudObject, RSSCloud.name);
        }

        if (image && image.length > 0) {
          const imageObject = RSSImage.fromObject(stripSingleItemArrayFromXMLObject(image[0]));
          feedData.image = this.generateGUID(imageObject, RSSImage.name);
        }

        feedData.version = xmlObj.rss.$.version;
        feedData.items = new Set([]);
        [].concat(item || [])
          .map(rssItemFromXMLObject.bind(null, this.generateGUID))
          .forEach((rssItem: any) => {
            feedData.items.add(rssItem);
          });

        const feedObject = RSSFeed.fromObject(feedData);

        return this.generateGUID(feedObject, RSSFeed.name);
      });
  }
}
