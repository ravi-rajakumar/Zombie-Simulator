var z = {
	hRecognitionRange: 1,
	zRecognitionRange: 10,
	sightRange: 20,
	gridHeight: 0,
	gridWidth: 0,
	scale: 20,
	currentDay: 0,
	foodAvailability: 0,
	hidingPlaceFrequency: 0,
	zombificationDuration: 0,
// one turn = one minute; this factor determies how quickly turns jump forward. At 60, turns jump at a rate of one (min.) per second.
	timelapsefactor: 60,
	canvas: null,

//stats for all humans
	humanStartPopulation: 1000,
	humanCurrentPopulation: 1000,
	humanBaseRunspeed: 3000,
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
	zombieBaseRunspeed: 1000,
	zombieHerding: 1,
	zombieBrainEatingEfficiency: 1,
	
	humans: [],
	zombies: []
};


z.init = function (h,w,hpop,zpop,zbr,hherd,zherd) 
{
	var i,j,k;
	
	z.gridHeight = h;
	z.gridWidth = w;
	z.humanStartPopulation = hpop;
	z.zombieStartPopulation = zpop;
	z.zombieBrainEatingEfficiency = zbr;
	z.humanHerding = hherd;
	z.zombieHerding = zherd;
	
	// make the starting populations
	for (j = 0; j < z.humanStartPopulation; j++)
	{
		z.humans.push(new Human());
		z.humans[j].targetCount = 1;
		z.humans[j].setpos(Math.round(Math.random()*w),Math.round(Math.random()*h));
	}
	
	for (k = 0; k < z.zombieStartPopulation; k++)
	{
		z.zombies.push(new Zombie());
		z.zombies[k].targetCount = 1;
		z.zombies[k].setpos(Math.round(Math.random()*w),Math.round(Math.random()*h));
	}
	
	// create the actual canvas element
	i = document.createElement('canvas');
	$(i).attr('height', h);
	$(i).attr('width', w);
	$(i).attr('id', 'zombie-world');
	$('body').append(i);
	
	z.canvas = document.getElementById('zombie-world');
	
	z.gui.draw();
	
	// this here advances the turn by one time-lapsed hour
	var turns = setInterval(function () {z.advanceTurn();},60 * 1000 / z.timelapsefactor);
};


// human and zombie update methods get called by the turn increment function
z.advanceTurn = function () {
	z.currentDay++;
	$.each(z.humans, function (i, item) {
		item.update(); 
	});
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
	var runspeed = (Math.random() / 5 + .9) * 3000,
		gender,
		stamina,
		hunger,
		timeSinceLastAte = 0,
		timeSinceLastRested = 0;
	
	this.pos =  
	{
		x: 0,
		y: 1
	};
		
	this.color = 'rgb(' + (Math.round(Math.random()*70) + 143) + ',70,70)';
	
	
	this.update = function ()
	{
		// call updates to stam and hunger here
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
	}
	
	this.chooseNextMove = function ()
	{
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
	
	this.color = 'rgb(70,70,' + (Math.round(Math.random()*70) + 143) + ')';
	
	this.chooseTarget = function () 
	{
	}
	
	this.chooseNextMove = function () 
	{
	}
	
};

Human.prototype = new Humanoid();
Zombie.prototype = new Humanoid();

$(document).ready(function ($) {
	// event handlers down here:
	// start		
	$('#z-sim-init').live('submit', function (e) {
		e.preventDefault(); 
		var h = v = 480,
			hpop = $('#hpop').val(),
			zpop = $('#zpop').val(),
			zbr = $('#zbr').val();
		z.init(h,v,hpop,zpop,zbr,1,1);
	});
});