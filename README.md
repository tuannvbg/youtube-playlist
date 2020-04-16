<p id="youtube-screen"><img src="https://pakjiddat.netlify.app/static/1f55fabadcd6a9195596f8b57476f9a8/8c557/youtube-playlist.png" alt="YouTube Playlist"/></p>

<h3>Introduction</h3>
<p>The YouTube Playlist is dervied from the <a href='http://mediaelementjs.com/'>MediaElement player</a>. It allows YouTube videos to be displayed in a playlist.</p>

<h3>Features</h3>
<div><ul>
  <li>Allows playlist information to be loaded from xml file</li>
  <li>Allows video quality to be set</li>
  <li>Provides option for sharing video on social networks</li>
  <li>The start and end time for each YouTube video can be specified in xml file. It allows uncessary parts of the YouTube video to be excluded</li>
  <li>Allows switching to next and previous tracks</li>
  <li>Provides a loop option for playing a track repeatedly</li>
  <li>Provides a shuffle option for playing a random track</li>
  <li>Can be used under the terms and conditions of the <a href='https://github.com/mediaelement/mediaelement/blob/master/LICENSE'>Media Element Player license</a></li>
</ul></div>

<h3>Development of the player</h3>
<p>The YouTube Playlist was developed by modifying the MediaElement <a href='https://github.com/mediaelement/mediaelement-plugins/blob/master/docs/playlist.md'>Playlist plugin</a> and the <a href='https://github.com/mediaelement/mediaelement-plugins/blob/master/docs/quality.md'>Quality plugin</a>. Minor changes to the MediaElement Player were also made. The article <a href='https://xparkmedia.com/blog/mediaelements-add-a-share-button-to-video-elements-using-jquery/'>Mediaelements: Add a share button to video elements using jQuery</a> was used to add Social Sharing buttons to the player. The player also uses the <a href='http://manos.malihu.gr/jquery-thumbnail-scroller/'>jQuery thumbnail scroller</a> library for the scrollable playlist.</p>

<h3>Installation</h3>
<p>Download the source code by running the command: <b>git clone https://github.com/nadirlc/youtube-playlist.git</b>. Place the source code in a virtual host directory, so that the <b>index.html</b> file is served by a web server. Navigate to the index.html file in a browser. You should see this <a href='#youtube-screen'>screen</a></p>
