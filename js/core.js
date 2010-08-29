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

//stats for all humans
	humanStartPopulation: 9000,
	humanCurrentPopulation: 9000,
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
	z.gridHeight = h;
	z.gridWidth = w;
	z.humanStartPopulation = hpop;
	z.zombieStartPopulation = zpop;
	z.zombieBrainEatingEfficiency = zbr;
	z.humanHerding = hherd;
	z.zombieHerding = zherd;
	
	var i = document.createElement('canvas');
	$(i).attr('height', h);
	$(i).attr('width', w);
	$('body').append(i);
	
	// this here advances the turn by one time-lapsed hour
	var turns = setInterval(function () {z.advanceTurn();},60 * 1000 / z.timelapsefactor);
};


// human and zombie update methods get called by the turn increment function
z.advanceTurn = function () {
	$.each(z.humans, function (i, item) {
		item.update(); 
	});
}

// prototype for both humans and zombies
Humanoid = function () 
{
		targetCount = 0,
		moveDirection = 0,
		this.pos =  
		{
			x: 0,
			y: 1
		}
		
		this.getpos = function () 
		{
			return this.pos;
		}
		
		this.setpos = function (x,y) 
		{
			this.pos.x = x;
			this.pos.y = y;
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
	
	this.update = function ()
	{
		// code here to update stam, hunger and position
	};
	
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
			hpop = $('#hpop').val().
			zpop = $('#zpop').val(),
			zbr = $('#zbr').val();
		z.init(h,v,hpop,zpop,zbr,1,1);
	});
});