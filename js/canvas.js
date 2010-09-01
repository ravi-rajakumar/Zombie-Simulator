z.gui = {};

z.gui.draw = function () {

	if (z.canvas.getContext) {
		var ctx = z.canvas.getContext('2d'),
			i,j;  
		
		ctx.clearRect(0,0,$(z.canvas).attr('width'),$(z.canvas).attr('height')); // clear canvas  
			
		function paint (o) 
		{
			ctx.beginPath();
			ctx.arc(o.getpos().x/z.scale,o.getpos().y/z.scale,1,0,Math.PI*2,true);
			ctx.fillStyle = o.getcolor();  
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