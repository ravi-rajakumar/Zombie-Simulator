z.draw = function () {
	var i = 0, 
		j = 0,
		paint = function (o) {
			var radius = o.isZombie() ? 1.5 : 1;
			
			z.context.beginPath();
			
			try
			{
				z.context.arc(Math.floor(o.position.x / z.scale), Math.floor(o.position.y / z.scale), radius, 0, Math.PI * 2, true);
			}
			catch (e)
			{
				console.log(e);
			}
			
			z.context.fillStyle = o.color;
			
			z.context.fill();
		};
				
		z.frameCounter += 1;
		
		z.context.clearRect(0, 0, z.canvas.width, z.canvas.height);
		
		for (i = 0, j = z.humans.length; i < j; i++)
		{
			paint(z.humans[i]);
		}
		
		for (i = 0, j = z.zombies.length; i < j; i++)
		{
			paint(z.zombies[i]);
		}
};

z.circle = function (spec) {
	if (z.canvas.getContext) 
	{
		var context = z.canvas.getContext('2d'),
			radius = 6;
			context.beginPath();
			try
			{
				context.arc(Math.floor(spec.position.x / z.scale), Math.floor(spec.position.y / z.scale), radius, 0, Math.PI * 2, true);
			}
			catch (e)
			{
				console.log(e);
			}
			context.strokeStyle = 'rgba(255,0,0,0.5)';
			context.stroke();
	}
};

// this flashes a circle around a selected humanoid
z.flash = function (spec) {
	var c = setInterval(function () {
			z.circle(spec);
		}, 17),
		fl = setTimeout(function () {
			clearInterval(c);
		}, 52);
};

// this draws a circle around a selected humanoid
z.highlight = function (spec) {
	z.draw();
	if (z.canvas.getContext) 
	{
		var context = z.canvas.getContext('2d'),
			radius = 5;
			context.beginPath();
			try
			{
				context.arc(Math.floor(spec.position.x / z.scale), Math.floor(spec.position.y / z.scale), radius, 0, Math.PI * 2, true);
			}
			catch (e)
			{
				console.log(e);
			}
			context.fillStyle = 'rgba(0,127,64,0.2)';
			context.fill();
	}
};

z.specifyTarget = function (list, x, y) {
	var humans = document.createElement('ul'),
		zombies = document.createElement('ul'),
		inspector,
		ctl = document.getElementById('controls'),
		position = {
			x: 0,
			y: 0
		},
		tmp, 
		i, 
		j;
		
	// if the inspector is already present, grab it, otherwise create one
	if (document.getElementById('inspector')) {
		inspector = document.getElementById('inspector');
		$(inspector).html('');
	} else {
		inspector = document.createElement('div');
	}
	
	inspector.setAttribute('id', 'inspector');
	
	for (i = 0, j = list.length; i < j; i++) {
		var classes = '';
		tmp = document.createElement('li');
		$(tmp).text(list[i].guid);
		if (list[i].sleeping) {
			classes += 'sleeping ';
		}
		if ((list[i].deadtimer !== null || list[i].livetimer !== null) && !list[i].isZombie()) {
			classes += 'infected';
		}
		if (classes !== '') {
			tmp.setAttribute('class', classes);
		}
		if (list[i].isZombie()) {
			zombies.appendChild(tmp);
		} else {
			humans.appendChild(tmp);
		}
	}
	
	if (humans.hasChildNodes()) {
		tmp = document.createElement('h5');
		$(tmp).text('Humans:');
		inspector.appendChild(tmp);
		inspector.appendChild(humans);
	}
	
	if (zombies.hasChildNodes()) {
		tmp = document.createElement('h5');
		$(tmp).text('Zombies:');
		inspector.appendChild(tmp);
		inspector.appendChild(zombies);
	}
	
	ctl.appendChild(inspector);
	
	position = z.getInspectorPosition(x * z.scale, y * z.scale);
	
	inspector.style.marginLeft = position.x + 'px';
	inspector.style.marginTop = position.y + 'px';
	
	$(inspector).show();
	z.inspectorUp = true;
};

z.inspect = function (o) {
	var inspector,
		form = document.createElement('form'),
		tmp = null,
		type = null,
		addInput = function (name, label, val) {
			tmp = z.createBasicInput(name, label + ': ', val);
			form.appendChild(tmp[0]);
			form.appendChild(tmp[1]);
		},
		ctl = document.getElementById('controls'),
		position = {
			x: 0,
			y: 0
		};
	
	// if the inspector is already present, grab it, otherwise create one
	if (document.getElementById('inspector')) {
		inspector = document.getElementById('inspector');
		$(inspector).html('');
	} else {
		inspector = document.createElement('div');
	}
	
	inspector.setAttribute('id', 'inspector');
	
	$(form).attr({
		action: '',
		method: 'POST'
	});
	
	type = (o.isZombie()) ? 'zombie' : 'human';
	addInput('i_type', 'type', type);
	addInput('i_id', 'id', o.guid);
	addInput('i_alive', 'alive', !o.dead);
	addInput('i_next_in_q', 'next action in queue', '' + o.actionQueue[0]);
	addInput('i_position', 'position', 'x = ' + z.round(o.position.x, 3) + ', y = ' + z.round(o.position.y, 3));
	addInput('i_heading', 'heading', z.round(o.heading, 3));
	addInput('i_target', 'has a target', '' + (o.currentTarget !== null));
	// these attributes are only relevant to humans
	if (!o.isZombie()) {
		addInput('i_aggressiveness', 'aggressiveness', z.round(o.aggressiveness, 3));
		addInput('i_heroism', 'heroism', z.round(o.maxHeroism, 3));
		addInput('i_zkillfitness', 'zombie killing fitness', o.zombieKillingFitness);
		addInput('i_recognition', 'recognition range', o.recognitionRange);
		addInput('i_sleeping', 'sleeping', '' + o.sleeping);
		addInput('i_slept', 'sleep reservoir', z.round(o.slept / 3600, 3) + ' hours');
		addInput('i_stamina', 'stamina', z.round(o.stamina, 3) + '%');
		addInput('i_zombifying', 'turning zombie', '' + (o.deadtimer !== null || o.livetimer !== null));
	}
	addInput('i_maxspeed', 'max. walking speed', z.round(o.maxWalkingSpeed, 3));
	addInput('i_influencew', 'weight of influences', '' + (o.influences.w - 1));
	
	inspector.appendChild(form);
	ctl.appendChild(inspector);
	
	position = z.getInspectorPosition(o.position.x, o.position.y);
	
	inspector.style.marginLeft = position.x + 'px';
	inspector.style.marginTop = position.y + 'px';
	
	$(inspector).show();
	z.inspectorUp = true;
};

z.hideInspector = function () {
	$(inspector).hide();
	z.inspectorUp = false;
};

z.createBasicInput = function (name, label, val) {
	var ret = [],
		l = document.createElement('label'),
		i = document.createElement('input');
	
	l.setAttribute('for',name);
	l.innerHTML = label;
	i.setAttribute('type', 'text');
	i.setAttribute('name', name);
	i.setAttribute('id', name);
	i.setAttribute('disabled', true);
	
	if (val) {
		i.setAttribute('value', val);
	}
	
	ret.push(l);
	ret.push(i);
	
	return ret;
};

// based on x and y coords of the object we'll attach either the top-left, top-right, bottom-left, or bottom-right corner of the inspector window to the center of the object
z.getInspectorPosition = function (x, y) {
	var ret = {
		x: Math.round(x / z.scale),
		y: Math.round(y / z.scale) + ($('#zombie-world').offset().top - $('#controls').offset().top)
	};
	
	if (y > z.canvasHeight * z.scale / 2) {
		ret.y -= $('#inspector').outerHeight();
	}
	
	if (x > z.canvasWidth * z.scale / 2) {
		ret.x -= $('#inspector').outerWidth();
	} 
	
	return ret;
};