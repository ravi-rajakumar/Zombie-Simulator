z.humanoid = function (spec) {
	var that = {};
	
	that.actionQueue = [];
	
	that.guid = z.guid++;
	
	that.currentTarget = null;
	
	that.lastActionTimeStamp = z.simulatedTimeElapsed;
	
	that.heading = spec.heading || Math.round(Math.random() * Math.PI * 2000) / 1000;
	that.speedVariance = Math.random() / 5 + 0.9;
	that.maxRunSpeed = spec.maxRunSpeed || that.speedVariance * z.humanBaseRunSpeed();
	that.runSpeed = that.maxRunSpeed;
	
	that.position = {
		x: (spec.position.x) ? spec.position.x : Math.round(Math.random() * z.canvasWidth * z.scale),
		y: (spec.position.y) ? spec.position.y : Math.round(Math.random() * z.canvasHeight * z.scale)
	};
	
	that.nextMove = {
		dx: 0,
		dy: 0
	};
	
	that.setPosition = function (x, y) {
		that.position.x = x;
		that.position.y = y;
	};
	
	that.move = function () {
		var movx = that.position.x + that.nextMove.dx,
				movy = that.position.y + that.nextMove.dy;
		
		if (movx < 0)
		{
			movx = 0;
		}
		
		if (movx > z.canvasWidth * z.scale)
		{
			movx = z.canvasWidth * z.scale;
		}
		
		if (movy < 0)
		{
			movy = 0;
		}
		
		if (movy > z.canvasHeight * z.scale)
		{
			movy = z.canvasHeight * z.scale;
		}
		
		that.setPosition(movx, movy);
	};
	
	that.chooseDirection = function () {
		/*
		 * direction is in radians clockwise, North = 0
		 *
		 * random deviation from existing heading, so humans will tend to keep
		 * going more or less in the direction they are already going unless they
		 * encounter an influence
		 */
		that.heading = Math.round((that.heading + (Math.random() * Math.PI / 4) - Math.PI / 8) % (Math.PI * 2) * 1000) / 1000;
		
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
	
	that.chooseNextMove = function () {
		that.nextMove.dx = Math.round(Math.sin(that.heading) * that.runSpeed * z.secondsPerTurn() * 1000) / 1000;
		that.nextMove.dy = Math.round(0 - (Math.cos(that.heading) * that.runSpeed * z.secondsPerTurn()) * 1000) / 1000;
	};
	
	that.nextAction = function () 
	{
		if (that.actionQueue.length > 0) 
		{
			if (that.actionQueue[0] === 'die')
			{
				that.die();
			}
			else 
			{
				return that.actionQueue[0];
			}
		} 
		else 
		{
		// more choices to come
			return 'run';
		}
	};
	
	that.isZombie = function () {
		return !(this.hasOwnProperty('zombify'));
	};
	
	return that;
};

z.human = function (spec) {
	var that = z.humanoid(spec),
			grayValue = Math.round(Math.random() * 67) + 100;
	
	that.maxRunSpeed = spec.maxRunSpeed ? spec.maxRunSpeed : (Math.random() / 5 + 0.9) * z.humanBaseRunSpeed();
	
	that.runSpeed = that.maxRunSpeed;
	
	that.livetimer = null;
	
	that.deadtimer = null;
	
	that.color = 'rgb(' + grayValue + ',' + grayValue + ',' + grayValue + ')';
	
	that.zombify = function () {
		that.livetimer = z.setTimeout(function()
		{
			z.zombies.push(z.zombie(that));
			z.stats.hZombified++;
			z.message('live-turn');	// remove later
			that.nextAction = function () 
			{
				return 'die';
			};
		}, z.zombificationDuration);
		
		that.zombify = null; // this should prevent duplicate zombies
		
		that.color = 'rgb(30,30,' + (grayValue+50) + ')';
	};
		
	that.die = function () 
	{		
		that.nextAction = function () 
		{
			return 'die';
		};
			
		if (that.zombify !== null && that.livetimer === null)
		{
			that.deadtimer = z.setTimeout(function()
			{		
				z.zombies.push(z.zombie(that));
				z.stats.hZombified++;
				z.message('dead-turn');	// remove later
				that.zombify = null; 
			}, z.zombificationDuration);
		}
	};
	
	that.toString = function () {
		return '{"human": { "x":' + this.position.x + ', "y": ' + this.position.y + '}}';
	};
	
	return that;
};

z.zombie = function (spec) {
	var that = z.humanoid(spec);
	
	that.maxRunSpeed = spec.maxRunSpeed ? spec.maxRunSpeed / 3 : (Math.random() / 5 + 0.9) * z.zombieBaseRunSpeed();
	that.runSpeed = that.maxRunSpeed;
	
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
	
	return that;
};