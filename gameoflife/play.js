(function() {
	var UI = LU.getAnnotatedDOMObjects("game-ui");
	var params = LU.merge({
		width: 20,
		height: 20,
		rules: "traditional",
		interval: 0
	}, LU.getURLParams());

	var game = new Life(UI.canvas, {
		width: params.width,
		height: params.height,
		rule: params.rules,
		interval: params.interval
	});

	var rndParams = {
		x: {
			min: 0,
			max: game.area.width - 1
		},
		y: {
			min: 0,
			max: game.area.height - 1
		}
	};

	LU.repeat((game.area.size/5) | 0, function() {
		return LU.pair(chance.natural(rndParams.x), chance.natural(rndParams.y));
	}).forEach(function(e) {
		game.area.toggle(e.fst, e.snd);
	});

	var timer = new LU.Timer(function() {
		game.area.next();
	}, 0);

	UI.update.addEventListener('click', function () {
		timer.interval = params.interval*1000;
		if(timer.interval !== 0) {
			timer.restart();
			UI.update.innerHTML = "Update";
		} else {
			UI.update.innerHTML = "Resume";
		}
	});

	UI.next.addEventListener('click', function () {
		game.area.next();
	});

	UI.stop.addEventListener('click', function() {
		timer.stop();
		UI.update.innerHTML = "Resume";
	});

	UI.clear.addEventListener('click', function() {
		game.area.clear();
	});

	function setEventValueGetter(paramList, dom) {
		paramList.forEach(function(param) {
			dom[param].addEventListener('change', function() {
				params[param] = dom[param].value;
			});
		});
	}

	setEventValueGetter('width,height,rules,interval'.split(','), UI);

	UI.reload.addEventListener('click', function() {
		var urlParams = [];
		for(var p in params) {
			urlParams.push(p + '=' + params[p]);
		}
		window.location.replace(LU.getURL() + '?' + urlParams.join('&'));
	});

	function modifyIfDef(obj, value) {
		if(value) obj.value = value;
	}
	
	modifyIfDef(UI.width, params.width);
	modifyIfDef(UI.height, params.height);
	modifyIfDef(UI.rules, params.rules);
	modifyIfDef(UI.interval, params.interval);

	game.start(50);
})();