z.updateTimer = function () {
	var seconds = Math.floor(z.simulatedTimeElapsed % 60);
	var minutes = Math.floor((z.simulatedTimeElapsed % 3600) / 60);
	
	$('#days').text(
		Math.floor(z.simulatedTimeElapsed / 86400) + ' days,'
	);
	
	$('#hours').text(
		Math.floor((z.simulatedTimeElapsed % 86400) / 3600) + ' hours,'
	);
	
	$('#minutes').text(minutes + ' minutes,');
	
	if (z.isRunning) {
		seconds = (seconds < 10) ? '0' + seconds : seconds;
	}
	
	$('#seconds').text(seconds + ' seconds');
};

z.updateRates = function () {	
	$('#tps').text(z.performance.getTPS());
	$('#fps').text(z.performance.getFPS());
};

z.updateStatistics = function () {
	$('#humans span').text(z.humans.length);
	$('#zombies span').text(z.zombies.length);
	$('#hkilled span').text(z.stats.hKilled);
	$('#zdestroyed span').text(z.stats.zDestroyed);
	$('#hzombified span').text(z.stats.hZombified);
	$('#hbirths span').text(z.stats.hBirths);
	$('#hnaturaldeaths span').text(z.stats.hNaturalDeaths);
};

z.updateSettings = function () {
	z.humanHerding = $('#human-herding').val();
	z.humanQueueing = $('#human-queueing').val();
	z.zombieHerding = $('#zombie-herding').val();
	z.zombieQueueing = $('#zombie-queueing').val();
	z.zombieBrainEatingEfficiency = $('#zombie-brain-eating-efficiency').val();
	z.timeLapseFactor = $('#time-lapse-factor').val();
};

z.play = function () {
	z.stop();
	z.performance.init();
	
	z.turns = setInterval(function () {
		z.performance.logTPS(z.advanceTurn);
	}, z.interval);
	
	z.animate = setInterval(function () {
		z.draw();
	}, 17);
	
	z.isRunning = true;
};

z.stop = function () {
	clearInterval(z.turns);
	clearInterval(z.animate);
	
	z.isRunning = false;
};

z.complete = function (extinct) {
	z.stop();
	var msg = 'Simulation ended. ' + extinct + ' extinct after ' + $('#days').text() + ' ' + $('#hours').text() + ' ' + $('#minutes').text() + ' ' + $('#seconds').text();
	$('#messages p').html('<strong>' + msg + '</strong>&nbsp;');
	z.log += msg + '\n';
};

$(document).ready(function ($) {
	var controls = $('#controls-human, #controls-zombie, #controls-general');
	
	$('#settings').live('submit', function (event) {
		event.preventDefault();
		z.stop();
		
		var spec = {
			scale: $('#scale').val(),
			
			humanPopulation: $('#human-population').val(),
			humanHerding: $('#human-herding').val(),
			humanQueueing: $('#human-queueing').val(),
			humanAggressiveness: $('#human-aggressiveness').val(),
			
			zombiePopulation: $('#zombie-population').val(),
			zombieHerding: $('#zombie-herding').val(),
			zombieQueueing: $('#zombie-queueing').val(),
			zombieBrainEatingEfficiency: $('#zombie-brain-eating-efficiency').val(),
			
			timeLapseFactor: $('#time-lapse-factor').val()
		};
			
		$('#hstart span').text($('#human-population').val());
		$('#zstart span').text($('#zombie-population').val());
		
		z.init(spec);
	});
	
	$('#stop').live('click', function (event) {
		z.stop();
	});
	
	$('#play').live('click', function (event) {
		z.play();
	});
	
	$('#control-switch').live('click', function (event) {
		var text = $(this).text();
		
		if (text.indexOf('-') > -1) {
			$(this).text('[+] settings');
			controls.toggle('fast', function () {$('#config').hide();});
		} else {
			$(this).text('[-] settings');
			$('#config').show();
			controls.toggle('fast');
		}
		
	});
	
	$('#stats-switch').live('click', function (event) {
		var text = $(this).text();
		
		if (text.indexOf('-') > -1) {
			$(this).text('[+] stats');
		} else {
			$(this).text('[-] stats');
		}
		
		$('#stats').toggle('fast');
	});
	
	$(this).keypress(function(event) {
		if ((event.keyCode == '32') && !z.isRunning) {
			z.play();
		} else if (event.keyCode == '13') {
			$('#control-switch').click();
			$(z.hasfocus).change();
			return false;
		} else if ((event.keyCode == '32') && z.isRunning) {
			z.stop();
		}
	});
	
	$('#config input').focus(function () {
		z.hasfocus = this;
	});
	
	$('#config input').change(function () {
		z.updateSettings();
	});

	controls.toggle('slow');
	
	$('#settings').submit();
});