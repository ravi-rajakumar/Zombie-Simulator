z.humanoid = function (spec) {
	var that = {};
	
	that.actionQueue = [];
	
	that.guid = z.guid++;
	
	that.currentTarget = null;
	
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
	
	that.setPosition = function (x, y) {
		that.position.x = x;
		that.position.y = y;
	};
	
	that.chooseDirection = function () {
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
		if (that.position.x <= 0)
		{
			that.heading = (Math.PI - that.heading) % Math.PI; // reflect off of left
		}
		else if (that.position.x >= (z.canvasWidth * z.scale))
		{
			that.heading = (2 * Math.PI - that.heading) % Math.PI + Math.PI; // reflect off of right
		}
		
		if (that.position.y <= 0)
		{
			if (that.heading > (3 / 2 * Math.PI))
			{
				that.heading = ((3 / 2 * Math.PI) - that.heading) % (3 / 2 * Math.PI); // reflect off of top
			}
			else if (that.heading < (Math.PI / 2))
			{
				that.heading = Math.PI - that.heading; // reflect off of top
			}
		}
		else if (that.position.y >= (z.canvasHeight * z.scale))
		{
			if (that.heading < Math.PI)
			{
				that.heading = that.heading % (Math.PI / 2); // reflect off of bottom
			}
			else if (that.heading < (3 / 2 * Math.PI))
			{
				that.heading = 2 * Math.PI - (that.heading % Math.PI); // reflect off of bottom
			}
		}
		
		return that.heading;
	};
	

	// Array of influences. Each item has an x influence, a y influence, a weight, a value for the strength of attraction/repulsion in the area, and a value for the nearest attractor's range
	that.influences = {x:0,y:0,w:1,a:0,r:20};
	
	that.chooseNextMove = function () {			
		var hDelta = (Math.sin(that.heading) * that.walkingSpeed + (that.influences.x * that.walkingSpeed / that.maxWalkingSpeed)) / that.influences.w,
			vDelta = (0 - (Math.cos(that.heading) * that.walkingSpeed) + (that.influences.y * that.walkingSpeed / that.maxWalkingSpeed)) / that.influences.w;
		
		that.nextMove.dx = hDelta * z.secondsPerTurn();
		that.nextMove.dy = vDelta * z.secondsPerTurn();
	};
	
	that.move = function () {
		var movx = that.position.x + that.nextMove.dx,
			movy = that.position.y + that.nextMove.dy;
		
		if (movx <= 0)
		{
			movx = 0;
			that.heading = (Math.PI - that.heading) % Math.PI;
		}
		
		if (movx > z.canvasWidth * z.scale)
		{
			movx = z.canvasWidth * z.scale;
		}
		
		if (movy <= 0)
		{
			movy = 0;
			if (that.heading > (3 / 2 * Math.PI))
			{
				that.heading = ((3 / 2 * Math.PI) - that.heading) % (3 / 2 * Math.PI); // reflect off of top
			}
			else if (that.heading < (Math.PI / 2))
			{
				that.heading = Math.PI - that.heading; // reflect off of top
			}
		}
		
		if (movy > z.canvasHeight * z.scale)
		{
			movy = z.canvasHeight * z.scale;
		}
		
		that.setPosition(movx, movy);
	};
	
	that.walk = function () {
		// slow down around attractors
		if (that.influences.a > 0 && 10 > that.influences.r > 0.25 && !that.isZombie()) {
			that.walkingSpeed = that.walkingSpeed / (1 + (10 - that.influences.r) * 10);
		}
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
	};
	
	that.idle = function () {
		// hang out around other humans
		that.walkingSpeed = that.walkingSpeed / (2000);
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
	};
	
	that.run = function () {
		// accelerate
		that.walkingSpeed = 3 * that.walkingSpeed;
		// convert heading to dx and dy
		that.chooseNextMove();
		// move the humanoid
		that.move();
	};
	
	that.doNext = function () {
		switch (that.nextAction()) {
			case 'idle':
				that.idle();
				break;
			case 'walk':
				that.walk();
				break;
			case 'run':
				that.run();
				break;
			case 'fight':
				z.fight(that, that.currentTarget);
				break;
			default: 
				that.walk();
		}
				
		// reset walking speed
		that.walkingSpeed = that.maxWalkingSpeed;
	
		// clear the current action	
		that.actionQueue.shift();
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
	
	that.recognitionRange = 1;
	
	// returns the greater value
	that.recognizes = function (neighbor) {
		return (that.recognitionRange > z.humanRecognitionRange) ? z.range(that, neighbor) <= that.recognitionRange : z.range(that, neighbor) <= z.humanRecognitionRange;	
	};
	
	// this will increase quickly as the human survives fights
	that.zombieKillingFitness = 0.01; 
	
	that.livetimer = null;
	
	that.deadtimer = null;
	
	that.color = 'rgb(' + grayValue + ',' + grayValue + ',' + grayValue + ')';
	
	that.zombifyMsg = 'live-turn';
	
	that.zombify = function () {
		if (that.deadtimer === null && that.livetimer === null) {
			that.livetimer = z.setTimeout(function()
			{
				z.zombies.push(z.zombie(that));
				z.stats.hZombified++;
				z.message(that.zombifyMsg);
				that.zombify = null; 
				that.nextAction = function () 
				{
					return 'die';
				};
				z.zombiesPending -=1;
			}, z.zombificationDuration);
			z.zombiesPending +=1;
		}
		
		that.zombify = null; // this should prevent duplicate zombies
		
		that.color = 'rgb(30,30,' + (grayValue+50) + ')';
	};
		
	that.die = function () 
	{		
		that.nextAction = function () 
		{
			return 'die';
		};
		
		// this gets set right away because getting killed overrides any pending 'live-turn' event
		that.zombifyMsg = 'dead-turn';
		
		if (that.zombify !== null && that.deadtimer === null && that.livetimer === null)
		{
			that.deadtimer = z.setTimeout(function()
			{		
				z.zombies.push(z.zombie(that));
				z.stats.hZombified++;
				z.message(that.zombifyMsg);
				that.zombify = null; 
				z.zombiesPending -=1;
			}, z.zombificationDuration);
			z.zombiesPending +=1;
		}
		
		// remove this function so that it can't be called again
		that.die = function () {};
	};
	
	that.toString = function () {
		return '{"human": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
	
	that.nextAction = function () {
		// too much crowding in one spot makesthat location less appealing
		if (that.influences.w > 20 * z.humanHerding) {
			// this reflects the value off of an upper bound and applies it to 'attractiveness' of the location
			that.influences.a -= that.influences.w - (20 * z.humanHerding);
		}
	
		if (that.actionQueue.length > 0) {
			return that.actionQueue[0];
		} else if (that.influences.a > 0 && that.influences.r < 2) {
			return 'idle';
		} 
		// in the presence of attractors, humans will idle until they get sufficiently restless
		else if (Math.random() < z.humanBoredomFactor) {
			that.heading = (that.heading + Math.PI) % (Math.PI * 2);
			return 'walk';
		}
		else {
			return 'walk';
		}
	};
	
	return that;
};

z.zombie = function (spec) {
	var that = z.humanoid(spec);
	
	that.maxWalkingSpeed = spec.maxWalkingSpeed ? spec.maxWalkingSpeed / 3 : (Math.random() / 5 + 0.9) * z.zombieBaseWalkingSpeed();
	that.walkingSpeed = that.maxWalkingSpeed;
	
	that.color = 'rgb(' + (Math.round(Math.random() * 40) + 200) + ', 30, 30)';
	
	that.toString = function () {
		return '{"zombie": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
		
	that.die = function () 
	{
		that.nextAction = function () 
		{
			return 'die';
		};
	};
	
	that.nextAction = function () 
	{
		if (that.actionQueue.length > 0) 
		{
			return that.actionQueue[0];
		} 
		else 
		{
			return 'walk';
		}
	};
	
	return that;
};