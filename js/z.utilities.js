/* this is a custom version of settimeout, designed to account for the pauses in the simulation. 
	It checks against the game's time elapsed (in seconds), which doesn't increment when paused */ 
z.setTimeout = function (fn, t) {
	var timer = {}, 
		start = z.simulatedTimeElapsed;
	
	timer.run = null;
	
	timer.go = (function () {
		timer.run = setInterval(function () {
			if (z.simulatedTimeElapsed >= start + t) {
				fn();
				clearInterval(timer.run);
			}
		},100);
	})();
	
	timer.cancel = function () {
		clearInterval(timer.run);
	};
	
	return timer;
};

z.clearTimeout = function (timer, callback) {
	try {
		timer.cancel();
	} catch (e) {
		// if this failed it's probably because timer wasn't an actual timeout and had no cancel method
	}
	callback();
};

z.zombieCancel = function () {
	z.zombiesCanceled++;
};

z.mergeSort = function (humanoids, axis) {
	var middle = 0,
			left = [],
			right = [],
			merge = function (left, right, axis) {
			var result = [];
			
			while (left.length > 0 || right.length > 0) {
				if (left.length > 0 && right.length > 0) {
					if (axis === 'x') {
						if (left[0].position.x <= right[0].position.x) {
							result.push(left.shift());
						} else {
							result.push(right.shift());
						}
					} else if (axis === 'y') {
						if (left[0].position.y <= right[0].position.y) {
							result.push(left.shift());
						} else {
							result.push(right.shift());
						}
					}
				} else if (left.length > 0) {
					result.push(left.shift());
				} else if (right.length > 0) {
					result.push(right.shift());
				}
			}
			
			return result;
		};
	
	if (humanoids.length <= 1) {
		return humanoids;
	}
	
	middle = Math.ceil(humanoids.length / 2);
	left = humanoids.slice(0, middle);
	right = humanoids.slice(middle);
	
	left = z.mergeSort(left, axis);
	right = z.mergeSort(right, axis);
	
	return merge(left, right, axis);
};

z.range = function (a, b) {
	return Math.pow((Math.pow((a.position.x) - (b.position.x), 2) + Math.pow((a.position.y) - (b.position.y), 2)), 0.5);
};


z.performance = {
	markedTime: 0,
	markedTurn: 0,
	markedFrame: 0,
	
	init: function () {
		markedTime = 0;
		markedTurn = 0;
		markedFrame = 0;
		this.mark();
	},
	
	// Without this we'd always be calculating the rate averaged out over the entire run. This keeps the average current.
	mark: function () {
		this.markedTime = new Date();
		this.markedTurn = z.currentTurn;
		this.markedFrame = z.frameCounter;
	},
	
	// Returns the rates for the last 50 turns
	calculateRate: function (counter, mark) {
		var now = new Date();
		
		// don't round this until we are displaying it, because it's used to calibrate the sim's physics
		return (1000 * (counter - mark) / (now.getTime() - this.markedTime.getTime()));
	},
	
	getTPS: function () {
		return Math.floor(z.actualTurnsPerSecond);
	},
	
	getFPS: function () {
		return Math.floor(this.calculateRate(z.frameCounter, this.markedFrame));
	},
	
	
	// the current turn and current frame variables are in the global z object. To be sure we are actually measuring the advance turn and redraw events, they will be updated from within those functions.
	logTPS: function (fn) {
		// once every 50 turns, starting with turn 10, reset and recalibrate
		if ((z.currentTurn % 50) - 10 === 0) {
			z.actualTurnsPerSecond = this.calculateRate(z.currentTurn, this.markedTurn);			
	
			// update the statistics displayed by the simulation. Since redraws elements, don't do it every turn
			z.updateRates();
			
			this.mark();
		}
		fn();
	}
};

z.stats = {
	hKilled: 0,
	zDestroyed: 0,
	hZombified: 0,
	hBirths: 0,
	hNaturalDeaths: 0
};

z.resetStats = function () {
	for (var i in z.stats) {
		if (z.stats.hasOwnProperty(i)) {
			z.stats[i] = 0;
		}
	}
};

// method for reading out messages to the ui's message pane
z.message = function (msg) {
	$('#messages p').html('<span id="msg"><strong>' + msg + '</strong></span>&nbsp;');
	z.log += msg + '\n';
	var messageTimeout = setTimeout(function () {
		$('#messages p #msg').fadeOut(1000);
		}, 1000);
};

// used for clicks on the canvas. supply left and top coords and this will return a set (array) of humanoids within a 3 pixel radius of them
z.findNearest = function (l, t) {
	var click = {
			position: {
				x: l * z.scale,
				y: t * z.scale
			}
		},
		i,j,
		close = [];
		
	for (i = 0, j = z.neighbors.length; i < j; i++) {
		if (z.range(z.neighbors[i], click) < 3 * z.scale) {
			close.push(z.neighbors[i]);
		}
	}
	
	return close;
};

// searches humanoids for a guid and then returns a reference to the object when it finds one, or undefined if it doesn't
z.find = function (id) {
	for (var i = 0, j = z.neighbors.length; i < j; i++) {
		if (z.neighbors[i].guid === id) {
			return z.neighbors[i];
		}
	}
	return undefined;
};

// rounding with significant digits
z.round = function (n, s) {
	if (s) {
		var d = Math.pow(10, s);
		return Math.round(n * d)/d;
	} else {
		return Math.round(n);
	}
};

z.postResults = function () {
	var postdata = {
		outcome: z.extinct + " extinct",
		humans_remaining: z.humans.length,
		zombies_remaining: z.zombies.length,
		time_elapsed: Math.round(z.simulatedTimeElapsed),
		version: z.version,
		human_init_pop: z.humanStartingPopulation,
		zombie_init_pop: z.zombieStartingPopulation,
		human_herding: z.humanHerding,
		human_queueing: z.humanQueueing,
		human_init_aggressiveness: z.humanBaseAgressiveness,
		zombie_herding: z.zombieHerding,
		zombie_queueing: z.zombieQueueing,
		brain_eating_success: z.zombieBrainEatingEfficiency,
		scale: z.scale,
		max_crowding: z.maxCrowding,
		humans_killed: z.stats.hKilled,
		zombies_killed: z.stats.zDestroyed,
		humans_zombified: z.stats.hZombified,
		humans_born: z.stats.hBirths,
		human_natural_deaths: z.stats.hNaturalDeaths 
	};
	$.ajax({
			type: 'POST',
			url: '/python/post_results.py',
			data: postdata
		}); 
};