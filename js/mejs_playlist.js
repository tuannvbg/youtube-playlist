/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

mejs.i18n.en['mejs.playlist'] = 'Toggle Playlist';
mejs.i18n.en['mejs.playlist-prev'] = 'Previous';
mejs.i18n.en['mejs.playlist-next'] = 'Next';
mejs.i18n.en['mejs.playlist-loop'] = 'Loop';
mejs.i18n.en['mejs.playlist-shuffle'] = 'Shuffle';

Object.assign(mejs.MepDefaults, {
	/** The list of playlist items */
	playlist: [],
	/** Indicates if the play list should be shown */
	showPlaylist: true,
	/** Indicates if the playlist should auto close while the video is playing */
	autoClosePlaylist: false,
	/** The title of the previous playlist item button */
	prevText: null,
	/** The title of the next playlist item button */
	nextText: null,
	/** The title of the playlist loop button */
	loopText: null,
	/** The title of the playlist shuffle button */
	shuffleText: null,
	/** The title of the playlist button used to toggle the playlist */
	playlistTitle: null,
	/** The number of ads that have been played */
	ad_count: 0,
	/** The number of tracks that have been played */
	tracks_played: 0,
	/** Indicates if the page has been loaded */
	is_page_loaded: false,
	/** Indicates if the loop button should show */
	loop: false,
	/** Indicates if the shuffle button should show */	
	shuffle: false
});

Object.assign(MediaElementPlayer.prototype, {
	/** Used to build the playlist */
	buildplaylist: function buildplaylist(player, controls, layers, media) {

		/** If the page has not yet loaded, then the function returns */
		if (!player.options.is_page_loaded) return;

		/** The title of the button used to toggle the playlist */
		var defaultPlaylistTitle = mejs.i18n.t('mejs.playlist');
		var playlistTitle = mejs.Utils.isString(player.options.playlistTitle) ? player.options.playlistTitle : defaultPlaylistTitle;

		/** The playlist html is created. If the playlist items are empty, then the function returns */
		if (player.createPlayList_()) {
			return;
		}
		/** The index of the currently playing item */
		player.currentPlaylistItem   = 0;
		/** The z-index of the control bar */
		player.originalControlsIndex = controls.style.zIndex;
		/** The z-index of the control bar is set */
		controls.style.zIndex        = 5;

		/** The function to call when the a track has finished playing */
		player.endedCallback = function () {
		    /** The poster for the track is set to the default blank poster */	
		    player.setPoster(window.youtube.default_poster);
		
			/** If the video ended less than 5 sec ago, then it is assumed that the end event miss fired and the function returns */
			if (player.isvideoended()) return;
            
            /** The player is paused */
            player.pause();
            /** The current time is set to the player end time */
		    player.setCurrentTime(window.youtube.end);
		    
			/** If the track that ended is not the last track */
			if ((player.currentPlaylistItem+1) < player.listItems.length) {
				/** The next track is started */
				player.playtrack(player.currentPlaylistItem, "ended");
			}
			/** If the last track finished playing, then the playlist is scrolled to the first track, without playing the track */
			else {
				/** The index of the currently playing item is set to 0 */
				player.currentPlaylistItem   = 0;
				/** The first track is loaded without playing it. The quality menu is reloaded, since each video can have a different quality */
				player.playitem(false, true);
			}
		};

		/** The function to call at every interval of the playback */
		player.timeupdateCallback = function () {

			/** The current play time */
			var current_time    = player.getCurrentTime();
			/** If the current play time is more than 5 sec and the current play time is more than the end time of the video and the last video played was a YouTube video (and not an ad), then the video is ended and the end callback function is called */
			if (current_time > 5 && current_time >= (window.youtube.end) && window.youtube.current_url.indexOf("youtube") > 0) {		
				/** The player is stopped */
				player.endedCallback();
			}		
			
			/** If the player and quality have not been set, then they are set */
			if (!window.youtube.is_quality_set) {
				/** The video quality is marked as set */
				window.youtube.is_quality_set = true;
				/** The quality levels available for the current video are fetched */
				player.media.getAvailableQualityLevels();
				player.buildquality(player, player.controls, player.layers, player.media);

			}		
		};

		/** The event listener is registered for handling the ending of the video */
		media.addEventListener('ended', player.endedCallback);
		/** The event listener is registered for handling each playback interval */
		media.addEventListener('timeupdate', player.timeupdateCallback);
		
		/** If the playlist needs to be shown */
		if (player.options.showPlaylist) {
			/** The container div tag is created for the playlist */
			player.playlistLayer = document.createElement('div');
			/** The css class name is set */
			player.playlistLayer.className = player.options.classPrefix + 'playlist-layer  ' + player.options.classPrefix + 'layer ' + player.options.classPrefix + 'playlist-selector';
			/** The outer list tag for the playlist is set */
			player.playlistLayer.innerHTML = '<div class="ListItems" style="position:inherit;"><div id="list" class="content"><br/><br/><ul class="' + player.options.classPrefix + 'playlist-selector-list"></ul></div></div>';
			/** The outer media element tag is fetched */			
			var media_element = document.getElementsByClassName('media-wrapper')[0];
			/** The playlist layer is appended as child html of the media element tag */
			media_element.appendChild(player.playlistLayer);

			/** Each playlist item is added to the playlist */
			for (var i = 0, total = player.listItems.length; i < total; i++) {
				/** The list item is added to the outer list tag */
				player.playlistLayer.querySelector('ul').innerHTML += player.listItems[i];
			}
			/** The thumbnail scroller is initialised */
			$("#list").mThumbnailScroller({
				type : "click-50",
				theme : "buttons-in"
			});
		 
		 	/** Indicates that the ad has been loaded */
		 	//window.youtube.adloaded = true;
		 	/** The vast add url is set */
 			//player.vastSetAdTagUrl(window.vastAdTagUrl);
 			/** The vast ad structure is parsed */
			//player.buildvast(player.player, player.controls, player.layers, player.media);
			/** The first ad in the vast xml is loaded */
			//player.load();
			/** The first track in the playlist is highlighted */
			//player.highlighttrack(1);	
			
			/** If the video should auto play, then it is played */
			if (window.youtube.is_auto_play) { 
				/** The first track is loaded and played without building the quality menu since it has already been built */			
				player.playitem(true, true);
			}
			else {
				/** The first track is loaded without playing the track and without building the quality menu since it has already been built */
				player.playitem(false, true);
			}
			
			/** The event handler for handling the key press */
			player.keydownCallback = function (e) {
				var event = mejs.Utils.createEvent('click', e.target);
				e.target.dispatchEvent(event);
				return false;
			};

			/** The event handler for handling the key press is registered */
			player.playlistLayer.addEventListener('keydown', function (e) {
				var keyCode = e.which || e.keyCode || 0;
				if (~[13, 32, 38, 40].indexOf(keyCode)) {
					player.keydownCallback(e);
				}
			});
		} 
		/** If the playlist should not be shown */
		else {
			mejs.Utils.addClass(player.container, player.options.classPrefix + 'no-playlist');
		}
	},
	/** Used to remove the callback for handling track end event */
	cleanplaylist: function cleanplaylist(player, controls, layers, media) {
		media.removeEventListener('ended', player.endedCallback);
	},
	/** Used to highlight the playlist item at the given index */
	highlighttrack: function highlighttrack(index) {
		/** The player instance */
		var player      = window.player;
		/** The playlist item index */
		var track_index = index;
		/** If the index is empty, then it is set to the current playlist item index */
		if (index == "") track_index = player.currentPlaylistItem;
		
		/** Each playlist item is checked */
		for (count = 1; count <= player.playlist.length; count++) {
			/** If the playlist item is not same as the playlist item to be highlighted, then the playlist item is deselected */
			if (count != track_index) document.getElementById("track-" + count).style.border="none";
			/** If the playlist item is same as the playlist item to be highlighted, then the playlist item is selected */
			else document.getElementById("track-" + count).style.border="1px solid red";
		}
		/** The title of the current playlist item is fetched */		
		var title = document.getElementById("track-title-" + track_index).getAttribute("title");
		
		/** If the current playlist item index is more than 2, then it is decreased by 1, 
		   since the playlist look better if it is scrolled to an item which is before the selected item */
		if (track_index > 2) track_index--;
		
		/** The playlist item is scroll to the given index */
		$("#list").mThumbnailScroller("scrollTo","#track-" + (track_index));
		
		/** The title of the current item is set */
		document.getElementsByTagName("video")[0].setAttribute("title", title);
	},
	/** Used to show an ad */
	showad: function showad() {
		/** The start time of the ad is set to empty */
		window.youtube.start        = null;
		/** The end time of the ad is set to empty */		
		window.youtube.end          = null;
		/** The vast xml is parsed. This is required before playing each track */
		player.buildvast(player.player, player.controls, player.layers, player.media);
		/** The vast ad index is set */
	   	player.options.indexPreroll = (player.options.ad_count < player.options.adsPrerollMediaUrl.length) ? player.options.ad_count : (player.options.ad_count-1);
	   	/** It is indicated that the ads player has started */
	   	player.adsPlayerHasStarted  = true;
	   	/** The ads preroll is started */
	   	player.adsStartPreroll();
	   	/** The current track is highlighted */
		player.highlighttrack((player.currentPlaylistItem+1));		
		/** The current url of the ad is set */
		window.youtube.current_url  = player.getSrc();
	},
	/** 
	 * Used to check if the end event has already been signalled
	 *
	 * It checks the last time at which the end event was called
	 * If the last time at which the end event was called is more than 5 sec, then function returns true
	 * Otherwise, the function returns false
	 *
	 * @return boolean is_ended indicates if the current video has already ended
	 */
	isvideoended: function isvideoended() {		
		/** Indicates if the current video has already ended */
		var is_ended                     = false;	
		/** The end time for the last track or ad is calculated */
		var time_since_last_end          = (Date.now() - window.youtube.last_end_time);
			
		/** If the end time of the last track or ad is less than 5 sec, then the function returns */
		if (time_since_last_end < 5000) {
			/** Indicates if the current video has already ended */
			is_ended                 = true;	
			/** The time at which the last track ended is noted */
			window.youtube.last_end_time = Date.now();
			/** The function returns */
			return is_ended;
		}
			
		/** The time at which the last track ended is set to the current time */
		window.youtube.last_end_time     = Date.now();
		
		return is_ended;
	},
	/** 
	 * Used to play an item 
	 *
	 * @param boolean is_play indicates if the track should be played
	 * @param boolean rebuild_quality indicates if the quality menu should be rebuilt
	*/
	playitem: function playitem(is_play, rebuild_quality) {			
		/** The track to be played is highlighted */
		player.highlighttrack((player.currentPlaylistItem+1));		
		/** The start time for the track */
		var start_time = player.playlist[player.currentPlaylistItem].start*1;
		/** The endtime for the track */		
		var endtime   = player.playlist[player.currentPlaylistItem].endtime*1;
		/** The poster for the track */		
		var poster     = player.playlist[player.currentPlaylistItem].image;
		/** The url for the track */		
		var url        = player.playlist[player.currentPlaylistItem].src;

   		/** The start time for the track is saved as a global variable */
		window.youtube.start      = start_time;
   		/** The end time for the track is saved as a global variable */		
		window.youtube.end        = endtime;
   		/** The current url for the track is saved as a global variable */		
		window.youtube.current_url = url;			
										
		/** If the track should be played, then it is played after pause of 0.5 sec */	
		if (is_play) {		    			
		    /** The track is played */
			setTimeout(function(){			    
			    /** The url for the track is set */
		        player.setSrc(url);					
		        /** The player is loaded */	
		        player.load();
				/** The poster for the track is set to the default blank poster */	
		        player.setPoster(window.youtube.default_poster);
		        /** The track is played */
			    player.play();
			 }, 1000
			);
		}
		else {
				/** The url for the track is set */
		        player.setSrc(url);					
		        /** The player is loaded */	
		        player.load();
			    /** The poster for the track is set to the default blank poster */	
			    player.setPoster(window.youtube.default_poster);
			    /** The track is paused */
			    player.pause();					
		}

		/** If the quality menu needs to be rebuilt, then it is rebuilt after a pause of 2 sec */
		if (rebuild_quality) {
			/** The JavaScript timer is set to 2 sec */
			setTimeout(function() {
				/** The quality menu is rebuilt after pause of 2 sec */
				setTimeout(function(){player.buildquality(player, player.controls, player.layers, player.media);}, 5000);			
			}, 2000);		
		}
	},
	/** 
	 * Used to play a track
	 *
	 * @param int index indicates the track number of the track to play
	 * @param string action [prev~next~ended~current] the action taken by the user. for example, the user clicked on the previous playlist button
	*/
	playtrack: function playtrack(index, action) {
		/** If the previous playlist button was clicked */
		if (action == "prev") {
			/** If the previous item does not exist. i.e the current item is the first one in the playlist */
			if (!player.playlist[player.currentPlaylistItem-1]) {				
				/** The current playlist item is set to the last item */
				player.currentPlaylistItem = (player.playlist.length-1);
			}
			/** If the current item is not the first one, then the current playlist item index is decreased by 1 */
			else player.currentPlaylistItem--;
			
			/** If the number of ads played is 1 or less, then the second ad is shown */
			//if (player.options.ad_count <=1) player.showad();
			//else 
			/** If 2 ads have been played, then the track is played without playing an ad first. The quality menu is rebuilt */
			player.playitem(true, true);
		}
		/** If the next playlist button was clicked */
		else if (action == "next") {
			/** If the next item does not exist. i.e the current item is the last one in the playlist */
			if (!player.playlist[player.currentPlaylistItem+1]) {
				/** The current playlist item is set to the first item */
				player.currentPlaylistItem = 0;								
			}
			/** If the next item exists. i.e the current item is not the last one in the playlist, then the current playlist item index is increased by 1 */
			else player.currentPlaylistItem++;
	
			/** If the number of ads played is 1 or less, then the second ad is shown */
			//if (player.options.ad_count <=1) player.showad();
			//else 
			/** If 2 ads have been played, then the track is played without playing an ad first. The quality menu is rebuilt */
			player.playitem(true, true);
		}
		/** If a track ended, then the next track in the playlist is played */
		else if (action == "ended") {				
			/** The url of the current track or ad is fetched */
			var current_url = player.getSrc();
			/** The current playlist item index is set to the given index */
			player.currentPlaylistItem = index;						
			/** If the current playlist item is a YouTube video */
			if (current_url.indexOf("youtube") > 0) {
				/** The number of tracks played is increased by 1 */
				player.options.tracks_played++;
				/** If the player does not have a loop or shuffle button, then the playlist item index is increased by 1. i.e the next item in the playlist */
				if (!player.options.loop && !player.options.shuffle) player.currentPlaylistItem++;
			}
			/** If the current item is an ad, then the number of ads played is increased by 1 */
			else player.options.ad_count++;
				
			/** If the number of tracks played is one or less and the number of ads played is one or less and the current video is a YouTube video */
			//if (player.options.tracks_played <= 1 && player.options.ad_count <=1 && current_url.indexOf("youtube") > 0)
			//{
			/** The ad is shown */
			//player.showad();
			//}
			/** If more than two tracks or two ads have been played or the video that just ended was an ad */
			//else {
				/** If less than two tracks have been played */
				//if (player.options.tracks_played < 2) {
					/** The ad index is set to the last index of the ad media */
					//player.options.indexPreroll = player.options.adsPrerollMediaUrl.length;
					/** The ads preroll is ended, so the ads can be played again */
					//player.adsPrerollEnded();				
				//}
				/** The track is played and the quality menu is rebuilt */
				player.playitem(true, true);						
			//}
		}
		/** If a track was clicked on the playlist bar */
		else if (action == "current") {
			/** The current playlist item index is set to the selected track index */
			player.currentPlaylistItem = index;
			/** If one or no ads have been shown, then an ad is shown */
			//if (player.options.ad_count <=1) player.showad();
			/** If two ads have already been shown, then the track is played */
			//else
			/** The track is played and the quality menu is rebuilt */
			player.playitem(true, true);
		}																
	},
	/** Used to build the previous playlist button */
	buildprevtrack: function buildprevtrack(player) {

		var defaultPrevTitle = mejs.i18n.t('mejs.playlist-prev'),
		prevTitle = mejs.Utils.isString(player.options.prevText) ? player.options.prevText : defaultPrevTitle;
		player.prevButton = document.createElement('div');
		player.prevButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'prev-button';
		player.prevButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + prevTitle + '" aria-label="' + prevTitle + '" tabindex="0"></button>';

		player.prevPlaylistCallback = function () {			
			player.playtrack(player.currentPlaylistItem, "prev");
		};

		player.prevButton.addEventListener('click', player.prevPlaylistCallback);
		player.addControlElement(player.prevButton, 'prevtrack');
	},
	/** Used to remove the event handler for the previous playlist button */	
	cleanprevtrack: function cleanprevtrack(player) {
		player.prevButton.removeEventListener('click', player.prevPlaylistCallback);
	},
	/** Used to build the next playlist button */
	buildnexttrack: function buildnexttrack(player) {
		var defaultNextTitle = mejs.i18n.t('mejs.playlist-next'),
		nextTitle = mejs.Utils.isString(player.options.nextText) ? player.options.nextText : defaultNextTitle;
		player.nextButton = document.createElement('div');
		player.nextButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'next-button';
		player.nextButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + nextTitle + '" aria-label="' + nextTitle + '" tabindex="0"></button>';

		player.nextPlaylistCallback = function () {						
			player.playtrack(player.currentPlaylistItem, "next");
		};

		player.nextButton.addEventListener('click', player.nextPlaylistCallback);
		player.addControlElement(player.nextButton, 'nexttrack');
	},
	/** Used to remove the event handler for the next playlist button */	
	cleannexttrack: function cleannexttrack(player) {
		player.nextButton.removeEventListener('click', player.nextPlaylistCallback);
	},
	/** Used to build the loop playlist button */	
	buildloop: function buildloop(player) {
		var defaultLoopTitle = mejs.i18n.t('mejs.playlist-loop'),
		    loopTitle = mejs.Utils.isString(player.options.loopText) ? player.options.loopText : defaultLoopTitle;

		player.loopButton = document.createElement('div');
		player.loopButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'loop-button ' + (player.options.loop ? player.options.classPrefix + 'loop-on' : player.options.classPrefix + 'loop-off');
		player.loopButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + loopTitle + '" aria-label="' + loopTitle + '" tabindex="0"></button>';
		player.loopCallback = function () {
			player.options.loop = !player.options.loop;
			if (player.options.loop) {
				mejs.Utils.removeClass(player.loopButton, player.options.classPrefix + 'loop-off');
				mejs.Utils.addClass(player.loopButton, player.options.classPrefix + 'loop-on');
			} else {
				mejs.Utils.removeClass(player.loopButton, player.options.classPrefix + 'loop-on');
				mejs.Utils.addClass(player.loopButton, player.options.classPrefix + 'loop-off');
			}
		};

		player.loopButton.addEventListener('click', player.loopCallback);
		player.addControlElement(player.loopButton, 'loop');
	},
	/** Used to remove the event handler for the loop playlist button */	
	cleanloop: function cleanloop(player) {
		player.loopButton.removeEventListener('click', player.loopCallback);
	},
	/** Used to build the shuffle playlist button */	
	buildshuffle: function buildshuffle(player) {
		var defaultShuffleTitle = mejs.i18n.t('mejs.playlist-shuffle'),
		    shuffleTitle = mejs.Utils.isString(player.options.shuffleText) ? player.options.shuffleText : defaultShuffleTitle;
		player.shuffleButton = document.createElement('div');
		player.shuffleButton.className = player.options.classPrefix + 'button ' + player.options.classPrefix + 'shuffle-button ' + player.options.classPrefix + 'shuffle-off';
		player.shuffleButton.innerHTML = '<button type="button" aria-controls="' + player.id + '" title="' + shuffleTitle + '" aria-label="' + shuffleTitle + '" tabindex="0"></button>';
		player.shuffleButton.style.display = 'none';
		player.media.addEventListener('play', function () {
			player.shuffleButton.style.display = '';
			//player.resetSize();
		});

		var enabled = false,
		    playedItems = [];
		var randomizeCallback = function randomizeCallback() {
			if (!player.options.loop) {
				var randomItem = Math.floor(Math.random() * player.playlist.length);
				player.currentPlaylistItem = randomItem;
				
				if (playedItems.indexOf(player.currentPlaylistItem) === -1) {					
					player.playtrack(player.currentPlaylistItem, "random");					
					playedItems.push(randomItem);
				} else if (playedItems.length < player.playlist.length) {
					player.shuffleCallback();
				} else if (playedItems.length == player.playlist.length) {
					playedItems = [];
					playedItems.push(randomItem);
				}
			}
		};

		player.shuffleCallback = function () {
			player.options.shuffle = !player.options.shuffle;
			if (!player.options.shuffle) {
				mejs.Utils.removeClass(player.shuffleButton, player.options.classPrefix + 'shuffle-off');
				mejs.Utils.addClass(player.shuffleButton, player.options.classPrefix + 'shuffle-on');
				player.media.addEventListener('ended', randomizeCallback);
			} else {
				mejs.Utils.removeClass(player.shuffleButton, player.options.classPrefix + 'shuffle-on');
				mejs.Utils.addClass(player.shuffleButton, player.options.classPrefix + 'shuffle-off');
				player.media.removeEventListener('ended', randomizeCallback);
			}
		};

		player.shuffleButton.addEventListener('click', player.shuffleCallback);
		player.addControlElement(player.shuffleButton, 'shuffle');
	},
	/** Used to remove the event handler for the shuffle playlist button */	
	cleanshuffle: function cleanshuffle(player) {
		player.shuffleButton.removeEventListener('click', player.shuffleCallback);
	},
	/** Used to generate the html for the playlist bar */
	createPlayList_: function createPlayList_() {
		var t = this;

		t.playlist = t.options.playlist.length ? t.options.playlist : [];

		if (!t.playlist.length) {
			var children = t.mediaFiles || t.media.originalNode.children;

			for (var i = 0, total = children.length; i < total; i++) {
				var childNode = children[i];

				if (childNode.tagName.toLowerCase() === 'source') {
					(function () {
						var elements = {};
						Array.prototype.slice.call(childNode.attributes).forEach(function (item) {
							elements[item.name] = item.value;
						});

						if (elements.src && elements.type && elements.title) {
							elements.type = mejs.Utils.formatType(elements.src, elements.type);
							t.playlist.push(elements);
						}
					})();
				}
			}
		}

		if (t.playlist.length == 0) {
			return true;
		}

		t.listItems = [];
		var list_html = "";
		for (var index = 0; index < t.playlist.length; index++) {
			var playlist_title = "";
			var temp_arr = t.playlist[index].title.split(" ");
			var title_line_arr = Array();
			var counter = 0;
			for (count = 0, counter = 0; count < temp_arr.length; count++) {
				var word = temp_arr[count];
				if (title_line_arr[counter]) {
					var temp_str = title_line_arr[counter] + (word + " ");
				} else {
				var temp_str = (word + " ");
				}
				if (temp_str.length < 22) {
					title_line_arr[counter] = temp_str;
				} else {
					counter++;
					title_line_arr[counter] = (word + " ");
				}
			}
			var playindex = index + 1;
			
			var style_text = "";
			if (playindex == 1) style_text = "style='border: 1px solid red; margin-left: 20px;'";
			
			playlist_title = title_line_arr.join("<br/>");
			list_html  = "<li id='track-" + playindex + "'" + style_text + "><span id='track-title-" + playindex + "' class='dropt' title='"
						+ t.playlist[index].title
						+ "'><span style='cursor:pointer;' onclick='mejs.players.mep_0.playtrack("
						+ index
						+ ", \"current\");'><img height='120' width='160' src='"
						+ t.playlist[index].image
						+ "' /></a></span><br/><span class='thumbnail-title' onclick='mejs.players.mep_0.playtrack("
						+ index
						+ ", \"current\");'>"
						+ playlist_title + "</span></li>";

			t.listItems.push(list_html);
		}
	}
});

},{}]},{},[1]);
