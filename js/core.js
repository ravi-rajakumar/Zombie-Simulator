var z = {
	hRecognitionRange: 1,
	zRecognitionRange: 10,
	sightRange: 20,
	gridHeight: 0,
	gridWidth: 0,
	scale: 20,
	currentTurn: 0,
	foodAvailability: 0,
	hidingPlaceFrequency: 0,
	zombificationDuration: 0,
// one turn = one minute; this factor determies how quickly turns jump forward. At 60, turns jump at a rate of one (min.) per second. Faster timelapses will increase the framerate
	timelapsefactor: 60,
	canvas: null,

//stats for all humans
	humanStartPopulation: 1000,
	humanCurrentPopulation: 1000,
// meters per minute/turn
	humanBaseRunspeed: 3000/60,
	humanHerding: 1,
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
	zombieBaseRunspeed: 1000/60,
	zombieHerding: 1,
	zombieBrainEatingEfficiency: 1,
	
	humans: [],
	zombies: []
};


z.init = function (h,w,s,hpop,zpop,zbr,tim,hherd,zherd) 
{
	$('canvas').remove();
	z.humans = [];
	z.zombies = [];
	var i,j,k;
	
	z.gridHeight = h;
	z.gridWidth = w;
	z.scale = s;
	z.humanStartPopulation = hpop;
	z.zombieStartPopulation = zpop;
	z.zombieBrainEatingEfficiency = zbr;
	z.timelapsefactor = tim;
	z.humanHerding = hherd;
	z.zombieHerding = zherd;
	
	// make the starting populations
	for (j = 0; j < z.humanStartPopulation; j++)
	{
		z.humans.push(new Human());
		z.humans[j].targetCount = 1;
		z.humans[j].setpos(Math.round(Math.random()*w*z.scale),Math.round(Math.random()*h*z.scale));
	}
	
	for (k = 0; k < z.zombieStartPopulation; k++)
	{
		z.zombies.push(new Zombie());
		z.zombies[k].targetCount = 1;
		z.zombies[k].setpos(Math.round(Math.random()*w*z.scale),Math.round(Math.random()*h*z.scale));
	}
	
	// create the actual canvas element
	i = document.createElement('canvas');
	$(i).attr('height', h);
	$(i).attr('width', w);
	$(i).attr('id', 'zombie-world');
	$('body').append(i);
	
	z.canvas = document.getElementById('zombie-world');
	z.gui.draw();

	// this here advances the turn by one time-lapsed minute
	var turns = setInterval(function () {z.advanceTurn();},Math.round(60 * 1000 / z.timelapsefactor));
};


// human and zombie update methods get called by the turn increment function
z.advanceTurn = function () {
	z.currentTurn++;
	
	//every turn we recursively sort the humanoids in order to save processing in the bahavior modeling
	z.humans = z.mergesort(z.humans, 'x');
	z.zombies = z.mergesort(z.zombies, 'x');
	
	$('#current-day span').text(Math.ceil(z.currentTurn/1440));
	$.each(z.humans, function (i, item) {
		item.update(); 
	});
	
	z.gui.draw();
}

// prototype for both humans and zombies
Humanoid = function () 
{
		targetCount = 0;
		moveDirection = 0;
		color = '';
		pop = {};
		
		this.getpos = function () 
		{
			return this.pos;
		}
		
		this.setpos = function (x,y) 
		{
			this.pos.x = x;
			this.pos.y = y;
		}
		
		/* TODO: add a variable, and methods for bearing and then refactor the sees & recognizes 
			functions to account for it. */
				
		this.getcolor = function () 
		{
			return this.color;
		}
		
		this.move = function () 
		{
		}
		
		this.die = function () 
		{
		}
		
		this.isZombie = function ()
		{
			return !(this.hasOwnProperty('zombify'));
		}
};

Human = function () 
{
	// variables specific to individual humans
	var runspeed = (Math.random() / 5 + .9) * z.humanBaseRunspeed, 
		gender,
		stamina,
		hunger,
		timeSinceLastAte = 0,
		timeSinceLastRested = 0,
		nextAction = null,
		grayValue = Math.round(Math.random()*67) + 100,
		seen = [],
		heading = 0;
	
	this.toString = function () 
	{
		return '{"human": { "x":'+ this.pos.x + ', "y": ' + this.pos.y +'}}';
	}
	
	
	this.pos =  
	{
		x: 0,
		y: 1
	};
	
	this.nextMove = 
	{
		dx: 0,
		dy: 0
	}
		
	this.color = 'rgb(' + grayValue + ',' + grayValue + ',' + grayValue + ')';
	
	
	this.update = function ()
	{
		// call updates to stam and hunger here
		this.nextAction = this.chooseAction();
		
		if (this.nextAction === 'run') 
		{
			this.chooseNextMove();
			var movx = this.getpos().x + this.nextMove.dx, movy = this.getpos().y + this.nextMove.dy;
			if (movx < 0) { movx = 0; }
			if (movx > z.gridWidth*z.scale) { movx = z.gridWidth*z.scale; }
			if (movy < 0) { movy = 0; }
			if (movy > z.gridHeight*z.scale) { movy = z.gridHeight*z.scale; }
			this.setpos(movx, movy);
		}	
		
	}
	
	this.attack = function ()
	{
	}
	
	this.rest = function ()
	{
	}
	
	this.hide = function ()
	{
	}
	
	this.findFood = function () 
	{
	}
	
	this.reproduce = function () 
	{
		//start timer or just represent frequency abstractly
	}
	
	this.chooseAction = function () 
	{
		// more choices to come
		return 'run';
	}
	
	this.chooseNextMove = function ()
	{
		seen = [];
		heading = this.chooseDirection();
		
		// take the heading and use trig to calculate the dx and dy of the next move based on max move distance
		this.nextMove.dx = Math.round(Math.sin(heading) * runspeed);
		this.nextMove.dy = Math.round(0 - (Math.cos(heading) * runspeed));		
	}
	
	this.chooseDirection = function ()
	{
		/* this is a problem!
		$.each(z.humans,function (i, item) 
		{
			if (z.sees(this,item)) 
			{	
			}
		});
		*/
		
		// direction is in radians clockwise, North = 0
		// random for now
		return Math.round(Math.random()*Math.PI*2000)/1000;
	}
	
	this.die = function ()
	{
	}
	
	this.zombify = function ()
	{
	}
	
	this.updateStamina = function () 
	{
		this.stamina = this.stamina - (this.timeSinceLastAte * this.timeSinceLastRested) ^ z.humanStamCoeff;
	}
	
	this.updateHunger = function () {
		this.hunger = this.hunger * (this.timeSinceLastAte) ^ z.humanHungerCoeff;
	}
};

Zombie = function () 
{
	var runspeed = (Math.random() / 5 + .9) * 1000;

	this.pos =  
	{
		x: 0,
		y: 1
	};
	
	this.color = 'rgb(' + (Math.round(Math.random()*40) + 200) + ',30,30)';
	
	this.chooseTarget = function () 
	{
	}
	
	this.chooseNextMove = function () 
	{
	}
	
};

Human.prototype = new Humanoid();
Zombie.prototype = new Humanoid();


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
}

z.merge = function (l, r, a) {
	var result = [];
	while (l.length > 0 || r.length > 0) {
		if (l.length > 0 && r.length > 0)
		{
			if (a === 'x')	
			{
				if (l[0].getpos().x <= r[0].getpos().x)
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
}


$(document).ready(function ($) {
	// event handlers down here:
	// start		
	$('#z-sim-init').live('submit', function (e) {
		e.preventDefault(); 
		var h = v = 480,
			s = $('#scale').val(),
			hpop = $('#hpop').val(),
			zpop = $('#zpop').val(),
			zbr = $('#zbr').val(),
			tim = $('#tim').val();
		z.init(h,v,s,hpop,zpop,zbr,tim,1,1);
	});
});