/* 	basic physical functions and calculators;
	the range, sight and recognition functions could be more abtracted and all be written as one rangefinder function that returns a number and a label (sight/recognition/fighting),  but I kind of like having the functions separate and modular for now */

z.range = function (a,b) {
	return Math.pow((Math.pow((a.getpos().x)-(b.getpos().x),2) + Math.pow((a.getpos().y)-(b.getpos().y),2)),0.5); 
}

z.sees = function (a,b) {
	return z.range(a,b) < z.sightRange;
}

// does a recognize b?
z.recognizes = function (a,b) {
	if (!a.isZombie() && b.isZombie)
	{
		return z.range(a,b) < z.hRecognitionRange;	
	} else {
		return z.range(a,b) < z.zRecognitionRange;
	}
}