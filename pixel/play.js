(function() {
    var elems = LU.getAnnotatedDOMObjects('game-ui');
    var w = 40, h = 30, scr = new Pixel(elems.canvas, {
        width: w,
        height: h
    });

    var editor = new PixelEditor(scr, elems.colorPicker);

    var rand = function(min, max) {
        return chance.natural({min: min, max: max - 1});
    };

    var dot = function() {
        var rX = rand(0, w), rY = rand(0, h), rC = '#' + rand(0, 1 << 24).toString(16).paddingLeft('000000');
        return {
            x: rX,
            y: rY,
            c: rC
        };
    };

    var dotter = function() {
        var randDot = dot();
        scr.set(randDot.x, randDot.y, randDot.c);
    };

    var repeater = function(func, times) {
        return function() {
            var t = times;
            while(t-- > 0) func();
        }
    };

    var timer = new LU.ChainTimer(50);

    var rainbowing = false;
    elems.rainbow.addEventListener('click', function () {
        if(rainbowing){
            timer.remove("rainbow");
            rainbowing = false;
            elems.rainbow.innerHTML = "Rainbow"
        } else {
            timer.push("rainbow", repeater(dotter, 5));
            rainbowing = true;
            elems.rainbow.innerHTML = "Stop Rainbow"
        }
    });

    elems.colorSet.addEventListener('click', function () {
        editor.setColor();
    });

    timer.push("draw", function() {
        scr.draw();
    });

    timer.start();

})();