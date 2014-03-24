var App=App||{};App={home:{}},function(){"use strict";App.Map={init:function(){var a=this,b="mayakreidieh.hk09m36l";this.map=L.mapbox.map("map",b).setView([34.36137,66.363099],6),$("#manual-map").on("click",function(){console.log("clicked manual"),a.initUserLocationEntry(),$("#control").fadeOut(100),$(".select-style").fadeIn(100)}),$("#auto-map").on("click",function(){console.log("clicked autp"),a.getUserGeoLocation(),$("#control").fadeOut(100)}),$("#view-map").on("click",function(){console.log("clicked view")})},addHome:function(a){L.marker([a.lat,a.lon]).addTo(this.map)},addPoint:function(a){L.marker([a.lat,a.lon]).addTo(this.map)},addPath:function(a,b){var c=L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:"red"}).addTo(this.map);this.map.fitBounds(c.getBounds())},_renderHome:function(a){L.marker([a.lat,a.lon]).addTo(this.map)},_renderDestination:function(a,b){L.marker([a.lat,a.lon]).addTo(this.map);var c=function(a,b,c,d,e){var f=Math.PI*a/180,g=Math.PI*c/180,h=(Math.PI*b/180,Math.PI*d/180,b-d),i=Math.PI*h/180,j=Math.sin(f)*Math.sin(g)+Math.cos(f)*Math.cos(g)*Math.cos(i);return j=Math.acos(j),j=180*j/Math.PI,j=60*j*1.1515,"K"==e&&(j=1.609344*j),"N"==e&&(j=.8684*j),j},d=c(App.home.lat,App.home.lon,a.lat,a.lon,"K").toFixed(2);$("#narrative").html("The closes polling stations is here, at: "+b.name+" , "+b.location+"You are: "+d+" km away.");var e=new L.featureGroup([L.marker([App.home.lat,App.home.lon]),L.marker([a.lat,a.lon])]);this.map.fitBounds(e.getBounds())},getUserGeoLocation:function(){var a=this;return navigator.geolocation?(navigator.geolocation.getCurrentPosition(function(b){App.home={lat:b.coords.latitude,lon:b.coords.longitude},console.log("getting getClosesPollingStation"),a._renderHome(App.home),a.getClosestPollingStation()}),!0):(console.log("none"),!1)},getClosestPollingStation:function(){var a=this,b=function(b){for(var c=",",d=new RegExp("(\\"+c+'|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\'+c+"\\r\\n]*))","gi"),e=[[]],f=null;f=d.exec(b);){var g=f[1];if(g.length&&g!=c&&e.push([]),f[2])var h=f[2].replace(new RegExp('""',"g"),'"');else var h=f[3];e[e.length-1].push(h)}App.pollingStations=e,console.log(e.length),a.getNearestNeighbor()};$.ajax({type:"GET",url:"data/data.csv",dataType:"text",success:function(a){b(a)}})},getNearestNeighbor:function(){for(var a=1/0,b=0,c=function(a,b){var c=0,d=0;return c=b.x-a.x,c*=c,d=b.y-a.y,d*=d,Math.sqrt(c+d)},d=1;d<App.pollingStations.length;d++){var e={x:App.home.lat,y:App.home.lon},f={x:App.pollingStations[d][13],y:App.pollingStations[d][12]},g=c(e,f);a>g&&(a=g,b=d)}var h={lon:App.pollingStations[b][12],lat:App.pollingStations[b][13]};return console.log("NEAREST PC"),console.log(h),this._renderDestination(h,{name:App.pollingStations[b][6],location:App.pollingStations[b][5]}),b},initUserLocationEntry:function(){var a=this,b={},c=omnivore.topojson("data/districts.json").on("ready",function(){for(var d in c._layers)b[c._layers[d].feature.properties.dist_name]=c._layers[d];var e=$("#districts");$.each(b,function(a){console.log(a),e.append($("<option />").val(a).text(a))}),e.change(function(){var c=$("select option:selected").val();a.map.fitBounds(b[c])})}).addTo(a.map)}},App.Map.init()}();