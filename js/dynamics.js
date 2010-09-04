/* 	basic physical functions and calculators;
	the range, sight and recognition functions could be more abtracted and all be written as one rangefinder function that returns a number and a label (sight/recognition/fighting),  but I kind of like having the functions separate and modular for now */

z.range = function (a,b) {
	return Math.pow((Math.pow((a.getpos().x)-(b.getpos().x),2) + Math.pow((a.getpos().y)-(b.getpos().y),2)),0.5); 
};

z.sees = function (a,b) {
	return z.range(a,b) < z.sightRange;
};

// does a recognize b?
z.recognizes = function (a,b) {
	if (!a.isZombie() && b.isZombie)
	{
		return z.range(a,b) < z.hRecognitionRange;	
	} else {
		return z.range(a,b) < z.zRecognitionRange;
	}
};

z.humanoidInfluence = function (h1, h2) {
	// h1's heading will be updated
	var d = z.range(h1,h2), 
		mag = 0;
		
	console.log(h1.getpos().x);
	console.log(h1.getpos().y);
	console.log(h2.getpos().x);
	console.log(h2.getpos().y);
		
	console.log(h1.heading);
	
	console.log(Math.atan((mag/z.scale*(h2.getpos().x - h1.getpos().x) + Math.sin(h1.heading))/(mag/z.scale*(h2.getpos().y - h1.getpos().y)-Math.cos(h1.heading)))%(Math.PI*2));
	
	h1.heading = Math.atan((mag*(h2.getpos().x - h1.getpos().x) + Math.sin(h1.heading))/(0-(h2.getpos().y - h1.getpos().y)-Math.cos(h1.heading)));
};