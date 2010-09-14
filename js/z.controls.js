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
}

z.updateStatistics = function () {
	$('#humans span').text(z.humans.length);
	$('#zombies span').text(z.zombies.length);
	
	$('#tps').text(z.performance.getTPS());
	$('#fps').text(z.performance.getFPS());
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
			
			zombiePopulation: $('#zombie-population').val(),
			zombieHerding: $('#zombie-herding').val(),
			zombieBrainEatingEfficiency: $('#zombie-brain-eating-efficiency').val(),
			
			timeLapseFactor: $('#time-lapse-factor').val()
		};
		
		z.init(spec);
	});
	
	$('#stop').live('click', function (event) {
		z.stop();
	});
	
	$('#play').live('click', function (event) {
		z.play();
	});
	
	$('#control-switch').live('click', function (event) {
		var text = $(this).text()
		
		if (text.indexOf('-') > -1)
		{
			$(this).text('[+] settings')
		}
		else
		{
			$(this).text('[-] settings')
		}
		
		controls.toggle('fast');
	});
	
	$(this).keypress(function(event) {
		if ((event.keyCode == '32') && !z.isRunning) {
			z.play();
		} else if ((event.keyCode == '32') && z.isRunning) {
			z.stop();
		}
	});
	
	controls.toggle('slow');
});