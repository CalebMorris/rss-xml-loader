import Promise, { promisify } from 'bluebird';
import { ContentChild, RSSCategory, RSSCloud, RSSEnclosure, RSSFeed, RSSImage, RSSItem, RSSGuid, RSSSource } from 'rss-spec';
import { parseString } from 'xml2js';

const parseXMLString = promisify(parseString);

export default class RssXmlTransformer {
  constructor() {
    this.rssFeedFromXMLObject = this.rssFeedFromXMLObject.bind(this);
    this.rssItemFromXMLObject = this.rssItemFromXMLObject.bind(this);
    this.transformFromString = this.transformFromString.bind(this);
  }

  static get defaultXMLParseOptions() {
    return { trim: true, explicitArray: false };
  }

  transformFromString(xml: string) : Promise<string> {
    return parseXMLString(xml, RssXmlTransformer.defaultXMLParseOptions)
      .then((xmlObj: any): string => {
        if (
          !xmlObj || !xmlObj.rss ||
          !xmlObj.rss.channel || !xmlObj.rss.channel.length === 0
        ) {
          // TODO: Bubble parse failures
          return null;
        }

        return this.rssFeedFromXMLObject(xmlObj.rss.channel);
      });
  }

  rssFeedFromXMLObject(channelData: Object) : RSSFeed {
    const { category, cloud, image, item, ...feedData } = channelData;

    // TODO: May not need length check
    if (category && category.length > 0) {
      feedData.category = RSSCategory.fromObject(category);
    }

    // TODO: May not need length check
    if (cloud && cloud.length > 0) {
      feedData.cloud = RSSCloud.fromObject(cloud);
    }

    // TODO: May not need length check
    if (image && image.length > 0) {
      feedData.image = RSSImage.fromObject(image);
    }

    feedData.version = xmlObj.rss.$.version;
    feedData.items = new Set([]);
    [].concat(item || [])
      .map(rssItemFromXMLObject)
      .forEach((rssItem: RSSItem) => {
        feedData.items.add(rssItem);
      });

    return RSSFeed.fromObject(feedData);
  }

  rssItemFromXMLObject(itemData: Object): RSSItem {
    const { category, enclosure, guid, source, ...feedItem } = itemData;

    Object.keys(feedItem).forEach((key) => {
      feedItem[key] = new ContentChild(feedItem[key]);
    });

    feedItem.enclosure = enclosure && RSSEnclosure.fromObject(enclosure.$ || {});

    feedItem.category = category && this.martialType(category, RSSCategory);
    feedItem.guid = guid && this.martialType(guid, RSSGuid);
    feedItem.source = source && this.martialType(source, RSSSource);

    return RSSItem.fromObject(feedItem);
  }

  martialType(data: Object, constructor: (dataObject: Object) => ContentChild) {
    return constructor.fromObject({
      content: data._,
      ...data.$ || {},
    });
  }
}
