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

        return this.rssFeedFromXMLObject(xmlObj.rss);
      });
  }

  // TODO: check against multiple instances of single field
  // TODO: report unknown attributes

  rssFeedFromXMLObject(rssData: Object) : RSSFeed {
    const { category, cloud, image, item, skipDays, skipHours, ...feedData } = rssData.channel;

    Object.keys(feedData).forEach((key) => {
      feedData[key] = new ContentChild(feedData[key]);
    });

    feedData.category = category && this.martialType(category, RSSCategory);

    feedData.cloud = cloud && RSSCloud.fromObject(cloud.$ || {});
    feedData.image = image && RSSImage.fromObject(image);

    if (rssData.$) {
      feedData.version = rssData.$.version;
    }

    feedData.items = new Set([]);
    [].concat(item || [])
      .map(this.rssItemFromXMLObject)
      .forEach((rssItem: RSSItem) => {
        feedData.items.add(rssItem);
      });

    feedData.skipDays = new Set([]);
    if (skipDays && skipDays.day) {
      skipDays.day.forEach((day: string) => {
        feedData.skipDays.add(day);
      });
    }

    feedData.skipHours = new Set([]);
    if (skipHours && skipHours.hour) {
      skipHours.hour.forEach((hour: number) => {
        feedData.skipHours.add(hour);
      });
    }

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
