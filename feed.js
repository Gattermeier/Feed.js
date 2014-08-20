// feed.js v.0.1 beta

// feed.js handles several RSS feeds using the Google Feed API and Twitter bootstrap
// The features include: mergin multiple RSS feeds, sort them by date, plus create a bootstrap based tab menu to display single feeds separately.

// Adding a new feed is simple. add a feed URL and a title to the Array.
// Feed Menu. You will need an element with ID "FeedMenu" where feed.js can append menu entries <li>
// Feed Pane. You will need an element with ID "FeedPane" to which feed.js can connect appended menu entries with to display content

// (c) Matthias Gattermeier

  google.load("feeds", "1");

  
    var feeds = 
[ ['URL','Title'],
  ['URL','Title'],
  ['URL','Title'],
  ['URL','Title']];
  



  // create the feed URLs from the subdomains / region ideintifiers -- NEW
  function createFeedURLs(callback) {
       var feed_list = new Array();
       for (var i = 0; i < feeds.length; i++) {
              feed_list[i] = feeds[i][0];
              };
       callback(feed_list);
       }
  
  // sort and display all feeds
  function sortanddisplay(feedsArray) {
       var html='';
       var container = document.getElementById("all_feeds"); // define here the element ID that should get the feeds content

       //sort the feed 
       feedsArray.sort();
       feedsArray.reverse();

       for (var j = 0; j < feedsArray.length;  j++) {
         
         // Format according to date and other date & time related stuff
         var publishing_date = new Date(feedsArray[j][2]).toDateString();
         var date_calc = new Date(feedsArray[j][2]).setHours(0,0,0,0); // we gotta set all time values to zero if we want a useful comparison between post dates
         if (j > 0 ) {
           var date_calc_2 = new Date(feedsArray[j-1][2]).setHours(0,0,0,0);
           if (date_calc != date_calc_2 ) {
           html += "<span class='date'><h3>" + publishing_date + "</h3></span>";
         }} else {
           html += '<span class="date"><h3>' + publishing_date + '</h3></span>';
         }
         
         // Write the entries into html
         html += '<div class="feed-entry entry-'+j+' entry-'+feedsArray[j][5]+'">'; // .create entry
         html += '<h4>['+feedsArray[j][5]+'] <a href="'+feedsArray[j][1]+'" target="_blank">'+feedsArray[j][4]+'</a></h4>' //title and link to the orignal post
         html += '<span class="content-snippet">'+feedsArray[j][3] +'</span> <a href="'+feedsArray[j][1]+'" target="_blank" class="read-more">Read more.</a><br><!--<span class="publising-region">Published by: <a href="http://'+feedsArray[j][5]+'.adl.org'+'" target="_blank">'+feedsArray[j][5]+'</a></span>-->'; // additional info
         html += '</div>'; // .close entry
         
         // output all feeds
         container.innerHTML = html;
         }
       }


  // this is the main loop!
    function main_loop(feed_list){
        
        // define variables
        var feedsArray = new Array(); // thats where we save ALL feed data
        var feed_entry_number = 5; // number of entires per feed to load
        var count = feed_list.length;
        var html='';
        
         // read all feeds   
        for (var j=0; j<feed_list.length; j++) {
            
            var feed = new google.feeds.Feed(feed_list[j]);
            feed.setNumEntries(feed_entry_number); // set number of entires per feed to load
            feed.setResultFormat(google.feeds.Feed.JSON_FORMAT); // we like JSON for this
            
            //load individual feed into array
            feed.load(function(result) {
              if (!result.error) {
                for (var i = 0; i < result.feed.entries.length; i++) {
                  var entry = result.feed.entries[i];
                  var attributes = ["title", "link", "publishedDate", "contentSnippet"]; // select feed attributes (check Google Feed API)
                  var feed_number = feedsArray.length;
                  
                  // write selected feed content plus additional feed information into our catch all array
                  feedsArray[feed_number] = new Array();
                  feedsArray[feed_number][0] = Date.parse(entry[attributes[2]]); // phrase the pulishing date for later sorting
                  feedsArray[feed_number][1] = entry[attributes[1]]; // link attribute
                  feedsArray[feed_number][2] = entry[attributes[2]]; // publishedDate attribute
                  feedsArray[feed_number][3] = entry[attributes[3]]; // contentSnippet attribute
                  feedsArray[feed_number][4] = entry[attributes[0]]; // title attribute
                  feedsArray[feed_number][5] = result.feed.title; // Title of the feed 
                  feedsArray[feed_number][6] = feed.feedUrl; // Feed URL
                }
              }
        
        // sort and display ALL feeds
       
              count--;
              if (count == 0) {
                     sortanddisplay(feedsArray);
                     }
            }); // .load individual feed into array
            
        } // .read feeds
    }; // .main loop
   


   // Create the menu entries for each individual feed 
   function createFeedMenu(){
       i=0;
       $.each(feeds, function( index, value ) {
          var entry = feeds[index];
          html = '<li><a href="#entry-'+i+'-section" onclick="createSingleFeeds(&#039;'+entry[0]+'&#039;, &#039;entry-'+i+'&#039;)">'+entry[1]+'</a></li>';
          i++;
          $( "#FeedMenu" ).append(html);
       });
   }
   
   // Create the tab panes for each individual feeds to display
   function createFeedPane(){
       i = 0;
       $.each(feeds, function( index, value ) {
          var entry = feeds[index];
          html ='<div class="tab-pane" id="entry-'+i+'-section"><h2>'+entry[1]+'</h2><div id="entry-'+i+'"></div></div>';
          i++;
          $( "#FeedPane" ).append(html);
       });
   }
   
  // create individual feed listenings -- NEW
  function createSingleFeeds(singlefeedURL, entry_no){
       var singlefeed = new google.feeds.Feed(singlefeedURL);
       singlefeed.setNumEntries(10); // set number of entires per feed to load
       singlefeed.setResultFormat(google.feeds.Feed.JSON_FORMAT); // we like JSON for this
       singlefeed.load(function(result) {
              if (!result.error) {
                     var content = document.getElementById(entry_no);
                     var html = '';
              for (var i = 0; i < result.feed.entries.length; i++) {
                     var entry = result.feed.entries[i];
                     html += '<div class="feed-entry entry-'+i+'"><p><b>'+entry.publishedDate+'</b>: <a href="' + entry.link + '">' + entry.title + '</a><br><i>'+entry.contentSnippet+'</i></p></div>';
                     }
                     content.innerHTML = html;
              }
       });
  }
   
   
   // here we go ...
  function initialize(createMenu, order, sortby, singleFeedView, multiFeedView, singleFeedNumber, multiFeedNumber, singleFeedOnly) { // order not yet implemented, but would be nice if it can be sorted ascending and descending
    createFeedMenu();
    createFeedPane(); 
    createFeedURLs( function (feed_list) {
       main_loop(feed_list); 
    });
  }
  
  
  
  