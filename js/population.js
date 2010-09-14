z.humanoid = function (spec) 
{
	var that = {};

// remove this later
	that.error = null;

	that.targetCount = 0;
	
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
		that.pos.x = x;
		that.pos.y = y;
	};
	
	that.nextMove = 
	{
		dx: 0,
		dy: 0
	};	
		
	that.move = function () 
	{
		var movx = that.pos.x + that.nextMove.dx, movy = that.pos.y + that.nextMove.dy;
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
		that.setpos(movx, movy);
	};
		
	that.isZombie = function ()
	{
		return !(that.hasOwnProperty('zombify'));
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
	
	that.timer = null;
	
	that.error = null;
	
	that.toString = function () 
	{
		return '{"human": { "x":'+ that.pos.x + ', "y": ' + that.pos.y +'}}';
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
		if (that.actionQueue.length > 0) 
		{
			if (that.actionQueue[0] === 'die')
			{
				that.die();
			}
			else 
			{
				return that.actionQueue.shift();
			}
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
		that.heading = Math.round((that.heading + (Math.random()*Math.PI/4)-Math.PI/8)%(Math.PI*2)*1000)/1000;
		
		// the following functions set people on headings away from the walls when they hit them
		if (that.pos.x <= 0) 
		{
			that.heading = (Math.PI - that.heading) % Math.PI; // reflect off of left
		} 
		else if (that.pos.x >= (z.gridWidth * z.scale)) 
		{	
			that.heading = (2 * Math.PI - that.heading) % Math.PI + Math.PI; // reflect off of right
		}	
		
		if (that.pos.y <= 0) 
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
		else if (that.pos.y >= (z.gridHeight * z.scale)) 
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
	
	that.chooseNextMove = function ()
	{
		// take the heading and use trig to calculate the dx and dy of the next move based on max move distance
		that.nextMove.dx = Math.round(Math.sin(that.heading) * that.runspeed * 1000) / 1000;
		that.nextMove.dy = Math.round(0 - (Math.cos(that.heading) * that.runspeed) * 1000) / 1000;		
	};
	
	that.updateStamina = function () 
	{
		that.stamina = that.stamina - (that.timeSinceLastAte * that.timeSinceLastRested) ^ z.humanStamCoeff;
	};
	
	that.updateHunger = function () {
		that.hunger = that.hunger * (that.timeSinceLastAte) ^ z.humanHungerCoeff;
	};
	
	that.zombify = function (state)
	{		
		that.timer = setTimeout(function()
		{
			z.zombies.push(z.zombie(that));
			that.nextAction = function () 
			{
				return 'die';
			};
		}, 1000 * z.zombificationDuration / z.timelapsefactor);
		
		that.zombify = function () {}; // this should prevent duplicate zombies
		
		that.color = 'rgb(30,30,' + (grayValue+50) + ')';
	};
		
	that.die = function () 
	{
		var chance = (100 - z.zombieBrainEatingEfficiency)/100;
		
		that.nextAction = function () 
		{
			return 'die';
		};
			
		if (Math.random() <= chance)
		{
			that.timer = setTimeout(function()
			{		
				z.zombies.push(z.zombie(that));
				that.zombify = function () {}; 
			}, 1000 * z.zombificationDuration / z.timelapsefactor);
		}
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
		if (that.actionQueue.length > 0) 
		{
			if (that.actionQueue[0] === 'die')
			{
				that.die();
			}
			else 
			{
				return that.actionQueue.shift();
			}
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
		that.heading = Math.round((that.heading + (Math.random()*Math.PI/4)-Math.PI/8)%(Math.PI*2)*1000)/1000;
		
		// the following functions set people on headings away from the walls when they hit them
		if (that.pos.x <= 0) 
		{
			that.heading = (Math.PI - that.heading) % Math.PI; // reflect off of left
		} 
		else if (that.pos.x >= (z.gridWidth * z.scale)) 
		{	
			that.heading = (2 * Math.PI - that.heading) % Math.PI + Math.PI; // reflect off of right
		}	
		
		if (that.pos.y <= 0) 
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
		else if (that.pos.y >= (z.gridHeight * z.scale)) 
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
	
	that.chooseNextMove = function ()
	{
		// take the heading and use trig to calculate the dx and dy of the next move based on max move distance
		that.nextMove.dx = Math.round(Math.sin(that.heading) * that.runspeed * 1000)/1000;
		that.nextMove.dy = Math.round(0 - (Math.cos(that.heading) * that.runspeed) * 1000) / 1000;		
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