var z = {
	hRecognitionRange: 1,
	zRecognitionRange: 10,
	sightRange: 20,
	gridHeight: 0,
	gridWidth: 0,
	scale: 5, // 5m per pixel
	fieldOfView: 2.094, // 120 degrees
	currentTurn: 0,
	foodAvailability: 0,
	hidingPlaceFrequency: 0,
	zombificationDuration: 0,
// one turn = 10 seconds; this factor determies how quickly turns jump forward.
	timelapsefactor: 300, // 300 secs/sec / 10sec/turn = 30 turns per second
	canvas: null,

//stats for all humans
	humanStartPopulation: 1000,
	humanCurrentPopulation: 1000,
// meters per minute/turn
	humanBaseRunspeed: 4800/360,
	humanHerding: 0.5,
	humanDefenseEfficiency: 1,
	humanNormalDeathRate: 0,
	humanAgressiveness: 1,
	humanReproductionRate: 0,
	humanStamCoeff: 1,
	humanHungerCoeff: 1,
	
//stats for all zombies
	zombieStartPopulation: 1,
	zombieCurrentPopulation: 1,
// meters per minute/turn
	zombieBaseRunspeed: 1800/360,
	zombieHerding: 0.5,
	zombieBrainEatingEfficiency: 1,
	
	humans: [],
	zombies: [],
	humanoids: [],
	turns: null,
	animate: null
};

z.humanoid = function (spec) 
{
	var that = {};

	that.targetCount = 1;
	
	that.heading = spec.heading || Math.round(Math.random()*Math.PI*2000)/1000;
	
	that.maxrunspeed = spec.maxrunspeed || (Math.random() / 5 + 0.9) * z.humanBaseRunspeed;
	
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
	
	that.nextAction = null;
	
	that.toString = function () 
	{
		return '{"human": { "x":'+ this.pos.x + ', "y": ' + this.pos.y +'}}';
	};
	
	that.nextMove = 
	{
		dx: 0,
		dy: 0
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
	
	that.chooseAction = function () 
	{
		// more choices to come
		return 'run';
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
		this.nextMove.dx = Math.round(Math.sin(this.heading) * this.runspeed);
		this.nextMove.dy = Math.round(0 - (Math.cos(this.heading) * this.runspeed));		
	};
		
	that.move = function () 
	{
		var movx = this.pos.x + this.nextMove.dx, movy = this.pos.y + this.nextMove.dy;
		if (movx < 0) { movx = 0; }
		if (movx > z.gridWidth*z.scale) { movx = z.gridWidth*z.scale; }
		if (movy < 0) { movy = 0; }
		if (movy > z.gridHeight*z.scale) { movy = z.gridHeight*z.scale; }
		this.setpos(movx, movy);
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
		
		"maxrunspeed": human.maxrunspeed / 3 || (Math.random() / 5 + 0.9) * z.zombieBaseRunspeed
	};
	
	var that = z.humanoid(spec);
	
	that.nextAction = null;
	
	that.runspeed = spec.maxrunspeed;
	
	that.nextMove = 
	{
		dx: 0,
		dy: 0
	};
	
	that.color = 'rgb(' + (Math.round(Math.random()*40) + 200) + ',30,30)';
	
	that.update = function ()
	{
		// call updates to stam and hunger here
	};
	
	that.chooseTarget = function () 
	{
	};
	
	that.chooseAction = function () 
	{
		// more choices to come
		return 'run';
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
		this.nextMove.dx = Math.round(Math.sin(this.heading) * this.runspeed);
		this.nextMove.dy = Math.round(0 - (Math.cos(this.heading) * this.runspeed));		
	};	
	
	that.move = function () 
	{
		var movx = this.pos.x + this.nextMove.dx, movy = this.pos.y + this.nextMove.dy;
		if (movx < 0) { movx = 0; }
		if (movx > z.gridWidth*z.scale) { movx = z.gridWidth*z.scale; }
		if (movy < 0) { movy = 0; }
		if (movy > z.gridHeight*z.scale) { movy = z.gridHeight*z.scale; }
		this.setpos(movx, movy);
	};
	
	return that;
};

// Math functions

z.mergesort = function (t, axis) {
	var middle = 0, left = [], right = [], result = [];
	if (t.length <= 1) {
		return t;
	}
	
	middle = Math.ceil(t.length / 2);
	left = t.slice(0,middle);
	right = t.slice(middle);
	left = z.mergesort(left, axis);
	right = z.mergesort(right, axis);
	result = z.merge(left, right, axis);
	return result;
};

z.merge = function (l, r, a) {
	var result = [];
	while (l.length > 0 || r.length > 0) {
		if (l.length > 0 && r.length > 0)
		{
			if (a === 'x')	
			{
				if (l[0].pos.x <= r[0].pos.x)
				{
					result.push(l.shift());
				} 
				else
				{
					result.push(r.shift());
				}
			}
			else if (a === 'y')
			{
				if (l[0].human.y <= r[0].human.y)
				{
					result.push(l.shift());
				} 
				else
				{
					result.push(r.shift());
				}
			}
		} 
		else if (l.length > 0)
		{
			result.push(l.shift());
		}
		else if (r.length > 0)
		{
			result.push(r.shift());
		}
	}
	return result;
};


z.init = function (spec) 
{
	z.humans = [];
	z.zombies = [];
	var i,j,k;
	z.currentTurn = 0;
	
	z.gridHeight = spec.h;
	z.gridWidth = spec.w;
	z.scale = spec.s;
	z.humanStartPopulation = spec.hpop;
	z.zombieStartPopulation = spec.zpop;
	z.zombieBrainEatingEfficiency = spec.zbr;
	z.timelapsefactor = spec.tim;
	z.humanHerding = spec.hhrd;
	z.zombieHerding = spec.zhrd;
	
	// make the starting populations
	for (j = 0; j < z.humanStartPopulation; j++)
	{
		z.humans.push(z.human({pos:{}}));
	}
	
	for (k = 0; k < z.zombieStartPopulation; k++)
	{
		z.humans.push(z.human({pos:{}}));
		z.zombies.push(z.zombie(z.humans.pop()));
	}
	
	// create the actual canvas element
	$('#zombie-world').attr('height', spec.h);
	$('#zombie-world').attr('width', spec.w);
	
	z.canvas = document.getElementById('zombie-world');
	z.gui.draw();

};


// human and zombie update methods get called by the turn increment function
z.advanceTurn = function () {
	z.currentTurn++;
	var proximityFail = false,
		hindex = 0,
		d = 0;
	
	//every turn we recursively sort the humanoids in order to save processing in the bahavior modeling
	z.humanoids = z.humans.concat(z.zombies);
	z.humanoids = z.mergesort(z.humanoids, 'x');
	
	if ($('#current-day span').text() !== Math.ceil(z.currentTurn/8640)) 
	{
		$('#current-day span').text(Math.ceil(z.currentTurn/8640));
	}
	$.each(z.humanoids, function (i, item) {
	
		item.nextAction = item.chooseAction();
		
		if (item.nextAction === 'run') 
		{
			// pick a base heading
			item.heading = item.chooseDirection();
			
			// step through the population looking for influences and applying them.
			// loop forward until out of range (this is much quicker now that we have a sorted list to go through)
			proximityFail = false;
			hindex = i + 1;
			while (proximityFail === false)
			{
				if (hindex >= z.humanoids.length)
				{
					proximityFail = true;
				}
				else if (Math.abs(item.pos.x - z.humanoids[hindex].pos.x) > z.sightRange) 
				{
					proximityFail = true;
				}
				else
				{
					d = z.range(item, z.humanoids[hindex]);
					if (d <= 1 && item.isZombie() && !(z.humanoids[hindex].isZombie()))
					{
					//	console.log(z.fight(z.humanoids[hindex], item));
					}
					if (d < z.sightRange)  // a sees b
					{
						z.humanoidInfluence(item, z.humanoids[hindex], d);
					}
				}
				hindex++;
			}
			
			// loop backward until out of range
			proximityFail = false;
			hindex = i - 1;
			while (proximityFail === false)
			{
				if (hindex < 0)
				{
					proximityFail = true;
				}
				else if (Math.abs(item.pos.x - z.humanoids[hindex].pos.x) > z.sightRange) 
				{
					proximityFail = true;
				}
				else
				{
					d = z.range(item, z.humanoids[hindex]);
					if (d <= 1 && item.isZombie() && !(z.humanoids[hindex].isZombie()))
					{
					//	console.log(z.fight(z.humanoids[hindex], item));
					}
					if (d < z.sightRange)   // a sees b
					{
						z.humanoidInfluence(item, z.humanoids[hindex], d);
					}
				}
				hindex-=1;
			}
			
			// convert heading to dx and dy
			item.chooseNextMove();
			
			// move the humanoid
			item.move();
			
			// reset it's runspeed if it was changed by the influence function
			item.runspeed = item.maxrunspeed;
			
		}
	});
	
	// increment zombie recognition range until 10m
	if (z.hRecognitionRange < 10) 
	{
		z.hRecognitionRange += (9/4320); // this will take 3 days to get from 1 to 10m
	}
};

z.play = function () {
	z.stop();
	// this here advances the turn by one time-lapsed minute
	z.turns = setInterval(function () {z.advanceTurn();},Math.round(10 * 1000 / z.timelapsefactor));
	// draw at 30fps
	z.animate = setInterval(function () {z.gui.draw();},33);	
};

z.stop = function () {
	clearInterval(z.turns);
	clearInterval(z.animate);
};

$(document).ready(function ($) {
	// event handlers down here:
	// start		
	$('#z-sim-init').live('submit', function (e) {
		e.preventDefault(); 
		z.stop();
		var spec = 
		{
			h:	'480',
			w:	'480',
			s:	$('#scale').val(),
			hpop:	$('#hpop').val(),
			zpop:	$('#zpop').val(),
			zbr:	$('#zbr').val(),
			tim:	$('#tim').val(),
			zhrd:	$('#zhrd').val(),
			hhrd:	$('#hhrd').val()
		};
		z.init(spec);
		
	});
	// stop		
	$('#stop').live('click', function (e) {
		z.stop();
	});
	// play		
	$('#play').live('click', function (e) {
		z.play();
	});
	// controls		
	$('#controlswitch').live('click', function (e) {
		$('#z-sim-init').toggle('fast');
	});
	
});