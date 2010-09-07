z.gui = {};

z.gui.draw = function () {

	if (z.canvas.getContext) {
		var ctx = z.canvas.getContext('2d'),
			i=0,j=0;  
		
		ctx.clearRect(0,0,$(z.canvas).attr('width'),$(z.canvas).attr('height')); // clear canvas  
			
		function paint (o) 
		{
			ctx.beginPath();
			try 
			{
			ctx.arc(Math.floor(o.pos.x / z.scale), Math.floor(o.pos.y / z.scale),1,0,Math.PI*2,true);
			} 
			catch (err)
			{
			//	console.log(err);
			//	console.log(o.errors);
			//	o.errors = '';
			}
			ctx.fillStyle = o.color;  
			ctx.fill();
		}
		
		for (i=0; i < z.humans.length; i++) 
		{
			paint(z.humans[i]);
		}
		
		for (j=0; j < z.zombies.length; j++) 
		{
			paint(z.zombies[j]);
		}
	}  	
};