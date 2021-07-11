angular.module('beamng.apps')
.directive('ingameTimeAngelo234', [function () {
return {
templateUrl: '/ui/modules/apps/ingame_time_angelo234/app.html',
replace: true,
restrict: 'EA',
require: '^bngApp',
link: function (scope, element, attrs, ctrl) {
	
	var settings_file_path = "settings/ingame_time_angelo234/settings.json";
	
	// The current overlay screen the user is on (default: null)
	scope.overlayScreen = null;	

	scope.displayrealtime = false;
	scope.ampmstyle = false;

	element.ready(function () {	
		bngApi.engineLua("jsonReadFile('" + settings_file_path + "')", function(data) {
			if(data !== undefined){
				scope.displayrealtime = data.displayrealtime;
				scope.ampmstyle = data.ampmstyle;
			}
		});		
	});

	var streamsList = ['electrics'];
	StreamsManager.add(streamsList);

	var gametime = null;

	function getGameTime(){
		bngApi.engineLua('core_environment.getTimeOfDay().time', function(data) {
			//12 am = 0.5
			//12 pm = 1
			var time_seconds = data;

			if(time_seconds >= 0.5){
				time_seconds -= 0.5;
			}
			else{
				time_seconds += 0.5;
			}

			time_seconds = Math.floor(time_seconds * 86400);

			var hours = Math.floor(time_seconds / 3600);

			var ampmtext = "";

			if(scope.ampmstyle){
				if(hours < 12){
					ampmtext = "AM";
				}
				else{
					ampmtext = "PM";
				}

				hours %= 12;

				if(hours == 0){
					hours = 12;
				}
			}
	
	    	var minutes = Math.floor(time_seconds % 3600 / 60);

			gametime = ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + " " + ampmtext;
		});	
	}

	function getRealTime(){
		//Code from BeamNG's Simple Time app.js

		var currentDate = new Date(); 
		var currentHour = currentDate.getHours();
		var currentMinute = currentDate.getMinutes();

		if (currentMinute < 10) {
			currentMinute = "0" + currentMinute;
		}

		var ampmtext = "";

		if(scope.ampmstyle){
			if(currentHour < 12){
				ampmtext = "AM"
			}
			else{
				ampmtext = "PM"
			}

			currentHour %= 12;

			if(currentHour == 0){
				currentHour = 12;
			}
		}
		
		return currentHour + ":" + currentMinute + " " + ampmtext;		
	}


	scope.$on('streamsUpdate', function (event, streams) {
		scope.$evalAsync(function () {
			if(scope.displayrealtime){
				scope.time = getRealTime();	
			}
			else{
				getGameTime();
				scope.time = gametime;
			}
		})	
	});

	// Make sure we clean up after closing the app.
	scope.$on('$destroy', function () {
		StreamsManager.remove(streamsList);
		
		var data = {}
		data.displayrealtime = scope.displayrealtime;
		data.ampmstyle = scope.ampmstyle;
		
		data = JSON.stringify(data);
		
		bngApi.engineLua("writeFile('" + settings_file_path + "'," + "'" + data + "', true)");
	});	
},
};
}]);