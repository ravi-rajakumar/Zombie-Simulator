zm.range = function (a,b) {
	return Math.pow((Math.pow((a.getpos().x)-(b.getpos().x),2) + Math.pow((a.getpos().y)-(b.getpos().y),2)),0.5); 
}

zm.sees = function (a,b) {
	return zm.range(a,b) < zm.recognitionRange;
}