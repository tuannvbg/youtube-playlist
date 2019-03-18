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

mejs.i18n.en['mejs.quality-chooser'] = 'Quality Chooser';

Object.assign(mejs.MepDefaults, {
	defaultQuality: 'Automatisch',

	qualityText: 'Videoqualität verändern'
});

Object.assign(MediaElementPlayer.prototype, {
	/** The function used to create the quality menu */
	buildquality: function buildquality(player, controls, layers, media) {
		/** The current object */
		var t                           = this;
		/** The list of qualities supported by YouTube API */
		var youtube_quality             = Array("highres", "hd1080", "hd720", "large", "medium", "small", "tiny", "auto");		
		/** The list of qualities as seen by users while playing videos on YouTube */
		var user_quality                = Array("Highres", "1080p", "720p", "480p", "360p", "240p", "144p", "Automatisch");
		/** The list of qualities available for the currently playing video */
		var available_qualities         = window.youtube.available_qualities;
		
		/** The data structured used to store the qualities */
		var qualityMap                  = new Map();
		/** The data structured used to store the qualities in reverse format */		
		var reverse_qualityMap          = new Map();
		
		/** The list of qualities supported by YouTube API and the list of qualities as seen by the user are added to the key value stores */
		for (var i = 0, total = youtube_quality.length; i < total; i++) {
			/** The user quality */
			var quality                 = user_quality[i];
			/** The quality supported by YouTube API */
			var youtube_quality_text    = youtube_quality[i];
			
			var key                     = youtube_quality_text;
			var value                   = quality;
			
			/** The qualities are added to the quality map store */
			t.addValueToKey(qualityMap, key, value);
			/** The qualities are added to the reverse quality map store */			
			t.addValueToKey(reverse_qualityMap, value, key);
		}
		
		/** If no qualities are available for the current video, then the default qualities are used */			
		if (available_qualities == null || available_qualities.length == 0) available_qualities = user_quality;
		else {
			/** The list of qualities available for the current video in the user format */
			var temp_qualities           = Array();
			/** Each available quality is checked */
			for (var i = 0; i < available_qualities.length; i++) {
				/** The user quality corresponding to the video quality returned by YouTube API */
				var temp_quality         = qualityMap.get(available_qualities[i])[0];
				/** The user quality is added to the list */
				temp_qualities.push(temp_quality);
			}
			/** The available qualities in user format */
			available_qualities          = temp_qualities;
		}

		/** If the quality map is empty, then the function returns */
		if (qualityMap.size <= 1) {
			return;
		}

		/** The qualities on the player are removed */
		t.cleanquality(player);

		/** The text to show when the user moves the mouse over the quality menu */		
		var qualityTitle                 = mejs.Utils.isString(t.options.qualityText) ? t.options.qualityText : mejs.i18n.t('mejs.quality-quality');
	
		/** The default quality text in user format */
		var defaultValue                 = t.options.defaultQuality;

		/** The currently selected quality */
		var current_quality              = (player.qualitiesButton != null && player.qualitiesButton.querySelector('button').innerHTML != "") ? player.qualitiesButton.querySelector('button').innerHTML : t.options.defaultQuality;

		/** The div tag for the quality button is created */
		player.qualitiesButton           = document.createElement('div');
		/** The css class name for the quality button is set */
		player.qualitiesButton.className = t.options.classPrefix + 'button ' + t.options.classPrefix + 'qualities-button';
		/** The html for the quality button */
		player.qualitiesButton.innerHTML = '<button type="button" aria-controls="' + t.id + '" title="' + qualityTitle + '" ' 
											+ ('aria-label="' + qualityTitle + '" tabindex="0">' + defaultValue + '</button>') 
											+ ('<div class="' + t.options.classPrefix + 'qualities-selector ' + t.options.classPrefix + 'offscreen">') 
											+ ('<ul class="' + t.options.classPrefix + 'qualities-selector-list"></ul>') + '</div>';
		/** The quality button is added to the player */
		t.addControlElement(player.qualitiesButton, 'qualities');

		/** Each available quality is added to the quality menu */
		available_qualities.forEach(function (value, key) {
			/** If the quality key is not the list of map keys */
			if (key !== 'map_keys_1') {
				/** The id for the quality button */
				var inputId = t.id + '-qualities-' + value;
				/** The list items for the quality button are set */
				player.qualitiesButton.querySelector('ul').innerHTML += '<li class="' + t.options.classPrefix + 'qualities-selector-list-item">' 
															+ ('<input class="' + t.options.classPrefix + 'qualities-selector-input" type="radio" name="' 
															+ t.id + '_qualities"') + (' value="' + value + '" id="' + inputId + '"  ') 
															+ ((value === defaultValue ? ' checked' : '') + '/>') + ('<label for="' + inputId 
															+ '" class="' + t.options.classPrefix + 'qualities-selector-label') + ((value === defaultValue ? ' ' 
															+ t.options.classPrefix + 'qualities-selected' : '') + '"><b>') + ((value) + '</b></label>') + '</li>';
			}
		});
		
		/** The currently selected quality is set */
		player.qualitiesButton.querySelector('button').innerHTML = current_quality;
		
		/** The list of incoming events */
		var inEvents                    = ['mouseenter'];
		/** The list of outgoing events */
		var outEvents                   = ['mouseleave'];
		/** The list of radio buttons */
	    var radios                      = player.qualitiesButton.querySelectorAll('input[type="radio"]');
	    /** The list of quality labels */
	    var labels                      = player.qualitiesButton.querySelectorAll('.' + t.options.classPrefix + 'qualities-selector-label');
	    /** The quality selector */
		var selector                    = player.qualitiesButton.querySelector('.' + t.options.classPrefix + 'qualities-selector');

		/** The incoming event listeners are added to the quality button */
		for (var _i = 0, _total = inEvents.length; _i < _total; _i++) {
			/** The events handler function is added */
			player.qualitiesButton.addEventListener(inEvents[_i], function () {
				mejs.Utils.removeClass(selector, t.options.classPrefix + 'offscreen');
				selector.style.height = selector.querySelector('ul').offsetHeight + 'px';
				selector.style.top = -1 * parseFloat(selector.offsetHeight) + 'px';
			});
		}

		/** The outgoing event listeners are added to the quality button */
		for (var _i2 = 0, _total2 = outEvents.length; _i2 < _total2; _i2++) {
			/** The events handler function is added */
			player.qualitiesButton.addEventListener(outEvents[_i2], function () {
				mejs.Utils.addClass(selector, t.options.classPrefix + 'offscreen');
			});
		}

		/** Events handlers are added for the click event of each quality label */
		for (var _i5 = 0, _total6 = labels.length; _i5 < _total6; _i5++) {
			/** The function for handling click event */
			labels[_i5].addEventListener('click', function () {
				var radio = mejs.Utils.siblings(this, function (el) {
					return el.tagName === 'INPUT';
				})[0];
				/** The event handler function is called */
				t.radioclick(radio, reverse_qualityMap, t.options.classPrefix, media);
			});
		}
		/** The event handler for key down event */
		selector.addEventListener('keydown', function (e) {
			/** The event propogation is stopped */
			e.stopPropagation();
		});
		
	},
	/** The event handler function for handling quality item click */
	radioclick: function(radio, qualityMap, classPrefix, media) {

		/** The radio button that was clicked */
		var self                  = radio;
		/** The current value of the clicked radio button */
	    var newQuality            = self.value;
		/** The value of the selected quality in a format that is understood by YouTube Api */
	    window.youtube.quality    = qualityMap.get(newQuality)[0];

		/** The list of all quality items is fetched */
		var selected              = player.qualitiesButton.querySelectorAll('.' + classPrefix + 'qualities-selected');
		for (var _i4 = 0, _total4 = selected.length; _i4 < _total4; _i4++) {
			/** The qualities are all deselected */
			mejs.Utils.removeClass(selected[_i4], classPrefix + 'qualities-selected');
		}

		/** The current quality item is marked as checked */
		document.getElementById(self.id).checked = true;

		/** The label for the current quality item is fetched */
		var siblings = mejs.Utils.siblings(self, function (el) {
			return mejs.Utils.hasClass(el, classPrefix + 'qualities-selector-label');
		});

		/** The label is marked as selected */
		for (var j = 0, _total5 = siblings.length; j < _total5; j++) {
			mejs.Utils.addClass(siblings[j], classPrefix + 'qualities-selected');
		}
		/** The selected quality is set as the current quality */
		player.qualitiesButton.querySelector('button').innerHTML = newQuality;
								
		/** The current video time as shown on the media player */
		var currentTime = media.getCurrentTime();
				
		/** The video is paused */
		media.pause();				
		
		/** The player quality is set */
		media.setPlaybackQuality(newQuality);
	
		/** The video is played after pause of 1 sec */		
		setTimeout(function() {media.play();}, 1000);
	},
	/** The quality menu is removed from the player */
	cleanquality: function cleanquality(player) {
		/** If the player exists */
		if (player) {
			/** If the qualities button exists */
			if (player.qualitiesButton) {
				/** The qualities button is removed */
				player.qualitiesButton.remove();
			}
		}
	},
	/** Used to add value to the given key/value store */
	addValueToKey: function addValueToKey(map, key, value) {
		/** The list of keys is updated. It is maintained with the key/value store */
		if (map.has('map_keys_1')) {
			map.get('map_keys_1').push(key.toLowerCase());
		} else {
			map.set('map_keys_1', []);
		}
		/** The list of key/values is updated */
		if (map.has(key)) {
			map.get(key).push(value);
		} else {
			map.set(key, []);
			map.get(key).push(value);
		}
	}
});

},{}]},{},[1]);
