z.humanoid = function (spec) 
{
	var that = {};

	that.influences = [];

// remove this later
	that.error = null;

	that.targetCount = 1;
	
	that.heading = spec.heading || Math.round(Math.random()*Math.PI*2000)/1000;
	
	that.maxrunspeed = spec.maxrunspeed || (Math.random() / 5 + 0.9) * z.humanBaseRunspeed();
	
	that.runspeed = that.maxrunspeed;
	
	that.pos =  
	{
		x: (spec.pos.x) ? spec.pos.x : Math.round(Math.random()*z.gridWidth*z.scale),
		y: (spec.pos.y) ? spec.pos.y : Math.round(Math.random()*z.gridHeight*z.scale)
	};
	
	that.setpos = function (x,y) 
	{
		this.pos.x = x;
		this.pos.y = y;
	};
	
	that.nextMove = 
	{
		dx: 0,
		dy: 0
	};	
		
	that.move = function () 
	{
		var movx = this.pos.x + this.nextMove.dx, movy = this.pos.y + this.nextMove.dy;
		if (movx < 0) 
		{ 
			movx = 0; 
		}
		if (movx > z.gridWidth*z.scale) 
		{ 
			movx = z.gridWidth*z.scale; 
		}
		if (movy < 0) 
		{ 
			movy = 0; 
		}
		if (movy > z.gridHeight*z.scale) 
		{ 
			movy = z.gridHeight*z.scale; 
		}
		this.setpos(movx, movy);
	};
	
		
	that.die = function () 
	{
	};
		
	that.isZombie = function ()
	{
		return !(this.hasOwnProperty('zombify'));
	};
	
	return that;

};

z.human = function (spec)
{
	var that = z.humanoid(spec),
		gender,
		stamina,
		hunger,
		timeSinceLastAte = 0,
		timeSinceLastRested = 0,
		grayValue = Math.round(Math.random()*67) + 100;
	
	that.actionQueue = [];
	
	that.error = null;
	
	that.toString = function () 
	{
		return '{"human": { "x":'+ this.pos.x + ', "y": ' + this.pos.y +'}}';
	};
	
	that.color = 'rgb(' + grayValue + ',' + grayValue + ',' + grayValue + ')';
	
	that.update = function ()
	{
		// call updates to stam and hunger here	
	};
	
	that.attack = function ()
	{
	};
	
	that.rest = function ()
	{
	};
	
	that.hide = function ()
	{
	};
	
	that.findFood = function () 
	{
	};
	
	that.reproduce = function () 
	{
		//start timer or just represent frequency abstractly
	};
	
	that.nextAction = function () 
	{
		if (this.actionQueue.length > 0) 
		{
			return actionQueue.shift();
		} 
		else 
		{
		// more choices to come
			return 'run';
		}
	};
	
	that.chooseDirection = function ()
	{
		// direction is in radians clockwise, North = 0
		// random deviation from existing heading, so humans will tend to keep going more or less in the direction they are already going unless they encounter an influence
		this.heading = Math.round((this.heading + (Math.random()*Math.PI/4)-Math.PI/8)%(Math.PI*2)*1000)/1000;
		
		// the following functions set people on headings away from the walls when they hit them
		if (this.pos.x <= 0) 
		{
			this.heading = (Math.PI - this.heading) % Math.PI; // reflect off of left
		} 
		else if (this.pos.x >= (z.gridWidth * z.scale)) 
		{	
			this.heading = (2 * Math.PI - this.heading) % Math.PI + Math.PI; // reflect off of right
		}	
		
		if (this.pos.y <= 0) 
		{	
			if (this.heading > (3 / 2 * Math.PI))
			{
				this.heading = ((3 / 2 * Math.PI) - this.heading) % (3 / 2 * Math.PI); // reflect off of top
			}
			else if (this.heading < (Math.PI / 2))
			{
				this.heading = Math.PI - this.heading; // reflect off of top
			}
		} 
		else if (this.pos.y >= (z.gridHeight * z.scale)) 
		{	
			if (this.heading < Math.PI)
			{
				this.heading = this.heading % (Math.PI / 2); // reflect off of bottom
			}
			else if (this.heading < (3 / 2 * Math.PI))
			{
				this.heading = 2 * Math.PI - (this.heading % Math.PI); // reflect off of bottom
			}
		}	
		
		return this.heading;
	};
	
	that.chooseNextMove = function ()
	{
		// take the heading and use trig to calculate the dx and dy of the next move based on max move distance
		this.nextMove.dx = Math.round(Math.sin(this.heading) * this.runspeed * 1000) / 1000;
		this.nextMove.dy = Math.round(0 - (Math.cos(this.heading) * this.runspeed) * 1000) / 1000;		
	};
	
	that.zombify = function ()
	{
	};
	
	that.updateStamina = function () 
	{
		this.stamina = this.stamina - (this.timeSinceLastAte * this.timeSinceLastRested) ^ z.humanStamCoeff;
	};
	
	that.updateHunger = function () {
		this.hunger = this.hunger * (this.timeSinceLastAte) ^ z.humanHungerCoeff;
	};
	
	return that;
};

// zombie takes a human object as a parameter for its constructor -- awesome idea from Karl Guertin
z.zombie = function (human)
{
	var spec = 
	{
		"pos": 
		{
			"x": human.pos.x || Math.round(Math.random()*z.gridWidth*z.scale),
			"y": human.pos.y || Math.round(Math.random()*z.gridHeight*z.scale)
		},
		
		"maxrunspeed": human.maxrunspeed / 3 || (Math.random() / 5 + 0.9) * z.zombieBaseRunspeed()
	};
	
	var that = z.humanoid(spec);
	
	that.actionQueue = [];
	
	that.runspeed = spec.maxrunspeed;
	
	that.color = 'rgb(' + (Math.round(Math.random()*40) + 200) + ',30,30)';
	
	that.update = function ()
	{
		// call updates to stam and hunger here
	};
	
	that.chooseTarget = function () 
	{
	};
	
	that.nextAction = function () 
	{
		if (this.actionQueue.length > 0) 
		{
			return actionQueue.shift();
		} 
		else 
		{
		// more choices to come
			return 'run';
		}
	};
	
	that.chooseDirection = function ()
	{
		// direction is in radians clockwise, North = 0
		// random deviation from existing heading, so humans will tend to keep going more or less in the direction they are already going unless they encounter an influence
		this.heading = Math.round((this.heading + (Math.random()*Math.PI/4)-Math.PI/8)%(Math.PI*2)*1000)/1000;
		
		// the following functions set people on headings away from the walls when they hit them
		if (this.pos.x <= 0) 
		{
			this.heading = (Math.PI - this.heading) % Math.PI; // reflect off of left
		} 
		else if (this.pos.x >= (z.gridWidth * z.scale)) 
		{	
			this.heading = (2 * Math.PI - this.heading) % Math.PI + Math.PI; // reflect off of right
		}	
		
		if (this.pos.y <= 0) 
		{	
			if (this.heading > (3 / 2 * Math.PI))
			{
				this.heading = ((3 / 2 * Math.PI) - this.heading) % (3 / 2 * Math.PI); // reflect off of top
			}
			else if (this.heading < (Math.PI / 2))
			{
				this.heading = Math.PI - this.heading; // reflect off of top
			}
		} 
		else if (this.pos.y >= (z.gridHeight * z.scale)) 
		{	
			if (this.heading < Math.PI)
			{
				this.heading = this.heading % (Math.PI / 2); // reflect off of bottom
			}
			else if (this.heading < (3 / 2 * Math.PI))
			{
				this.heading = 2 * Math.PI - (this.heading % Math.PI); // reflect off of bottom
			}
		}	
		
		return this.heading;
	};
	
	that.chooseNextMove = function ()
	{
		// take the heading and use trig to calculate the dx and dy of the next move based on max move distance
		this.nextMove.dx = Math.round(Math.sin(this.heading) * this.runspeed * 1000)/1000;
		this.nextMove.dy = Math.round(0 - (Math.cos(this.heading) * this.runspeed) * 1000) / 1000;		
	};	
	
	return that;
};