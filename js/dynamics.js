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

z.humanoidInfluence = function (ha, hb) {
	// h1's heading will be updated
	var mag = 0,
		hadx = 0,
		hadx = 0,
		hhheading = 0,
		hbdx = 0,
		hbdx = 0;
	
	/* mag is going to be the variable that determines how the second body affects the first. It ranges from -1 to 1, where -1 is going to be a strong repulsion and 1 will be a strong attraction. */
	/* the logic for human-human, human-zombie, amd zombie-zombie attraction and repulsion will all take place here. This is currrently written with fixed values, but is should be configurable by the user. */
	/* we don't even run this code unless they are in visual range, we don't have to chack that, but recogintion range will factor in. */
	
	if (z.range(ha, hb) < 0.5 && !(ha.isZombie()) && !(hb.isZombie())) // humans are automatically repulsed byother bodies being tooo close to them
	{
		mag = -0.5;
	} 
	else if (!(ha.isZombie())) 
	{
		if (!(hb.isZombie()) || (!z.recognizes(ha, hb))) // humans are automatically attracted to other humanoids unless they recognize them as zombies
		{
			mag = 0.5;
		} 
		else  // human recognizes zombie
		{
			mag = -1;
		} 
	}
	else if (!(hb.isZombie())) // zombies are strongly attracted to human brains
	{
		mag = 1;
	} 
	else	// zombies are lightly attracted to each other
	{
		mag = 0.5;
	}
	
	/* convert ha's heading into dx and dy */
	hadx = Math.sin(ha.heading);
	hady = 0 - Math.cos(ha.heading);
	
	/* create dx and dy values for hb's physical influence, using the same formula as above. The point here is to start by calulating the angle (heading) and then use the same rules as above to get the magnitude of dx and dy */
	hbdx = hb.getpos().x - ha.getpos().x;
	hbdy = hb.getpos().y - ha.getpos().y;
	
	console.log(ha.getrunspeed());
	
	hhheading = Math.asin(hbdx/Math.pow((Math.pow(hbdx, 2)) + (Math.pow(hbdy, 2)), 0.5));
	if (hbdy > 0)
	{
		hhheading += Math.PI*2;
	}
	hbdx = Math.sin(hhheading)*mag;
	hbdy = 0 - Math.cos(hhheading)*mag;
	
	console.log(hhheading);
	
	ha.heading = Math.atan((hadx + hbdx) / (hady + hbdy));

	// console.log((hb.getpos().x - ha.getpos().x));
};