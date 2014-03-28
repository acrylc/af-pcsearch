var App = App || {};

App = {

	home : {}

};


(function (){

	'use strict';

	// Initalizes a map of Afghanistan, adds home
	// and other icons
	App.Map = {

		init: function(){
			
			var that = this;
			// display map
			var baseMap = 'mayakreidieh.hk09m36l';
			this.map = L.mapbox.map('map', baseMap).setView([34.361370, 66.363099], 6);

			// listen to control input
			$('#manual-map').on('click', function(){
				$('#title').html('');
				that.initUserLocationEntry();

				$('#control').fadeOut(100);
				$('#title').fadeOut(100);
				$('.select-style').fadeIn(100);
				that._addDrag();
			});
			$('#auto-map').on('click', function(){
				$('#title').html('');

				that.getUserGeoLocation();
				$('#title').fadeOut(100);
				$('#control').fadeOut(100);
				that._addDrag();

			});
			$('#view-map').on('click', function(){
				$('#title').html('');

				$('#title').fadeOut(100);
				$('#control').fadeOut(100);
				var locations = omnivore.geojson('data/locations.geojson')
				.on('ready', function(layer) {
					this.eachLayer(function(marker) {
						marker.setIcon(L.divIcon({className: 'div-icon'}));
					});
				}).addTo(that.map);
			});
		},

		addHome: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		_addDrag: function () {
			var that = this;
			this.map.on('dragend', function(e) {
				App.home = {
					lat: that.map.getCenter().lat,
					lon: that.map.getCenter().lng,
				};
				that._renderHome(App.home);
				that.getClosestPollingStation();
			});
		},

		addPoint: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		addPath:function(point1, point2){
			var polyline = L.polyline( [[point1.lat,point1.lon],[point2.lat,point2.lon]], {color: 'red'}).addTo(this.map);
			this.map.fitBounds(polyline.getBounds());
		}, 

		_renderHome : function(point){
			if (!this.homeMarker) {
				this.homeMarker = L.marker([point.lat, point.lon]).addTo(this.map);
			} else {
				this.homeMarker.setLatLng([point.lat, point.lon]).update();
			}
			// $('#narrative').html('You are here.');
		},

		_renderDestination: function(point, address){
			if (!this.distanceMarker) {
				this.distanceMarker = L.marker([point.lat, point.lon]).addTo(this.map);
			} else {
				console.log(this.distanceMarker);
				this.distanceMarker.setLatLng([point.lat, point.lon]).update();
				console.log(this.distanceMarker);
			}

			// from : http://www.geodatasource.com/developers/javascript
			var distance = function (lat1, lon1, lat2, lon2, unit) {
				var radlat1 = Math.PI * lat1/180;
				var radlat2 = Math.PI * lat2/180;
				var radlon1 = Math.PI * lon1/180;
				var radlon2 = Math.PI * lon2/180;
				var theta = lon1-lon2;
				var radtheta = Math.PI * theta/180;
				var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
				dist = Math.acos(dist);
				dist = dist * 180/Math.PI;
				dist = dist * 60 * 1.1515;
				if (unit=="K") { dist = dist * 1.609344 }
					if (unit=="N") { dist = dist * 0.8684 }
						return dist;
				};

				var dist = (distance(App.home.lat, App.home.lon, point.lat, point.lon, 'K')).toFixed(2);

				$('#narrative').html('The closest polling station is here, at: '+address.name + ' , ' +address.location + 
					'You are: '+dist + ' km away.' );

			// var group = new L.featureGroup([L.marker([App.home.lat,App.home.lon]), L.marker([point.lat,point.lon])]);
			// this.map.fitBounds(group.getBounds());


		},

		getUserGeoLocation : function(){

			var that = this;
			if (navigator.geolocation) {
				// console.log(navigator.geolocation.getCurrentPosition())
				navigator.geolocation.getCurrentPosition(function(position){
					App.home = {
						lat : position.coords.latitude,
						lon :  position.coords.longitude
					};
					console.log('getting getClosesPollingStation');
					that._renderHome(App.home);
					that.getClosestPollingStation();
				});
				return true;
			} else {
				console.log('none');
				return false;
			}
		},

		getClosestPollingStation : function(){

			var that = this;
			var processData = function(strData) {

				var strDelimiter = ',';
				var objPattern = new RegExp(
					(
						// Delimiters.
						"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
						// Quoted fields.
						"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
						// Standard fields.
						"([^\"\\" + strDelimiter + "\\r\\n]*))"
					),
					"gi"
					);

				var arrData = [[]];
				var arrMatches = null;
				while (arrMatches = objPattern.exec( strData )){
					var strMatchedDelimiter = arrMatches[ 1 ];
					if (
						strMatchedDelimiter.length &&
						(strMatchedDelimiter != strDelimiter)
						){
						arrData.push( [] );
				}
				if (arrMatches[ 2 ]){
					var strMatchedValue = arrMatches[ 2 ].replace(
						new RegExp( "\"\"", "g" ),
						"\""
						);

				} else {
					var strMatchedValue = arrMatches[ 3 ];
				}
				arrData[ arrData.length - 1 ].push( strMatchedValue );
			}
			App.pollingStations= arrData;
			console.log( arrData.length );
			that.getNearestNeighbor();
		}

		$.ajax({
			type: "GET",
			url: "data/data.csv",
			dataType: "text",
			success: function(data) {processData(data);}
		});
	},

	getNearestNeighbor : function(){

		var min = Infinity,
		minIndex = 0;

		var lineDistance = function ( point1, point2 ) {
			var xs = 0,
			ys = 0;
			xs = point2.x - point1.x;
			xs = xs * xs;
			ys = point2.y - point1.y;
			ys = ys * ys;
			return Math.sqrt( xs + ys );
		};
		for (var i = 1; i<App.pollingStations.length;i++){
			var p1 = {'x':App.home.lat, 'y':App.home.lon};
			var p2 = {'x':App.pollingStations[i][13], 'y':App.pollingStations[i][12]};
			var len = lineDistance(p1,p2);
			if (len < min){
				min = len;
				minIndex = i;
			}
		}
		var nearestPC = {'lon':App.pollingStations[minIndex][12], 'lat':App.pollingStations[minIndex][13]};
		console.log('NEAREST PC');
		console.log(nearestPC);
		this._renderDestination(nearestPC, {'name' : App.pollingStations[minIndex][6] , 'location' : App.pollingStations[minIndex][5] });
		return minIndex;
	},

	initUserLocationEntry : function(){

		var that = this;
		var distNames = {};
		var districts = omnivore.topojson('data/districts.json')
		.on('ready', function() {

			for (var key in districts._layers) {
				distNames[districts._layers[key].feature.properties.dist_name] = districts._layers[key];
			};

			var distOptions = $('#districts');

			$.each(distNames, function(name) {
				console.log(name);
				distOptions.append($('<option />').val(name).text(name));
			});
			distOptions.change(function() {
				var district = $('select option:selected').val();
				that.map.fitBounds(distNames[district]);
				that.map.on('zoomend', function() {
					console.log('zoomed in')
					App.home = {
						lat: that.map.getCenter().lat,
						lon: that.map.getCenter().lng,
					};
					that._renderHome(App.home);
					that.getClosestPollingStation();
				})

			});
		}).addTo(that.map);

	},
};

App.Map.init();


}());



