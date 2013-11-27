(function() {
	var update = document.getElementById("update");
	var next = document.getElementById("next");
	var stop = document.getElementById("stop");
	var clear = document.getElementById("clear");

	var interval = document.getElementById("genInterval");
	var canvas = document.getElementById("canvas");
	var game = new Life(canvas, {
		width: 20,
		height: 20
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

	update.addEventListener('click', function () {
		timer.interval = interval.value*1000;
		timer.restart();
	});

	next.addEventListener('click', function () {
		game.area.next();
	});

	stop.addEventListener('click', function() {
		timer.stop();
	});

	clear.addEventListener('click', function() {
		game.area.clear();
	});

	var loop = game.start();
})();