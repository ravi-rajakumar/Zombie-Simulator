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
	start: 0,
	turnCounter: 0,
	frameCounter: 0,
	init: function () {
		this.start = new Date();
		this.turnCounter = 0;
		this.frameCounter = 0;
	},
	
	calculateRate: function (counter) {
		var now = new Date();
		
		return Math.floor(1000 * counter / (now.getTime() - this.start.getTime()));
	},
	
	getTPS: function () {
		z.actualTPS = this.calculateRate(this.turnCounter);
		
		return z.actualTPS;
	},
	
	getFPS: function () {
		return this.calculateRate(this.frameCounter);
	},
	
	logTPS: function (fn) {
		this.turnCounter++;
		
		if (this.turnCounter % (1000 / z.interval) === 0)
		{
			z.recalibrate();
		}
		
		fn();
	},
	
	logFPS: function (fn) {
		this.frameCounter++;
		
		fn();
	}
};