# RSS XML Loader
A set of simple methods to transform an RSS Feed XML string to [rss-spec](https://www.npmjs.com/package/rss-spec) objects.

## Example

See `examples` folder.

```
var RssXmlTransformer = require('../dist/').default;
var feedString = '<?xml version="1.0"?>' +
'<rss>' +
'  <channel>' +
'    <title>RssXmlTransformer Sample Feed</title>' +
'    <description>Description</description>' +
'    <link>http://www.example.com/</link>' +
'  </channel>' +
'</rss>';
var transformer = new RssXmlTransformer();
transformer.transformFromString(feedString)
  .then(function(rssFeed) {
    console.dir(rssFeed);
  })
  .catch(function(err) {
    console.log('Error', err);
  });
```

## TODO
- `rss-spec` to XML
- Strict and passive modes. Simply lists oddities or malphormed sections, but doesn't halt execution with an error.
