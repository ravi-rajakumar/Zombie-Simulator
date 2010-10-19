z.mergeSort = function (humanoids, axis) {
	var middle = 0,
			left = [],
			right = [],
			merge = function (left, right, axis) {
			var result = [];
			
			while (left.length > 0 || right.length > 0)
			{
				if (left.length > 0 && right.length > 0)
				{
					if (axis === 'x')
					{
						if (left[0].position.x <= right[0].position.x)
						{
							result.push(left.shift());
						}
						else
						{
							result.push(right.shift());
						}
					}
					else if (axis === 'y')
					{
						if (left[0].position.y <= right[0].position.y)
						{
							result.push(left.shift());
						}
						else
						{
							result.push(right.shift());
						}
					}
				}
				else if (left.length > 0)
				{
					result.push(left.shift());
				}
				else if (right.length > 0)
				{
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
	frameCounter: 0,
	
	init: function () {
		markedTime = 0;
		markedTurn = 0;
		markedFrame = 0;
		frameCounter = 0;
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
		if ((z.currentTurn % 50) - 10 === 0)	
		{
			z.actualTurnsPerSecond = this.calculateRate(z.currentTurn, this.markedTurn);			
	
			// update the statistics displayed by the simulation. Since redraws elements, don't do it every turn
			z.updateRates();
			z.updateStatistics();
			
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
		z.stats[i] = 0;
	}
};