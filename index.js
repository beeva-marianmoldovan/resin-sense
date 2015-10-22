'use strict';

var SensorTag = require('sensortag');
var blink = require('node-blink1')
var async = require('async');
var _ = require('lodash');

// Pool of devices to be discovered
var pool = [];
var programGoodBye = _.debounce(goodBye, 10000);
var programmedGoodBye = true;

var blink = new blink();

function goodBye(){
	process.exit(1);
  if(blink) blink.setRGB(0, 0, 0);
}

function discoverNextDevice() {
  if(blink) blink.setRGB(255, 255, 0);
	if(!programmedGoodBye){
		programmedGoodBye = true;
		programGoodBye();
	}
	SensorTag.discover(onDiscover);
}

function onDiscover(sensorTag) {
  if(blink) blink.setRGB(255, 255, 120);
	console.log('Yo sensorTag: ' + sensorTag.address);
	var position = pool.indexOf(sensorTag.address);
	if(position < 0){
    pool.push(sensorTag.address);
		programGoodBye.cancel();
		programmedGoodBye = false;
	}
	else{
		return
	}
	sensorTag.on('disconnect', function() {
		console.log('disconnected!');
		discoverNextDevice();
	});

	async.series([
			function(callback) {
				console.log('connectAndSetUp');
				sensorTag.connectAndSetUp(callback);
			},
			function(callback) {
        if(blink) blink.setRGB(0, 255, 0);
				console.log('readDeviceName');
				sensorTag.readDeviceName(function(error, deviceName) {
					console.log('\tdevice name = ' + deviceName);
					callback(null, {'id' : sensorTag.id});
				});
			},
			function(callback) {
				console.log('enableIrTemperature');
				sensorTag.enableIrTemperature(callback);
			},
			function(callback) {
				setTimeout(callback, 2000);
			},
			function(callback) {
				console.log('readIrTemperature');
				sensorTag.readIrTemperature(function(error, objectTemperature, ambientTemperature) {
					console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
					console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));

					callback(null, {'object_temperature' : objectTemperature.toFixed(1), 'ambient_temperature' : ambientTemperature.toFixed(1)});
				});
			},
			function(callback) {
				console.log('enableHumidity');
				sensorTag.enableHumidity(callback);
			},
			function(callback) {
				setTimeout(callback, 2000);
			},
			function(callback) {
				console.log('readHumidity');
				sensorTag.readHumidity(function(error, temperature, humidity) {
					console.log('\ttemperature = %d °C', temperature.toFixed(1));
					console.log('\thumidity = %d %', humidity.toFixed(1));

					callback(null, {'temperature' : temperature.toFixed(1), 'humidity' : humidity.toFixed(1)});
				});
			},
			function(callback) {
				console.log('enableBarometricPressure');
				sensorTag.enableBarometricPressure(callback);
			},
			function(callback) {
				setTimeout(callback, 2000);
			},
			function(callback) {
					console.log('readBarometricPressure');
					sensorTag.readBarometricPressure(function(error, pressure) {
						console.log('\tpressure = %d mBar', pressure.toFixed(1));

					callback(null, {'pressure' : pressure.toFixed(1)});
					});
			},
			function(callback) {
				console.log('enableLuxometer');
				sensorTag.enableLuxometer(callback);
			},
			function(callback) {
				setTimeout(callback, 2000);
			},
			function(callback) {
				console.log('readLuxometer');
				sensorTag.readLuxometer(function(error, lux) {
					console.log('\tlux = %d', lux.toFixed(1));
							callback(null, {'lux' : lux.toFixed(1)});
				});
			}
		],
		function(err, results){
			results = _.compact(results);
			var data = {};
			results.forEach(function(element, index){
				_.merge(data, element);
			});
			data['device'] = data['id'];
			delete data['id'];
			console.log(JSON.stringify(data));
			sensorTag.disconnect();
		}
	);
}

discoverNextDevice();
