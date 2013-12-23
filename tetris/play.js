function GameField() {
    var points = 0;

    var array = LU.repeat(20, function() {
        return LU.repeat(10, false);
    });

    this.mark = function(x, y) {
        array[y][x] = true;
    };

    this.unmark = function(x, y) {
        array[y][x] = false;
    };

    this.set = function(x, y, v) {
        array[y][x] = v;
    };

    this.check = function() {
        var check = array.filter(function(e) {
            return e.every(function(j) {
                return j;
            });
        });
    }
}

function Block(pixels, field) {
    var blockPixels = pixels;
    var gameField = field;
    var position = 0;

    this.update = function() {
        blockPixels.forEach(function(e) {
            field.set(e.x, e.y, "#000000");
        });

        blockPixels = blockPixels.map(function(e) {
            return {
                x: position + e.x, 
                y: e.y + 1
            };
        });

        blockPixels.forEach(function(e) {
            field.set(e.x, e.y, "#e0e0e0");
        });
    };

    this.left = function() {
        position--;
    };

    this.right = function() {
        position++;
    };

    this.up = function(times) {
        blockPixels = blockPixels.map(function(e) {
            return {
                x: e.x, 
                y: e.y - times
            };
        });
    };
}

(function() {
    var canvas = document.getElementById('canvas');

    var w = 40, h = 30, scr = new Pixel(canvas, {
        width: w,
        height: h
    });

    var desloc = 10;
    var box = new Block([
    {
        x: desloc + 0, 
        y: desloc + 0
    },
    {
        x: desloc + 1,
        y: desloc + 0,
    },
    {
        x: desloc + 0,
        y: desloc + 1
    },
    {
        x: desloc + 1,
        y: desloc + 1
    }], scr);

    var i = 0;
    var timer = new LU.Timer(function() {
        if(chance.bool()) box.left();
        else box.right();
        box.update();
        scr.draw();
        if(i++ > 15) {
            i = 0;
            box.up(desloc);
        }
    }, 1000);

    timer.start();

})();