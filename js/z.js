var z = {
	canvasWidth: 0,
	canvasHeight: 0,
	log: '',
	scale: 5, // 5m per pixel
	canvas: null,
	animate: null,
	isRunning: false,
	hasfocus: null,
	guid: 0,
	
	humanRecognitionRange: 1, // humans recognize zombies
	zombieRecognitionRange: 10, // zombies recognize humans
	sightRange: 20, // range of humanoid vision
	fieldOfView: 2.094, // 120 degrees field of vision
	flockAngle: 0,
	
	currentTurn: 0,
	frameCounter: 0,
	turns: null,
	interval: 20,
	foodAvailability: 0, // not used yet
	hidingPlaceFrequency: 0, // not used yet
	zombificationDuration: 3 * 3600, // 3 hours
	
	/* time stats: these are used throughout to measure and recalibrate the simulation's performance. The underlying rule is that we try to run as fast as possible (for the highest granularity), and then measure how fast we're actually going, then re-calculate physics based on the desired time-lapse and actual performance */
	timeLapseFactor: 300, // how many simulated seconds pass in one real-world second
	simulatedTimeElapsed: 0, // used for custom timeouts and perf measurements
	lastTurnDuration: null, // used to recalibrate; real seconds per turn
	actualTurnsPerSecond: null, // real time -- used to measure performance
	secondsPerTurn: function () {	// these are simulated seconds per turn
		if (z.actualTurnsPerSecond === null)
		{
			return z.interval * z.timeLapseFactor / 1000;
		}
		else
		{
			return z.timeLapseFactor / z.actualTurnsPerSecond;
		}
	},
	
	// human characteristics
	humanStartingPopulation: 1000,
	humanBaseRunSpeed: function () {
		return (4800 / 3600);
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
		return (1600 / 3600);
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

z.message = function (msg) {
	$('#messages p').html('<span id="msg"><strong>' + msg + '</strong></span>&nbsp;');
	z.log += msg + '\n';
	var messageTimeout = setTimeout(function () {
		$('#messages p #msg').fadeOut(1000);
		}, 1000);
};


/* this is a custom version of settimeout, designed to account for the pauses in the simulation. 
	It checks against the game's time elapsed (in seconds), which doesn't increment when paused */ 
z.setTimeout = function (fn, t) {
	var timer = {}, 
		start = z.simulatedTimeElapsed;
	
	timer.run = null;
	
	timer.go = (function () {
		timer.run = setInterval(function () {
			if (z.simulatedTimeElapsed >= start + t) {
				fn();
				clearInterval(timer.run);
			}
		},100);
	})();
	
	return timer;
};

z.advanceTurn = function () {
	var hcount = z.humans.length,
		zcount = z.zombies.length;
	
	z.currentTurn++;
	z.simulatedTimeElapsed += Math.round(z.secondsPerTurn()*1000)/1000;
	
	// natural births & deaths
	if (Math.random() < (((hcount / 1000) * z.naturalbirthrate * z.secondsPerTurn()) / (86400 * 365))) 
	{
		z.humans.push(z.human({position: {}}));
		z.message('natural birth');
		z.stats.hBirths++;
	}
	if (Math.random() < (((hcount / 1000) * z.naturaldeathrate * z.secondsPerTurn()) / (86400 * 365))) 
	{
		z.humans.pop();
		z.message('natural death');
		z.stats.hNaturalDeaths++;
	}
	
	// check for dead humans, and remove them before creating the set
	for (var j = 0; j < hcount; j++) 
	{
		if (z.humans[j].nextAction() === 'die') 
		{
			// remove them from the population
			z.humans.splice(j,1);
			hcount -= 1;
			j -= 1;
			z.stats.hKilled++;
		}
	}
	
	// check for destroyed zombies, and remove them before creating the set
	for (var k = 0; k < zcount; k++) 
	{
		if (z.zombies[k].nextAction() === 'die') 
		{
			// remove them from the population
			z.zombies.splice(k,1);
			z.stats.zDestroyed++;
			zcount -= 1;
			k -= 1;
		}
	}
	
	// make the set of humanoids who will act in the next turn
	z.neighbors = z.humans.concat(z.zombies);
	z.neighbors = z.mergeSort(z.neighbors, 'x');
	
	// here is the start of the main loop through the humanoids, calculating influences and choices and performing actions for the turn
	for (var index = 0; index < z.neighbors.length; index++) {
		var humanoid = z.neighbors[index],
			proximityFail = false,
			neighborIndex = 0,
			distance = 0,
			neighbor = null;

		
		// if the humanoid is fighting and their target is still in range, we skip all other influence checks -- this means that targets are sticky
		if (humanoid.currentTarget !== null) 
		{
			distance = z.range(humanoid, humanoid.currentTarget);
		}
		
		if (humanoid.currentTarget !== null && distance <= 1) 
		{
			humanoid.actionQueue = ['fight'];
		} 
		else
		{
			humanoid.heading = humanoid.chooseDirection();
			
			proximityFail = false;
			neighborIndex = index + 1;
			
			while (proximityFail === false)
			{
				neighbor = z.neighbors[neighborIndex];
				if (neighborIndex >= z.neighbors.length)
				{
					proximityFail = true;
				}
				// if x is out of range then we can exit this loop
				else if (Math.abs(humanoid.position.x - neighbor.position.x) > z.sightRange)
				{
					proximityFail = true;
				}
				// if y is out of range then we don't need to check them
				else if (Math.abs(humanoid.position.y - neighbor.position.y) <= z.sightRange)
				{
					z.interact(humanoid, neighbor);
				}
				
				neighborIndex++;
			}
			
			proximityFail = false;
			neighborIndex = index - 1;
			
			while (proximityFail === false)
			{
				neighbor = z.neighbors[neighborIndex];
				if (neighborIndex < 0)
				{
					proximityFail = true;
				}
				// if x is out of range then we can exit this loop
				else if (Math.abs(humanoid.position.x - neighbor.position.x) > z.sightRange)
				{
					proximityFail = true;
				}
				// if y is out of range then we don't need to check them
				else if (Math.abs(humanoid.position.y - neighbor.position.y) <= z.sightRange)
				{
					z.interact(humanoid, neighbor);
				}
				
				neighborIndex--;
			}
		}
		
		switch (humanoid.nextAction())
		{
			case 'run':
				// convert heading to dx and dy
				humanoid.chooseNextMove();
				// move the humanoid
				humanoid.move();
				break;
			case 'fight':
				z.fight(humanoid, humanoid.currentTarget);
				break;
			default: 
				// convert heading to dx and dy
				humanoid.chooseNextMove();
				// move the humanoid
				humanoid.move();
		}
				
		// reset run speed
		humanoid.runspeed = humanoid.maxRunSpeed;
	
		// clear the current action	
		humanoid.actionQueue.shift();
	
	}
	
	// increment zombie recognition range until 10m
	if (z.humanRecognitionRange < 10)
	{
		z.humanRecognitionRange += (9 * z.secondsPerTurn()) / 3 * 1440 * 60; // this will take 3 days to get from 1 to 10m
	}
	
	// update the timer displayed by the simulation
	z.updateTimer();
};