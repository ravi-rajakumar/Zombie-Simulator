var zm = {
	recognitionRange: 30,
	gridHeight: 0,
	gridWidth: 0,
	currentDay: 0,
	foodAvailability: 0,
	hidingPlaceFrequency: 0,
	zombificationDuration: 0,

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
	zombieBrainEatingEfficiency: 1
};


zm.init = function (h,w,hpop,zpop,zbr,hherd,zherd) 
{
	zm.gridHeight = h;
	zm.gridWidth = w;
	zm.humanStartPopulation = hpop;
	zm.zombieStartPopulation = zpop;
	zm.zombieBrainEatingEfficiency = zbr;
	zm.humanHerding = hherd;
	zm.zombieHerding = zherd;
	
	var i = document.createElement('canvas');
	$('body').append(i);
};

Humanoid = function () 
{
		targetCount = 0,
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
};

Human = function () 
{
	var runspeed = (Math.random() / 5 + .9) * 3000;
};

Zombie = function () 
{
	var runspeed = (Math.random() / 5 + .9) * 1000;
};

Human.prototype = new Humanoid();
Zombie.prototype = new Humanoid();

$(document).ready(function ($) {
	zm.init(480,480,9000,1,1,1,1);
});