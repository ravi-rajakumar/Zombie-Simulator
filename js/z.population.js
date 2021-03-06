z.humanoid = function (spec) {
	var that = {};
	
	that.actionQueue = [];
	
	that.clearActionQueue = function () {
		if (!that.dead) {
			that.actionQueue = [];
		}
	};
	
	that.setActionQueue = function (list) {
		if (!that.dead) {
			that.actionQueue = list;
		}
	};
	
	that.pushActionQueue = function (item) {
		if (!that.dead) {
			that.actionQueue.push(item);
		}
	};
	
	that.shiftActionQueue = function () {
		if (!that.dead) {
			return that.actionQueue.shift();
		} else {
			return 'die';
		}
	};
	
	that.currentTarget = null;
	
	that.dead = false;
	
	that.lastActionTimeStamp = z.simulatedTimeElapsed;
	
	that.heading = spec.heading || Math.random() * Math.PI * 2;
	that.speedVariance = Math.random() / 5 + 0.9;
	that.maxWalkingSpeed = spec.maxWalkingSpeed || that.speedVariance * z.humanBaseWalkingSpeed();
	that.walkingSpeed = that.maxWalkingSpeed;
	
	that.position = {
		x: (spec.position.x) ? spec.position.x : Math.random() * z.canvasWidth * z.scale,
		y: (spec.position.y) ? spec.position.y : Math.random() * z.canvasHeight * z.scale
	};
	
	that.nextMove = {
		dx: 0,
		dy: 0
	};
	
	that.bearing = function (target, distance) {
		var	diffX = target.position.x - that.position.x,
			diffY = target.position.y - that.position.y, 
			range = distance || z.range(that, target),
			influence = 0, 
			angle = 0;
		// calculate the bearing to the target
		return ((diffY) >= 0) ? Math.PI - Math.asin((diffX) / range) : (Math.PI * 2 + Math.asin((target.position.x - that.position.x) / range)) % (Math.PI * 2);
	};
	
	that.isFacing = function (target, distance) {
		var	angle = Math.abs(that.heading - that.bearing(target, distance));
		
		if (angle > Math.PI) {
			angle = Math.PI * 2 - angle;
		}
		
		return angle <= z.fieldOfView / 2;		
	};
	
	that.face = function (target, distance) {
		that.heading = that.bearing(target, distance);
	};
	
	that.setPosition = function (x, y) {
		that.position.x = x;
		that.position.y = y;
	};
	
	that.adjustHeading = function () {
		/*
		 * direction is in radians clockwise, North = 0
		 *
		 */
		// random deviation from existing heading, so humans will tend to keep going more or less in the direction they are already going unless they encounter an influence. If they are under an influence then they deviate less from their current path.
		if (that.influences.w === 1) {
			that.heading = that.heading + (Math.random() * Math.PI / 8) - (Math.PI / 16) % (Math.PI * 2);
		} else {
			that.heading = that.heading + (Math.random() * Math.PI / 64) - (Math.PI / 128) % (Math.PI * 2);
		}
		
		// the following functions set people on headings away from the walls when they hit them
		if (that.position.x <= 0) {
			if (that.heading > Math.PI) {
				that.heading = 2 * Math.PI - that.heading; // reflect off of left
			}
		} else if (that.position.x >= (z.canvasWidth * z.scale)) {
			if (that.heading < Math.PI) {
				that.heading = 2 * Math.PI - that.heading; // reflect off of right
			}
		}
		
		if (that.position.y <= 0) {
			if (that.heading > (3 / 2 * Math.PI)) {
				that.heading = ((3 * Math.PI) - that.heading); // reflect off of top
			} else if (that.heading < (Math.PI / 2)) {
				that.heading = Math.PI - that.heading; // reflect off of top
			}
		} else if (that.position.y >= (z.canvasHeight * z.scale)) {
			if (Math.PI / 2 < that.heading < Math.PI) {
				that.heading = Math.PI - that.heading; // reflect off of bottom
			} else if (Math.PI < that.heading < (3 / 2 * Math.PI)) {
				that.heading = Math.PI * 3 - that.heading; // reflect off of bottom
			}
		}
		
		return that.heading;
	};
	

	// Array of influences. Each item has an x influence, a y influence, a weight, a value for the strength of attraction/repulsion in the area, and a value for the nearest attractor's range
	that.influences = {x:0,y:0,w:1,a:0,r:20};
	
	that.lastInfluences = {x:0,y:0,w:1,a:0,r:20};
	
	that.chooseNextMove = function () {			
		var hDelta = 0, vDelta = 0;
		
		if (!that.isZombie() || (that.influences.w === 1)) {
			hDelta = Math.sin(that.heading) * that.walkingSpeed + that.influences.x;
			vDelta = 0 - (Math.cos(that.heading) * that.walkingSpeed) + that.influences.y;
		} else {
			// zombies have no memory and hence no attachment to their previous heading
			hDelta = (Math.sin(that.heading) * that.walkingSpeed * 0.1) + that.influences.x;
			vDelta = (0 - (Math.cos(that.heading) * that.walkingSpeed) * 0.1) + that.influences.y;
		}
		
		if (hDelta === 0) {
			that.heading = (vDelta > 0) ? Math.PI : 0;
		} else {
			that.heading = (hDelta > 0) ? Math.PI / 2 + Math.atan(vDelta / hDelta) : 3 * Math.PI / 2 + Math.atan(vDelta / hDelta);
		}

		that.heading = that.adjustHeading();
		
		hDelta = Math.sin(that.heading) * that.walkingSpeed;
		vDelta = 0 - Math.cos(that.heading) * that.walkingSpeed;
		
		that.nextMove.dx = hDelta * z.secondsPerTurn();
		that.nextMove.dy = vDelta * z.secondsPerTurn();
	};
	
	that.move = function () {
		var movx = that.position.x + that.nextMove.dx,
			movy = that.position.y + that.nextMove.dy;
		
		if (movx <= 0) {
			movx = 0;
		}
		
		if (movx > z.canvasWidth * z.scale) {
			movx = z.canvasWidth * z.scale;
		}
		
		if (movy <= 0) {
			movy = 0;
		}
		
		if (movy > z.canvasHeight * z.scale) {
			movy = z.canvasHeight * z.scale;
		}
		
		if (!isNaN(movx) && !isNaN(movy)) {
			that.setPosition(movx, movy);
		}
	};
	
	that.walk = function () {
		// slow down if stamina drops into negative numbers, bottoming out at -100
		if (that.stamina < 0) {
			that.walkingSpeed = that.walkingSpeed * (100 - Math.abs(that.stamina)) / 100;
		}
		// slow down around attractors
		if (that.influences.a > 0 && 10 > that.influences.r > 0.25 && !that.isZombie()) {
			that.walkingSpeed = that.walkingSpeed / (1 + (10 - that.influences.r) * 10);
		}
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
		// walking decreases stamina
		if (!that.isZombie()) {
			that.stamina -=  (z.simulatedTimeElapsed - that.lastActionTimeStamp) * 100 / 8 / 3600;
			// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
			that.slept -=  (z.simulatedTimeElapsed - that.lastActionTimeStamp) / 2;
		}
		// update the humanoid's internal timestamp
		that.lastActionTimeStamp = z.simulatedTimeElapsed;
	};
	
	that.idle = function () {
		// hang out around other humans
		that.walkingSpeed = that.walkingSpeed / (2000);
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
		// idling decreases stamina slowly
		if (!that.isZombie()) {
			that.stamina -=  (z.simulatedTimeElapsed - that.lastActionTimeStamp) * 100 / 16 / 3600;
			// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
			that.slept -=  (z.simulatedTimeElapsed - that.lastActionTimeStamp) / 2;
		}
		// update the humanoid's internal timestamp
		that.lastActionTimeStamp = z.simulatedTimeElapsed;
	};
	
	that.run = function () {
		// accelerate
		that.walkingSpeed = 3 * that.walkingSpeed;
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
		// running decreases stamina quickly
		if (!that.isZombie()) {
			that.stamina -= (z.simulatedTimeElapsed - that.lastActionTimeStamp) * 100 / 2 / 3600;
			// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
			that.slept -= (z.simulatedTimeElapsed - that.lastActionTimeStamp) / 2;
		}
		// update the humanoid's internal timestamp
		that.lastActionTimeStamp = z.simulatedTimeElapsed;
	};
	
	that.rest = function () {
		var stam = that.stamina,
			action = that.actionQueue[0];
		
		if (action !== 'die') {
			// 8 hours of rest should be sufficient to increase stamina from 0 to 100
			stam += (z.simulatedTimeElapsed - that.lastActionTimeStamp) * 100 / 8 / 3600;
			if (stam >= 100) {
				that.stamina = 100;
				// 'get up' if fully rested and awake
				if (action === 'rest' && !that.sleeping) {
					that.clearActionQueue();
				}
			} else {
				that.stamina = stam;
			}
			
			// keep resting until the current timer runs out or something else happens
			if (z.simulatedTimeElapsed < that.restStop && action !== 'rest') {
				that.setActionQueue(['rest']);
			}
			
			// keep sleeping if I already am
			// the probability that a human will fall asleep while resting increases to 100% if they have 0 sleep in the bank
			if (that.sleeping || Math.random() > that.slept / (6 * 3600)) {
				that.sleep();
			} else {
				// while humans are awake, accrued sleep decays at a rate of 1hr/2hrs awake, resulting in a natural 8 hour per day sleep schedule
				that.slept -= z.simulatedTimeElapsed - that.lastActionTimeStamp / 2;
				// 'wake up' if an influence comes close and the human is awake and not too exhausted
				if (that.influences.r < 2 && that.stamina > 0) {
					that.clearActionQueue();
				}
			}
			// update the humanoid's internal timestamp
			that.lastActionTimeStamp = z.simulatedTimeElapsed;
		}
	};
	
	that.sleep = function () {
		// check for death condition before doing anything
		if (!that.dead) {
			that.sleeping = true;
			// chance to wake up automatically if I have over 6 hours of sleep in the bank, reaching 100% at ten hours
			if (Math.random() < (that.slept / 3600 - 6) / 4) {
				that.sleeping = false;
			} else {
				that.setActionQueue(['rest']);
				that.slept += z.simulatedTimeElapsed - that.lastActionTimeStamp;
			}
			// update the humanoid's internal timestamp
			that.lastActionTimeStamp = z.simulatedTimeElapsed;
		}
	};
	
	that.doNext = function () {
		var nxt = that.nextAction();
		switch (nxt) {
			case 'idle':
				that.idle();
				break;
			case 'rest':
				that.currentTarget = null;
				that.rest();
				break;
			case 'walk':
				that.walk();
				break;
			case 'run':
				if (that.stamina > 0) {
					that.run();
				} else {
					that.walk();
				}
				break;
			case 'stunned':
				// do nothing
				break;
			case 'die':
				// make sure the die message isn't removed through race conditions
				that.actionQueue = ['die'];
				break;
			case 'fight':
				z.fight(that, that.currentTarget);
				break;
			default: 
				that.idle();
		}
				
		// reset walking speed
		that.walkingSpeed = that.maxWalkingSpeed;
	};
	
	that.isZombie = function () {
		return !(this.hasOwnProperty('zombify'));
	};
	
	return that;
};

z.human = function (spec) {
	var that = z.humanoid(spec),
			grayValue = Math.round(Math.random() * 67) + 100;
	
	that.maxWalkingSpeed = spec.maxWalkingSpeed ? spec.maxWalkingSpeed : (Math.random() / 5 + 0.9) * z.humanBaseWalkingSpeed();
	
	that.walkingSpeed = that.maxWalkingSpeed;

	that.guid = z.guid += 1;
	
	that.recognitionRange = 1;
	
	that.herding = function () {
		return z.humanHerding;
	};
	
	that.queueing = function () {
		return z.humanQueueing;
	};
	
	// ranges from 0 - 1 with start values euqal to the base aggressiveness in the config settings +/- 10% in random variation. humans who successfully kill zombies will become increasingly aggressive toward them
	that.aggressiveness = ((Math.random() * 0.2) + 0.9) * z.humanBaseAgressiveness; 
	
	// heroism will cancel out at most one zombie repulsion, allowing the human to gravitate toward and save another human if the zombie is attacking one. It's expended the first time it is used and then reset at the start of each turn. It's also used to overcome the human's instinct to run away from attacking zombies
	that.maxHeroism = Math.random();
	
	that.heroism = that.maxHeroism;
	
	that.showHeroism = function () {
		var ret = that.heroism;
		that.heroism = 0;
		return ret;
	};
	
	that.resetHeroism = function () {
		that.heroism = that.maxHeroism;
	};
	
	// stamina is used to determine the human's desire to 'rest'. It can have a negative value, and a max positove value of 100. Negative values mean that the human is incapable of running and will choose to rest if they are not being actively chased. The human's walking speed will also be increasingly impeded by negative stamina.  
	that.stamina = Math.random() * 67 + 33;
	
	// returns the greater value
	that.recognizes = function (neighbor) {
		return (that.recognitionRange > z.humanRecognitionRange) ? z.range(that, neighbor) <= that.recognitionRange : z.range(that, neighbor) <= z.humanRecognitionRange;	
	};
	
	// this will increase quickly as the human survives fights
	that.zombieKillingFitness = 0.01; 
	
	that.livetimer = null;
	
	that.deadtimer = null;
	
	// initialize banked sleep at around 5 hours (+/- 10%)
	that.slept = (Math.random() * 0.2 + 0.9) * 5 * 3600;
	
	// everyone starts off awake
	that.sleeping = false;
	
	that.restStop = 0;
	
	that.color = 'rgb(' + grayValue + ',' + grayValue + ',' + grayValue + ')';
	
	that.zombifyMsg = 'live-turn';
	
	that.zombify = function () {
		if (that.deadtimer === null && that.livetimer === null) {
			z.zombiesQueued += 1;
			that.livetimer = z.setTimeout(function() {
				that.setActionQueue(['die']);
				that.dead = true;
				z.zombies.push(z.zombie(that));
				z.stats.hZombified += 1;
				z.message(that.zombifyMsg);				
				z.updateStatistics();
			}, z.zombificationDuration, that.guid);
			z.timers.push(that.livetimer);
			that.color = 'rgb(30,30,' + (grayValue+50) + ')';
		}
	};
		
	that.die = function () {		
		that.setActionQueue(['die']);
		that.dead = true;
		
		// this gets set right away because getting killed overrides any pending 'live-turn' event
		that.zombifyMsg = 'dead-turn';
		
		if (that.deadtimer === null && that.livetimer === null) {
			z.zombiesQueued += 1;
			that.deadtimer = z.setTimeout(function() {
				z.zombies.push(z.zombie(that));
				z.stats.hZombified += 1;
				z.message(that.zombifyMsg);
				z.updateStatistics();
			}, z.zombificationDuration, that.guid);
			z.timers.push(that.deadtimer);
		}		
		
		// remove this function so that it can't be called again
		that.die = function () {};
	};
	
	that.toString = function () {
		return '{"human": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
	
	// choice algorithm here corresponds to conscious decision-making
	that.nextAction = function () {
		// this trumps everything
		if (that.dead) {
			return 'die';
			
		} else if (that.actionQueue.length > 0) {
			return that.shiftActionQueue();
			
		// if they are sleeping they will keep sleeping
		} else if (that.sleeping) {
			return 'rest';
			
		// if they haven't slept in a long time or they are very tired, they will rest regardless of other human influences
		} else if (that.stamina <= 0 || that.slept <= 0) {
			that.restStop = z.simulatedTimeElapsed + (Math.random() * 0.2 + 0.9) * 2 * 3600;
			return 'rest';
			
		// if they are tired and not interacting with anyone, humans will choose a couple of hours of rest over walking or idling
		} else if (that.stamina < 50 && that.influences.w === 1) {
			that.restStop = z.simulatedTimeElapsed + (Math.random() * 0.2 + 0.9) * 2 * 3600;
			return 'rest';
			
		// humans get bored if they idle for too long
		} else if (Math.random() < z.humanBoredomFactor() * z.secondsPerTurn()) {
			that.heading = (that.heading + Math.PI) % (Math.PI * 2);
			return 'walk';
			
		// if they aren't bored yet and  they are in the presence of attractors at mingling range, humans will idle 
		} else if (that.influences.a > 0 && that.influences.r < 2) {
			return 'idle';
			
		// if they are fairly well-rested and not yet mingling with other friendly influences they will wander around
		} else {
			return 'walk';
		}
	};
	
	return that;
};

z.zombie = function (spec) {
	var that = z.humanoid(spec);
	
	that.maxWalkingSpeed = spec.maxWalkingSpeed ? spec.maxWalkingSpeed / 3 : (Math.random() / 5 + 0.9) * z.zombieBaseWalkingSpeed();
	that.walkingSpeed = that.maxWalkingSpeed;
	
	that.guid = spec.guid ? spec.guid : z.guid += 1;
	
	that.color = 'rgb(' + (Math.round(Math.random() * 40) + 200) + ', 30, 30)';
	
	that.herding = function () {
		return z.zombieHerding;
	};
	
	that.queueing = function () {
		return z.zombieQueueing;
	};
	
	that.recognitionRange = 20;
	
	that.recognizes = function (neighbor) {
		return that.recognitionRange > z.range(that, neighbor);	
	};
	
	that.chasing = false;
	
	// zombie stamina is always 100%
	that.stamina = 100;
	
	that.toString = function () {
		return '{"zombie": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
		
	that.die = function () {
		that.setActionQueue(['die']);
		that.dead = true;
	};
	
	that.nextAction = function () {
		if (that.actionQueue.length > 0) {
			return that.shiftActionQueue();
		} else {
			return 'walk';
		}
	};
	
	return that;
};