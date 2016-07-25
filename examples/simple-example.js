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
