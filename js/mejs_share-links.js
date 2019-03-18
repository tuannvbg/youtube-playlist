/** The function for adding video share tools */
AddVideoShareTools = function( me, video ){
	
	/** If the wrong video tag name is given, then the function returns */
	if( video.tagName != 'VIDEO' )
		return;
	
	$ = jQuery.noConflict( );
	
	/** The html element where the share form should be attached */
	if( $inner = $("#media-wrapper-container") ){
		/** The video element */
		$video		= $( video );
		/** The title of the currently playing video */
		$title 		= window.player.playlist[window.player.currentPlaylistItem].title;
		/** The url to share */
		share_url	= location.href;
		/** If the share url does not contain "#Trailer" */
		if (share_url.indexOf("#Trailer") < 0) {
			/** The "#Trailer" is appended to the url and the url is encoded */
			share_url	= encodeURIComponent(share_url + "#Trailer");
		}
		/** The share url is encoded */
		else share_url	= encodeURIComponent(share_url);
		
		/** The embed url */
		embed_url	= location.href;
		
		/** The share links for the different social networks */
		sharelinks = {
			/** The url for Twitter share */
			tw: 	'http://twitter.com/share?text=Video: ' + $title + '&url=' + share_url,
			/** The url for Facebook share */
			fb: 	'https://www.facebook.com/sharer/sharer.php?url=' + share_url,
			/** The url for Stumble Upon share */
			su: 	'http://www.stumbleupon.com/submit?title=' + $title + '&url=' + share_url,
			/** The url for Google Plus share */
			gp: 	'https://plus.google.com/share?url=' + share_url,
			/** The url for Email share */
			em: 	'http://api.addthis.com/oexchange/0.8/forward/email/offer?url=' + share_url
		}
		
		/** The variable containing the share link html */
		var links = '';
		/** Hyper link is created from each share link */
		for ( var key in sharelinks) {
			/** The share link is updated */
			links += '<a href="javascript:" rel="nofollow" class="'+key+'">';
		}
		
		/** The video title which is shown at the top of the video */
		//$inner.prepend( '<div class="media-content-title" id="media-content-title">' + $title + '</div>' );
		/** The share button */
		$inner.prepend( '<a href="javascript:" rel="nofollow" class="share-video-link">' + 'Share' + '</a>' );
		
		/** The html for the share form */
		html   = '<div class="share-video-form">';
		html += '<em class="share-video-close">x</em><h4>' + 'share video' + '</h4>';
		html += '<em>'+ 'link' +'</em><input type="text" class="share-video-lnk share-data" value="' + decodeURIComponent(share_url) + '" />' ;
		
		/** The html for the embed code, which is part of the share form */
		//html += '<em>'+ 'embed'  +'</em><textarea class="share-video-embed share-data">';
		//html += '&lt;iframe src=&quot;' + embed_url + '&quot; height=&quot;373&quot; width=&quot;640&quot; ';
		//html += 'scrolling=&quot;no&quot; frameborder=&quot;0&quot; marginwidth=&quot;0&quot; marginheight=&quot;0&quot;&gt;&lt;/iframe&gt;</textarea>';

		/** The the html code for the share links */		
		html += '<div class="video-social-share">' + links + '</div>' ;
		/** The share form is attached to the media element html element */
		$inner.prepend( html + '</div>'  ); 
		
		
		/** The different parts of the share form are fetched */
		$sharelink 		= $inner.find( '.share-video-link' );
		$sharefrom    	= $inner.find( '.share-video-form' );
		$closelink 		= $inner.find( '.share-video-close' );
		$videotitle	 	= $inner.find( '.media-content-title' );
			
		/** Event Listener for handling the play button click event
		me.addEventListener( 'play', function(e) {
				// The title of the currently playing video is set
				document.getElementById("media-content-title").innerHTML = window.player.playlist[window.player.currentPlaylistItem].title;
				// When the play button is clicked, the share form is hidden
				$sharelink.hide( ); $sharefrom.hide( ); $videotitle.hide( );
		}, false );*/

		/** Event Listener for handling the pause button click event
		me.addEventListener( 'pause', function(e) {
				// The video-active css class is removed from the share links
				$sharelink.removeClass( 'video-active' );
				$inner.find( '.mejs-overlay-button' ).show( );
				// The video title and share button are shown
				$videotitle.show( ); $sharelink.show( );
		}, false );*/
		
		/** The function for hiding the share form */
		CloseVideoShareForm = function( ){
			/** The share form is hidden */
			$sharefrom.hide( );			
			$sharelink.removeClass( 'video-active' );
			
			$inner.find( '.mejs-overlay-play' )
			.removeClass( 'share-overlay' );
		};
		
		
		/** The function for closing the share video form is attached to the close button click event */
		$closelink.bind( 'click', CloseVideoShareForm );
		/** The function for toggling the share form is attached to the share button click event */
		$sharelink.bind( 'click', function( ){
			/** If the share form is hidden, then it is shown */
			if( $sharefrom.is( ':hidden' ) ) {
					
					$sharefrom.show( );
					$sharelink.addClass( 'video-active' );
					
					$inner.find( '.mejs-overlay-play' )
					.addClass( 'share-overlay' ).show( );
			
			}
			/** If the share form is shown, then it is hidden */
			else CloseVideoShareForm( );
			
		});
		
		/** The event handler for handling the clicking of a social network icon */
		$inner.find( '.video-social-share a' ).click( function(){
			/** The social network code is fetched */
			key = $( this ).attr( 'class' );
			/** The 'big' css class is removed. This class is auto added on the live website for some reason */
			key = key.replace(" big", "");
			/** If the share url exists, then it is opened */
			if( sharelinks[key] ) {
				/** The url is opened in new window */
				window.open( sharelinks[key]  );
			}
		});
	}
}
