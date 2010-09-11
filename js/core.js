var z = {
	hRecognitionRange: 1,		// humans recognize zombies
	zRecognitionRange: 10,		// zombies recognize humans
	sightRange: 20,				// range of humanoid vision
	gridHeight: 0,
	gridWidth: 0,
	scale: 5, 					// 5m per pixel
	fieldOfView: 2.094, 		// 120 degrees field of vision
	currentTurn: 0,
	perfCounter: 0,				// used to count turns per second
	foodAvailability: 0,		// not used yet
	hidingPlaceFrequency: 0,	// not used yet
	zombificationDuration: 3 * 3600,	// 3 hours
	interval: 10,
	timelapsefactor: 300, 		// how many simulated seconds pass in one real-world second
	lasttps: null,				// used to recalibrate speed
	actualtps: null,			// used to measure performance
	simulatedtimeelapsed: 0,
	secondsperturn: function ()
		{
			if (z.actualtps === null) 
			{
				return z.interval * z.timelapsefactor / 1000;
			}
			else 
			{
				return 	z.timelapsefactor / z.actualtps;
			}
		},
	flockAngle: 0,
	canvas: null,

//stats for all humans
	humanStartPopulation: 1000,
	humanCurrentPopulation: 1000,
// meters per turn
	humanBaseRunspeed: function () 
		{ 
			return 4800 / 3600 * z.secondsperturn();
		},
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
// meters per turn
	zombieBaseRunspeed: function () 
		{ 
			return 1600 / 3600 * z.secondsperturn();
		},
	zombieHerding: 0.5,
	zombieBrainEatingEfficiency: 1,
	
	humans: [],
	zombies: [],
	humanoids: [],
	turns: null,
	animate: null
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

z.perf = 
{
	start: 0,
	now: 0,
	init: function () 
		{
			z.perfCounter = 0;
			start = new Date();
		},
	
	check: function ()
		{
			now = new Date();
			z.actualtps =  Math.floor(1000 * z.perfCounter / (now.getTime() - start.getTime()));
			return z.actualtps;
		}
}

z.calibrate = function ()
{
	if (z.lasttps === null) 
	{
		z.lasttps = z.interval / 1000;
	}
	var timeadjust = 1 / (z.lasttps * z.actualtps);
	$.each(z.humanoids, function (i, item) {
		item.maxrunspeed = item.maxrunspeed * timeadjust;
		z.lasttps = 1 / z.actualtps;
	});
}

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
	z.simulatedtimeelapsed += Math.round(z.secondsperturn());
	var proximityFail = false,
		hindex = 0,
		d = 0,
		sec = 0;
	
	//every turn we recursively sort the humanoids in order to save processing in the bahavior modeling
	z.humanoids = z.humans.concat(z.zombies);
	z.humanoids = z.mergesort(z.humanoids, 'x');
	
	sec = (Math.floor(z.simulatedtimeelapsed % 60) < 10) ? '0' + Math.floor(z.simulatedtimeelapsed % 60) : Math.floor(z.simulatedtimeelapsed % 60);
	
	
	$('#days').text(
			Math.floor(z.simulatedtimeelapsed / 86400) + ' days, ' +
			Math.floor((z.simulatedtimeelapsed % 86400) / 3600) + ' hours, ' + 
			Math.floor((z.simulatedtimeelapsed % 3600) / 60) + ' minutes, ' + 
			sec + ' seconds'
		);
	$.each(z.humanoids, function (i, item) {
		
		if (item.nextAction() === 'run') 
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
					if (d === 0) 
					{
						item.heading = z.flockAngle;
						z.flockAngle = (z.flockAngle + Math.PI/3) % (2*Math.PI);
					}
					else if (d < z.sightRange)  // a sees b
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
					if (d === 0) 
					{
						item.heading = z.flockAngle;
						z.flockAngle = (z.flockAngle + Math.PI/3) % (2*Math.PI);
					}
					else if (d < z.sightRange)   // a sees b
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
	
	// log performance
	z.perfCounter++;
	if (z.perfCounter % (1000/z.interval) === 0) 
	{
		$('#perf span').text(z.perf.check());
		z.calibrate();
	}
};

z.play = function () {
	// run the setup if it hasn't run yet
	if (z.humans.length < 1 && z.zombies.length < 1)
	{
		$('#z-sim-init').submit();
	}
	z.stop();
	z.perf.init();
	// this here advances the turn
	z.turns = setInterval(function () {z.advanceTurn();},z.interval);
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