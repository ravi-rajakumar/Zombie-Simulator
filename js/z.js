var z = {
	version: "1.0.5",
	canvasWidth: 0,
	canvasHeight: 0,
	inspectorUp: false,
	keys: [],
	log: '',
	scale: 5, // 5m per pixel
	canvas: null,
	animate: null,
	isRunning: false,
	hasfocus: null, // used for in-flight changes to the settings form
	guid: 0,
	context: null,
	flockAngle: 0,
	
	humanRecognitionRange: 1, // humans recognize zombies
	zombieRecognitionRange: 10, // zombies recognize humans
	sightRange: 20, // range of humanoid vision
	fieldOfView: 2.094, // 120 degrees field of vision
	hearingRange: 3, // range at which humanoids are influenced by hearing other humanoids
	
	currentTurn: 0,
	frameCounter: 0,
	turns: null,
	interval: 20,
	foodAvailability: 0, // not used yet
	hidingPlaceFrequency: 0, // not used yet
	zombificationDuration: 3 * 3600, // 3 hours
	
	/* time stats: these are used throughout to measure and recalibrate the simulation's performance. The underlying rule is that we try to run as fast as possible (for the highest granularity), and then measure how fast we're actually going, then re-calculate physics based on the desired time-lapse and actual performance */
	timeLapseFactor: 100, // how many simulated seconds pass in one real-world second
	simulatedTimeElapsed: 0, // used for custom timeouts and perf measurements
	actualTurnsPerSecond: null, // real time -- used to measure performance
	secondsPerTurn: function () {	// these are simulated seconds per turn
		if (z.actualTurnsPerSecond === null ||  z.actualTurnsPerSecond === 0) {
			return z.interval * z.timeLapseFactor / 1000;
		} else {
			return z.timeLapseFactor / z.actualTurnsPerSecond;
		}
	},
	
	// used to generate an aversion to overcrowding. With human herding set at 1, maxAttraction theoretically equates to the max # of visible influences within 20 meters (max), after which humans are repelled by one another. 
	maxCrowding: 0.25,
	maxAttraction: 105,
	
	// human characteristics
	humanStartingPopulation: 1000,
	humanBaseWalkingSpeed: function () {
		return (4800 / 3600);
	},
	humanHerding: 0.5,
	humanQueueing: 0.2,
	humanBaseAgressiveness: 0,
	humanStaminaCoefficient: 1,
	humanHungerCoefficient: 1,
	// this generates a 75% chance of being bored within 2 hours
	humanBoredomFactor: function () {
		return 0 - (Math.log(0.25) * z.secondsPerTurn() / 7200);
	},
	naturalbirthrate: 14,	// per 1k, per year
	naturaldeathrate: 8,	// per 1k, per year
	
	// zombie characteristics
	zombieStartingPopulation: 1,
	zombieBaseWalkingSpeed: function () {
		return (1600 / 3600);
	},
	zombieHerding: 0.5,
	zombieQueueing: 1,
	zombieBrainEatingEfficiency: 50,
	zombiesQueued: 0,
	zombiesCanceled: 0,
	zombiesPending: function () {
		return z.zombiesQueued - z.stats.hZombified - z.zombiesCanceled;
	},
	
	// populations
	humans: [],
	zombies: [],
	timers: [],
	neighbors: [],
	extinct: "neither",
	dataIsValid: true
};

z.init = function (spec) {
	z.humans = [];
	z.zombies = [];
	z.resetStats();
	z.zombiesQueued = 0;
	z.zombiesCanceled = 0;
	z.currentTurn = 0;
	z.frameCounter = 0;
	z.simulatedTimeElapsed = 0;
	z.log = '';
	$('#messages p').html('&nbsp;');
	var i,j;
	
	z.canvas = document.getElementById('zombie-world');
	z.context = z.canvas.getContext('2d');
	
	z.scale = spec.scale;
	z.canvasWidth = z.canvas.width;
	z.canvasHeight = z.canvas.height;
	if (z.inspectorUp) {
		z.hideInspector();
	}
	
	z.maxCrowding = spec.maxCrowding;
	// factors scale, sight range and field of view into crowding behavior
	z.maxAttraction = z.maxCrowding * Math.pow(z.sightRange,2) * z.fieldOfView / 2; 
	
	z.humanStartingPopulation = spec.humanPopulation;
	z.humanHerding = spec.humanHerding;
	z.humanQueueing = spec.humanQueueing;
	z.humanBaseAgressiveness = spec.humanAggressiveness;
	
	z.zombieStartingPopulation = spec.zombiePopulation;
	z.zombieHerding = spec.zombieHerding;
	z.zombieQueueing = spec.zombieQueueing;
	z.zombieBrainEatingEfficiency = spec.zombieBrainEatingEfficiency;
	
	z.timeLapseFactor = spec.timeLapseFactor;
	z.simulatedTimeElapsed = 0;
	
	// clear any residual timers from previous runs
	if (z.timers.length > 0) {
		for (var k = 0, len = z.timers.length; k < len; k++) {
			z.clearTimeout(z.timers[k]);
		}
		z.timers = [];
	}
	
	z.extinct = "neither";
	z.dataIsValid = true;
	
	for (i = 0; i < z.humanStartingPopulation; i++) {
		z.humans.push(z.human({position: {}}));
	}
	
	for (j = 0; j < z.zombieStartingPopulation; j++) {
		z.zombies.push(z.zombie(z.human({position: {}})));
	}
	
	z.draw();
	
	z.updateTimer();
	
	z.updateStatistics();
	
	// initialize the set of humanoids who will act in the next turn
	z.neighbors = z.humans.concat(z.zombies);
	z.neighbors = z.mergeSort(z.neighbors, 'x');
};

z.advanceTurn = function () {
	var hcount = z.humans.length,
		zcount = z.zombies.length;
		
	if (zcount === 0 && z.zombiesPending() <= 0) {
		z.extinct = "Zombies";
		z.complete();
	} else if (hcount === 0) {
		z.extinct = "Humans";
		z.complete();
	}	
	
	z.currentTurn += 1;
	z.simulatedTimeElapsed += Math.round(z.secondsPerTurn()*1000)/1000;
	
	// natural births & deaths
	if (Math.random() < (((hcount / 1000) * z.naturalbirthrate * z.secondsPerTurn()) / (86400 * 365))) {
		z.humans.push(z.human({position: {}}));
		z.message('natural birth');
		z.updateStatistics();
		z.stats.hBirths += 1;
	}
	if (Math.random() < (((hcount / 1000) * z.naturaldeathrate * z.secondsPerTurn()) / (86400 * 365))) {
		var ndeath = z.humans.pop();
		ndeath.zombify = null;
		z.message('natural death');
		z.updateStatistics();
		z.stats.hNaturalDeaths += 1;
	}
	
	// check for dead humans, and remove them before creating the set
	for (var j = 0; j < hcount; j++) {
		if (z.humans[j].actionQueue[0] === 'die') {
			// remove them from the population
			z.humans.splice(j,1);
			hcount -= 1;
			j -= 1;
			z.stats.hKilled += 1;
			z.updateStatistics();
		}
	}
	
	// check for destroyed zombies, and remove them before creating the set
	for (var k = 0; k < zcount; k++) {
		if (z.zombies[k].actionQueue[0] === 'die') {
			// remove them from the population
			z.zombies.splice(k,1);
			z.stats.zDestroyed += 1;
			z.updateStatistics();
			zcount -= 1;
			k -= 1;
		}
	}
	
	// make the set of humanoids who will act in the next turn
	z.neighbors = z.humans.concat(z.zombies);
	z.neighbors = z.mergeSort(z.neighbors, 'x');
	
	// here is the start of the main loop through the humanoids, calculating influences and choices and performing actions for the turn
	for (var l = 0, m = z.neighbors.length; l < m; l++) {
		var humanoid = z.neighbors[l],
			proximityFail = false,
			neighborIndex = 0,
			distance = 0,
			neighbor = null;
		
		// record the last turn's infliuences for crowd detection
		humanoid.lastInfluences = humanoid.influences;
		
		// reset influence object at the start of every move
		humanoid.influences = {x:0,y:0,w:1,a:0,r:20};
		
		if (!humanoid.isZombie()) {
			humanoid.resetHeroism();
		}
		
		// if the humanoid is fighting and their target is still in range, we skip all other influence checks -- this means that targets are sticky
		if (humanoid.currentTarget !== null) {
			distance = z.range(humanoid, humanoid.currentTarget);
		}
		
		if (humanoid.currentTarget !== null && distance <= 1) {
			z.interact(humanoid, humanoid.currentTarget);
		} else if (!humanoid.sleeping) {
			humanoid.currentTarget = null;
			
			proximityFail = false;
			neighborIndex = l + 1;
			
			while (proximityFail === false) {
				neighbor = z.neighbors[neighborIndex];
				if (neighborIndex >= m) {
					proximityFail = true;
				// if x is out of range then we can exit this loop
				} else if (Math.abs(humanoid.position.x - neighbor.position.x) > z.sightRange) {
					proximityFail = true;
				// if y is out of range then we don't need to check them
				} else if (Math.abs(humanoid.position.y - neighbor.position.y) <= z.sightRange) {
					z.interact(humanoid, neighbor);
				}
				
				neighborIndex += 1;
			}
			
			proximityFail = false;
			neighborIndex = l - 1;
			
			while (proximityFail === false) {
				neighbor = z.neighbors[neighborIndex];
				if (neighborIndex < 0) {
					proximityFail = true;
				// if x is out of range then we can exit this loop
				} else if (Math.abs(humanoid.position.x - neighbor.position.x) > z.sightRange) {
					proximityFail = true;
				// if y is out of range then we don't need to check them
				} else if (Math.abs(humanoid.position.y - neighbor.position.y) <= z.sightRange) {
					z.interact(humanoid, neighbor);
				}
				
				neighborIndex -= 1;
			}
		}
	}
	
	for (var n = 0, o = z.neighbors.length; n < o; n++) {
		z.neighbors[n].doNext();
	}
	
	// increment zombie recognition range until 10m
	if (z.humanRecognitionRange < 10) {
		z.humanRecognitionRange += 9 * z.secondsPerTurn() / 259200; // this will take 3 days to get from 1 to 10m
	}
	
	// update the timer displayed by the simulation
	z.updateTimer();
};