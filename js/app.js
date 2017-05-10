var infowindow;

var map;

var markers = [];

var myCoordinates = {
	lat:29.5336,
	lng:75.0177
};

function checkExist( marker ) {
	for( var i = 0 ; i < markers.length ; i++ )
	{
		if( markers[ i ].title == marker )
			return true;
	}
	return false;	
}

function Error() {
	//console.log("Aao");
	myAppViewModel.isError( true );
	myAppViewModel.errormsg( "Could't load the map");

}

function callback( metadata ) {
	var boundLimit = new google.maps.LatLngBounds();
	//console.log( metadata );
	for( var i = 0 ; i < metadata.length ; i++ )
	{
		var l = {
			lat:metadata[i].geometry.location.lat(),
			lng:metadata[i].geometry.location.lng()
		}
		if( checkExist(metadata[ i ].name) == false )
		{	
			var marker = new google.maps.Marker({
				title:metadata[ i ].name,
				position: l,
				map:map,
				animation: google.maps.Animation.DROP
			});
			boundLimit.extend( marker.position );

			markers.push( marker );
			marker.addListener("click" , function() {
				populatingInfoWindow( this , infowindow);
			});
		}
	}
	map.fitBounds( boundLimit );
	myAppViewModel.init( markers );
};

function mapConstructor() {
	map = new google.maps.Map( document.getElementById('map') , {
		center: myCoordinates,
		zoom: 12
	});
	infowindow = new google.maps.InfoWindow();
	var request = {
		location: myCoordinates,
		type: ['restaurant'],
		radius: 1000
	};
	
	var places = new google.maps.places.PlacesService(map);
	places.nearbySearch( request , callback );

}
function animate( marker ) {
	marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
	marker.setAnimation( google.maps.Animation.BOUNCE );
}
function stopAnimation( marker ) {
	if( marker !== undefined )
	{	
		marker.setIcon(null);
		marker.setAnimation( null );
	}
}
function populatingInfoWindow(marker , infowindow)
{
	if( infowindow.marker != marker )
	{
		stopAnimation( infowindow.marker );
	}
	infowindow.marker = marker;
	animate( marker );
	setContent();
	//infowindow.setContent( content );
	infowindow.open( map , marker );	
	infowindow.addListener('closeclick' , function() {
		stopAnimation( marker );
	});
}
function openMarker( marker ) {
	for( var i = 0 ; i < markers.length ; i++ )
	{
		if( markers[ i ].title == marker )
			populatingInfoWindow( markers[ i ] , infowindow );
	}	
}

function setContent() {
	var content = '<div>';
	content += infowindow.marker.title;
	content += '</div>';
	content += '<div class = "infoWindow">';
	var lat = infowindow.marker.position.lat();
	var lng = infowindow.marker.position.lng();
	$.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ff142ff32a49d98774d6d10989e2731b&lat='+lat+'&lon='+lng+'&per_page=30&media=photos&format=json&jsoncallback=?',whenDone).fail( function(){
		var errorContent = '<h1> Could not load the images Sorry </h2>';
		infowindow.setContent( errorContent );
	});
	function whenDone( data ) {
		//console.log( data );
		$.each( data.photos.photo , function( i , item ) {
			var id = item.id;
			var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
            content += '<img class = "infoImage" src="' + photoURL + '">';
		} );
		content += "</div>";
		infowindow.setContent( content );
	}
}


function showMarkers() { 
	for( var i = 0 ; i < markers.length ; i++ )
	{
		markers[ i ].setVisible( true );	
	}
}


function hideMarkers() { 
	for( var i = 0 ; i < markers.length ; i++ )
	{
		markers[ i ].setVisible( false );	
	}
}

var myAppViewModel = {
	list : ko.observableArray( [] ),
	searchQ : ko.observable(''),
	isError : ko.observable( false ),
	errormsg : ko.observable(''),
	init: function( markers )
	{
		//console.log( markers.length );
		for( var i in markers )
		{
			myAppViewModel.list.push( markers[ i ].title );	
		}	
	},
	searchFunction : function( query ) {
		//console.log( query );
		myAppViewModel.list.removeAll();
		for( var i = 0 ; i < markers.length ; i++ )
		{
			if( markers[ i ].title.toLowerCase().indexOf( query.toLowerCase() ) > -1 )
			{
				markers[ i ].setVisible( true );
				myAppViewModel.list.push( markers[ i ].title );
			}	
			else
			{
				markers[ i ].setVisible( false );
			}	
		}	
	}
};
ko.applyBindings( myAppViewModel );
myAppViewModel.searchQ.subscribe( myAppViewModel.searchFunction );
