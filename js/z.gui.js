z.draw = function () {
	if (z.canvas.getContext)
	{
		var context = z.canvas.getContext('2d'),
				i = 0,
				paint = function (o) {
					var radius = o.isZombie() ? 1.5 : 1;
					
					context.beginPath();
					
					try
					{
						context.arc(Math.floor(o.position.x / z.scale), Math.floor(o.position.y / z.scale), radius, 0, Math.PI * 2, true);
					}
					catch (e)
					{
						console.log(e);
					}
					
					context.fillStyle = o.color;
					
					context.fill();
				};
		
		context.clearRect(0, 0, z.canvas.width, z.canvas.height);
		
		for (i = 0; i < z.humans.length; i++)
		{
			paint(z.humans[i]);
		}
		
		for (i = 0; i < z.zombies.length; i++)
		{
			paint(z.zombies[i]);
		}
	}
};