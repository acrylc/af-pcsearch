var App = App || {};

App = {

	home : {}

};


(function (){

	'use strict';


	// Initalizes a map of Afghanistan, adds home
	// and othe icons
	App.Map = {

		init: function(){
			
			var that = this;
			// display map
			var baseMap = 'mayakreidieh.hj5c0hl9';
			this.map = L.mapbox.map('map', baseMap);

			// listen to control input
			$('#manual-map').on('click', function(){
				console.log('clicked manual');
				that.initUserLocationEntry();
				$('#control').fadeOut(100);	
				$('#districts').fadeIn(100);	
			});
			$('#auto-map').on('click', function(){
				console.log('clicked autp');
				that.getUserGeoLocation();
				$('#control').fadeOut(100);

			});
			$('#view-map').on('click', function(){
				console.log('clicked view');
			});
		},

		addHome: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		addPoint: function(point){
			L.marker([point.lat, point.lon]).addTo(this.map);
		},

		addPath:function(point1, point2){
			var polyline = L.polyline( [[point1.lat,point1.lon],[point2.lat,point2.lon]], {color: 'red'}).addTo(this.map);
			this.map.fitBounds(polyline.getBounds());
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
					that.addHome(App.home);
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
				url: "data.csv",
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
			App.Map.addPoint(nearestPC);
			return minIndex;
		},

		initUserLocationEntry : function(){

			var that = this;
			var distNames = {};
			var districts = omnivore.topojson('/scripts/districts.json')
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
				});
			}).addTo(that.map);

		},
	};

	App.Map.init();


}());



