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
		 * random deviation from existing heading, so humans will tend to keep
		 * going more or less in the direction they are already going unless they
		 * encounter an influence
		 */
		that.heading = (that.heading + Math.ceil(Math.random() * Math.PI / 8 * 1000) / 1000 - Math.round(Math.PI * 1000 / 16) / 1000) %  (Math.round(Math.PI * 2000) / 1000);
		
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
	

	// Array of influences. Each item has an x influence, a y influence, a weight, and a value for the strength of attraction/repulsion in the area
	that.influences = {x:0,y:0,w:1,a:0};
	
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
				z.message(that.zombifyMsg);	// remove later
				that.zombify = function () {};
				that.nextAction = function () 
				{
					return 'die';
				};
			}, z.zombificationDuration);
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
		
		if (that.deadtimer === null && that.livetimer === null)
		{
			that.deadtimer = z.setTimeout(function()
			{		
				z.zombies.push(z.zombie(that));
				z.stats.hZombified++;
				z.message(that.zombifyMsg);	// remove later
				that.zombify = function () {}; 
			}, z.zombificationDuration);
		}
		
		// remove this function so that it can't be called again
		that.die = function () {};
	};
	
	that.toString = function () {
		return '{"human": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
	
	that.nextAction = function () {
		if (that.actionQueue.length > 0) {
			return that.actionQueue[0];
		} 
		// in the presence of attractors, humans will idle until they get sufficiently restless
		else if (Math.random() < (z.humanBoredomFactor * z.secondsPerTurn() / 3) || that.influences.a === 0) {
			// walk away for at least 5-10 minutes		
			for (var i = 0; i < ((Math.random() * 300 + 300)/z.secondsPerTurn()); i++)
			{
				currentHumanoid.actionQueue.push('walk');
			}
			return 'walk';
		}
		else {
			return 'idle';
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
		// more choices to come
			return 'walk';
		}
	};
	
	return that;
};