/* 	basic physical functions and calculators;
	the range, sight and recognition functions could be more abtracted and all be written as one rangefinder function that returns a number and a label (sight/recognition/fighting),  but I kind of like having the functions separate and modular for now */

z.range = function (a,b) {
	return Math.pow((Math.pow((a.pos.x)-(b.pos.x),2) + Math.pow((a.pos.y)-(b.pos.y),2)),0.5); 
};

z.sees = function (a,b) {
	return z.range(a,b) < z.sightRange;
};

z.humanoidInfluence = function (ha, hb, d) {
	// h1's heading will be updated
	var mag = 0,
		/* convert ha's heading into dx and dy */
		hadx = Math.sin(ha.heading),
		hady = 0 - Math.cos(ha.heading),
		/* scale for the distance to the influencing humanoid. This lets us add this vector to the existing heading */  
		headingscale = (d > 0 ) ? Math.round(1000 / d) / 1000 : 1,
		hangle = 0,
		newheading = 0;
		
	
	/* mag is going to be the variable that determines how the second body affects the first. It ranges from -1 to 1, where -1 is going to be a strong repulsion and 1 will be a strong attraction. */
	/* the logic for human-human, human-zombie, amd zombie-zombie attraction and repulsion will all take place here. This is currrently written with fixed values, but is should be configurable by the user. */
	/* we don't even run this code unless they are in visual range, we don't have to chack that, but recogintion range will factor in. */
	
	if (!(ha.isZombie())) 
	{
		if (!(hb.isZombie()) || !(z.range(ha,hb) <= z.hRecognitionRange)) // humans are automatically attracted to other humanoids unless they recognize them as zombies
		{
			mag = z.humanHerding;
		} 
		else  // human recognizes zombie (very strong repulsion)
		{
			mag = -1;
		} 
	}
	
	if ((ha.isZombie()) && !(hb.isZombie())) // zombies are strongly attracted to human brains
	{
		mag = 1;
	} 
	
	if ((ha.isZombie()) && (hb.isZombie()))	// zombies are lightly attracted to each other
	{	
		mag = z.zombieHerding;
	}
	
	if (z.range(ha, hb) < 0.5 && !(ha.isZombie()) && !(hb.isZombie())) // humans are automatically repulsed by other bodies being too close to them
	{
		mag = -0.5;
	} 
	
	/* create dx and dy values for hb's physical influence, and add them to the existing heading */
	hbdx = headingscale * (hb.pos.x - ha.pos.x) * mag + hadx;
	hbdy = headingscale * (hb.pos.y - ha.pos.y) * mag + hady;
	hangle = Math.asin(hbdx/ha.maxrunspeed);
	newheading = (hbdy >= 0) ? Math.PI - hangle : (Math.PI * 2 + hangle) % (Math.PI * 2);
	
	/* here we set the new heading based on proximity (herding) */
	ha.heading = Math.round(newheading * 1000)/1000;
	if (mag > 0)
	{
		ha.runspeed = ha.maxrunspeed * d/20;  // slow down if near an attractor
	}
	
	/* TODO: influence heading based on neighbors direction of movement (queueing) */

};