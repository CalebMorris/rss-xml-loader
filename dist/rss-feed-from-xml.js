'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _rssSpec = require('rss-spec');

var _xml2js = require('xml2js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parseXMLString = (0, _bluebird.promisify)(_xml2js.parseString);

var RssXmlTransformer = function () {
  function RssXmlTransformer() {
    _classCallCheck(this, RssXmlTransformer);

    this.rssFeedFromXMLObject = this.rssFeedFromXMLObject.bind(this);
    this.rssItemFromXMLObject = this.rssItemFromXMLObject.bind(this);
    this.transformFromString = this.transformFromString.bind(this);
  }

  _createClass(RssXmlTransformer, [{
    key: 'transformFromString',
    value: function transformFromString(xml) {
      var _this = this;

      return parseXMLString(xml, RssXmlTransformer.defaultXMLParseOptions).then(function (xmlObj) {
        if (!xmlObj || !xmlObj.rss || !xmlObj.rss.channel || !xmlObj.rss.channel.length === 0) {
          // TODO: Bubble parse failures
          return null;
        }

        return _this.rssFeedFromXMLObject(xmlObj.rss);
      });
    }

    // TODO: check against multiple instances of single field
    // TODO: report unknown attributes

  }, {
    key: 'rssFeedFromXMLObject',
    value: function rssFeedFromXMLObject(rssData) {
      var _rssData$channel = rssData.channel;
      var category = _rssData$channel.category;
      var cloud = _rssData$channel.cloud;
      var image = _rssData$channel.image;
      var item = _rssData$channel.item;
      var skipDays = _rssData$channel.skipDays;
      var skipHours = _rssData$channel.skipHours;

      var feedData = _objectWithoutProperties(_rssData$channel, ['category', 'cloud', 'image', 'item', 'skipDays', 'skipHours']);

      Object.keys(feedData).forEach(function (key) {
        feedData[key] = new _rssSpec.ContentChild(feedData[key]);
      });

      feedData.category = category && this.martialType(category, _rssSpec.RSSCategory);

      feedData.cloud = cloud && _rssSpec.RSSCloud.fromObject(cloud.$ || {});
      feedData.image = image && _rssSpec.RSSImage.fromObject(image);

      if (rssData.$) {
        feedData.version = rssData.$.version;
      }

      feedData.items = new Set([]);
      [].concat(item || []).map(this.rssItemFromXMLObject).forEach(function (rssItem) {
        feedData.items.add(rssItem);
      });

      feedData.skipDays = new Set([]);
      if (skipDays && skipDays.day) {
        skipDays.day.forEach(function (day) {
          feedData.skipDays.add(day);
        });
      }

      feedData.skipHours = new Set([]);
      if (skipHours && skipHours.hour) {
        skipHours.hour.forEach(function (hour) {
          feedData.skipHours.add(hour);
        });
      }

      return _rssSpec.RSSFeed.fromObject(feedData);
    }
  }, {
    key: 'rssItemFromXMLObject',
    value: function rssItemFromXMLObject(itemData) {
      var category = itemData.category;
      var enclosure = itemData.enclosure;
      var guid = itemData.guid;
      var source = itemData.source;

      var feedItem = _objectWithoutProperties(itemData, ['category', 'enclosure', 'guid', 'source']);

      Object.keys(feedItem).forEach(function (key) {
        feedItem[key] = new _rssSpec.ContentChild(feedItem[key]);
      });

      feedItem.enclosure = enclosure && _rssSpec.RSSEnclosure.fromObject(enclosure.$ || {});

      feedItem.category = category && this.martialType(category, _rssSpec.RSSCategory);
      feedItem.guid = guid && this.martialType(guid, _rssSpec.RSSGuid);
      feedItem.source = source && this.martialType(source, _rssSpec.RSSSource);

      return _rssSpec.RSSItem.fromObject(feedItem);
    }
  }, {
    key: 'martialType',
    value: function martialType(data, constructor) {
      return constructor.fromObject(_extends({
        content: data._
      }, data.$ || {}));
    }
  }], [{
    key: 'defaultXMLParseOptions',
    get: function get() {
      return { trim: true, explicitArray: false };
    }
  }]);

  return RssXmlTransformer;
}();

exports.default = RssXmlTransformer;