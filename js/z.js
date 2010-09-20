var z = {
	canvasWidth: 0,
	canvasHeight: 0,
	log: '',
	scale: 5, // 5m per pixel
	canvas: null,
	animate: null,
	isRunning: false,
	hasfocus: null,
	
	humanRecognitionRange: 1, // humans recognize zombies
	zombieRecognitionRange: 10, // zombies recognize humans
	sightRange: 20, // range of humanoid vision
	fieldOfView: 2.094, // 120 degrees field of vision
	flockAngle: 0,
	
	turns: null,
	interval: 20,
	foodAvailability: 0, // not used yet
	hidingPlaceFrequency: 0, // not used yet
	zombificationDuration: 3 * 3600, // 3 hours
	
	timeLapseFactor: 300, // how many simulated seconds pass in one real-world second
	simulatedTimeElapsed: 0,
	lastTPS: null, // used to recalibrate speed
	actualTPS: null, // used to measure performance
	secondsPerTurn: function () {
		if (z.actualTPS === null)
		{
			return z.interval * z.timeLapseFactor / 1000;
		}
		else
		{
			return z.timeLapseFactor / z.actualTPS;
		}
	},
	
	// human characteristics
	humanStartingPopulation: 1000,
	humanBaseRunSpeed: function () {
		return 4800 / 3600 * z.secondsPerTurn();
	},
	humanHerding: 0.5,
	humanQueueing: 0.2,
	humanDefenseEfficiency: 1,	// not used yet
	humanAgressiveness: 1,
	humanStaminaCoefficient: 1,
	humanHungerCoefficient: 1,
	naturalbirthrate: 14,	// per 1k, per year
	naturaldeathrate: 8,	// per 1k, per year
	
	// zombie characteristics
	zombieStartingPopulation: 1,
	zombieBaseRunSpeed: function () {
		return 1600 / 3600 * z.secondsPerTurn();
	},
	zombieHerding: 0.5,
	zombieQueueing: 1,
	zombieBrainEatingEfficiency: 1,
	
	// populations
	humans: [],
	zombies: [],
	neighbors: []
};

z.init = function (spec) {
	z.humans = [];
	z.zombies = [];
	z.log = '';
	var i,j;
	
	z.canvas = document.getElementById('zombie-world');
	
	z.scale = spec.scale;
	z.canvasWidth = z.canvas.width;
	z.canvasHeight = z.canvas.height;
	
	z.humanStartingPopulation = spec.humanPopulation;
	z.humanHerding = spec.humanHerding;
	z.humanQueueing = spec.humanQueueing;
	
	z.zombieStartingPopulation = spec.zombiePopulation;
	z.zombieHerding = spec.zombieHerding;
	z.zombieBrainEatingEfficiency = spec.zombieBrainEatingEfficiency;
	
	z.timeLapseFactor = spec.timeLapseFactor;
	z.simulatedTimeElapsed = 0;
	
	for (i = 0; i < z.humanStartingPopulation; i++)
	{
		z.humans.push(z.human({position: {}}));
	}
	
	for (j = 0; j < z.zombieStartingPopulation; j++)
	{
		z.zombies.push(z.zombie(z.human({position: {}})));
	}
	
	z.draw();
	
	z.updateTimer();
};

z.updateSettings = function () {
	z.humanHerding = $('#human-herding').val();
	z.humanQueueing = $('#human-queueing').val();
	z.zombieHerding = $('#zombie-herding').val();
	z.zombieBrainEatingEfficiency = $('#zombie-brain-eating-efficiency').val();
	z.timeLapseFactor = $('#time-lapse-factor').val();
};

z.message = function (msg) {
	$('#messages p').html('<span id="msg"><strong>' + msg + '</strong></span>&nbsp;');
	z.log += msg + '\n';
	var messageTimeout = setTimeout(function () {
		$('#messages p #msg').fadeOut(1000);
		}, 1000);
};

z.advanceTurn = function () {
	var action,
		hcount = z.humans.length,
		zcount = z.zombies.length;
		
	z.simulatedTimeElapsed += Math.round(z.secondsPerTurn());
	
	// natural births & deaths
	if (Math.random() < (((hcount / 1000) * z.naturalbirthrate * z.secondsPerTurn()) / (86400 * 365))) 
	{
		z.humans.push(z.human({position: {}}));
		z.message('natural birth');
	}
	if (Math.random() < (((hcount / 1000) * z.naturaldeathrate * z.secondsPerTurn()) / (86400 * 365))) 
	{
		z.humans.pop();
		z.message('natural death');
	}
	
	z.neighbors = z.humans.concat(z.zombies);
	z.neighbors = z.mergeSort(z.neighbors, 'x');
	
	for (var j = 0; j < hcount; j++) 
	{
		action = z.humans[j].nextAction();
		if (action === 'die') 
		{
			// remove them from the population
			z.humans.splice(j,1);
			hcount -= 1;
			j -= 1;
		}
		else 
		{
			z.humans[j].actionQueue.push(action); // put the action back in the queue
		}
	}
	
	// check for destroyed zombies
	for (var k = 0; k < zcount; k++) 
	{
		action = z.zombies[k].nextAction();
		if (action === 'die') 
		{
			// remove them from the population
			z.zombies.splice(k,1);
			zcount -= 1;
			k -= 1;
		}
		else 
		{
			z.zombies[k].actionQueue.push(action); // put the action back in the queue
		}
	}
	
	$.each(z.neighbors, function (index, humanoid) {
		var proximityFail = false,
			neighborIndex = 0,
			action = humanoid.nextAction(),
			distance = 0,
			neighbor = null;
	
		humanoid.heading = humanoid.chooseDirection();
		
		proximityFail = false;
		neighborIndex = index + 1;
		
		while (proximityFail === false)
		{
			if (neighborIndex >= z.neighbors.length)
			{
				proximityFail = true;
			}
			else if (Math.abs(humanoid.position.x - z.neighbors[neighborIndex].position.x) > z.sightRange)
			{
				proximityFail = true;
			}
			else
			{
				neighbor = z.neighbors[neighborIndex];
				
				distance = z.range(humanoid, neighbor);
				
				if (distance <= 1 && humanoid.isZombie() && !neighbor.isZombie())
				{
					humanoid.targetCount += 1;
					neighbor.targetCount += 1;
					z.fight(neighbor, humanoid);
				}
				
				if (distance === 0)
				{
					humanoid.heading = z.flockAngle;
					
					z.flockAngle = (z.flockAngle + Math.PI / 3) % (2 * Math.PI);
				}
				else if (distance < z.sightRange)
				{
					z.humanoidInfluence(humanoid, neighbor, distance);
				}
			}
			
			neighborIndex++;
		}
		
		proximityFail = false;
		neighborIndex = index - 1;
		
		while (proximityFail === false)
		{
			if (neighborIndex < 0)
			{
				proximityFail = true;
			}
			else if (Math.abs(humanoid.position.x - z.neighbors[neighborIndex].position.x) > z.sightRange)
			{
				proximityFail = true;
			}
			else
			{
				neighbor = z.neighbors[neighborIndex];
				
				distance = z.range(humanoid, neighbor);
				
				if (distance <= 1 && humanoid.isZombie() && !neighbor.isZombie())
				{
					humanoid.targetCount += 1;
					neighbor.targetCount += 1;
					z.fight(neighbor, humanoid);
				}
				if (distance === 0)
				{
					humanoid.heading = z.flockAngle;
					
					z.flockAngle = (z.flockAngle + Math.PI / 3) % (2 * Math.PI);
				}
				else if (distance < z.sightRange)
				{
					z.humanoidInfluence(humanoid, neighbor, distance);
				}
			}
			
			neighborIndex--;
		}
	
		if (action === 'run')
		{			
			// convert heading to dx and dy
			humanoid.chooseNextMove();
			
			// move the humanoid
			humanoid.move();
			
			// reset it's runSpeed if it was changed by the influence function
			humanoid.runSpeed = humanoid.maxRunSpeed;
		}
	});
	
	// increment zombie recognition range until 10m
	if (z.humanRecognitionRange < 10)
	{
		z.humanRecognitionRange += 9 / 4320; // this will take 3 days to get from 1 to 10m
	}
	
	// update the statistics displayed by the simulation
	z.updateStatistics();
	
	// update the timer displayed by the simulation
	z.updateTimer();
};

z.play = function () {
	if (z.humans.length < 1 && z.zombies.length < 1)
	{
		$('#settings').submit();
	}
	
	z.stop();
	z.performance.init();
	
	z.turns = setInterval(function () {
		z.performance.logTPS(z.advanceTurn);
	}, z.interval);
	
	z.animate = setInterval(function () {
		z.performance.logFPS(z.draw);
	}, 30);
	
	z.isRunning = true;
};

z.stop = function () {
	clearInterval(z.turns);
	clearInterval(z.animate);
	
	z.isRunning = false;
};