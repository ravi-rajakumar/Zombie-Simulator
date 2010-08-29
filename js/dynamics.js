// basic physical functions and calculators

z.range = function (a,b) {
	return Math.pow((Math.pow((a.getpos().x)-(b.getpos().x),2) + Math.pow((a.getpos().y)-(b.getpos().y),2)),0.5); 
}

z.sees = function (a,b) {
	return z.range(a,b) < z.recognitionRange;
}