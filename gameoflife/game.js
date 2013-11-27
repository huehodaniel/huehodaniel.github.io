var LU = {};

LU.pair = function pair(x, y) {
    return {
        fst: x,
        snd: y
    };
};

LU.assertRange = function assertRange(x, min, max) {
    if (x < min || x > max) throw new TypeError();
};

LU.repeat = function repeat(size, value) {
    var array = new Array(size);
    if(typeof value === "function") 
        for (var i = 0; i < size; i++) array[i] = value();
    else 
        for (var i = 0; i < size; i++) array[i] = value;
    return array;
};

LU.Timer = function Timer(func, params) {
    this.interval = params.interval || 1000;
    this.func = func;

    var timerId = 0;

    this.stop = function() {
        clearInterval(timerId);
        timerId = 0;
    };

    this.start = function() {
        if(!timerId && this.interval !== 0) {
            timerId = setInterval(this.func, this.interval);
        }
    };

    this.restart = function() {
        this.stop();
        this.start();
    };
}

function Area(x, y, rule, wrap) {
    this.width = x;
    this.height = y;
    this.size = x*y;

    this.rule = Area.getRule(this, rule);
    this.wrap = wrap !== undefined ? wrap : true;

    this.array = LU.repeat(this.size, function() {
        return LU.pair(false, false);
    });
}

Area.empty = LU.pair(false, false);

Area.neighborhood = [LU.pair(1, 0), LU.pair(1, 1), LU.pair(0, 1), LU.pair(-1, 1),
LU.pair(-1, 0), LU.pair(-1, -1), LU.pair(0, -1), LU.pair(1, -1)];

Area.rules = {
    __helpers: {
        trad: function(e, idx, self, low, high, born) {
            var count = self.__neighbors(idx).reduce(function (pe, ce) {
                var val = self.array[ce] || Area.empty;
                return val.snd ? pe + 1 : pe;
            }, 0);
            if (count < low || count > high) e.fst = false;
            else if (count === born) e.fst = true;
        }
    },
    traditional: function TraditionalLife(e, idx, self) {
        Area.rules.__helpers.trad(e, idx, self, 2, 3, 3);
    },
    couple: function CoupleLife(e, idx, self) {
        Area.rules.__helpers.trad(e, idx, self, 2, 3, 2);
    }
};

Area.getRule = function GetRule(self, ruleName) {
    var rule = Area.rules[ruleName] || Area.rules.traditional;
    return function(e, idx) {
        rule(e, idx, self);
    };
};

Area.prototype = {
    __neighbors: function (i) {
        return Area.neighborhood.map(function (e) {
            var coord = i + e.fst + this.width * e.snd;
            if(this.wrap) 
                return coord < 0 ? this.size + coord : coord % this.size;
            else
                return coord < 0 ? -1 : coord;
        }, this);
    },
    check: function (x, y) {
        LU.assertRange(x, 0, this.width - 1);
        LU.assertRange(y, 0, this.height - 1);
    },
    set: function (x, y, val) {
        this.check(x, y);
        this.array[x + this.width * y].fst = val;
    },
    get: function (x, y) {
        this.check(x, y);
        return this.array[x + this.width * y].fst;
    },
    toggle: function(x, y) {
        this.check(x, y);
        this.set(x, y, !this.get(x, y));
    },
    next: function () {
        var self = this;
        self.array.forEach(function (e) {
            e.snd = e.fst;
        });
        self.array.forEach(self.rule);
    },
    clear: function() {
        this.array.forEach(function (e) {
            e.fst = false;
        });
    }
};

var DU = {};

DU.getSizes = function getSizes(area, canvas) {
    return {
        x: (canvas.width / area.width) | 0,
        y: (canvas.height / area.height) | 0
    };
};

DU.generateDrawer = function generateDrawer(area, canvas) {
    var size = DU.getSizes(area, canvas);

    return function draw() {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        for (var x = 0; x < area.width; x++) {
            for (var y = 0; y < area.height; y++) {
                if (area.get(x, y)) 
                    ctx.fillRect(x * size.x, y * size.y, size.x, size.y);
                else
                    ctx.strokeRect(x * size.x, y * size.y, size.x, size.y);
            }
        }
        ctx.fillStyle = 'white';
    };
};

DU.getCoord = function getCoord(absPos, cellSize) {
    return {
        x: (absPos.x / cellSize.x) | 0,
        y: (absPos.y / cellSize.y) | 0
    };
};

DU.enableClickEvent = function enableClickEvent(area, canvas) {
    var size = DU.getSizes(area, canvas);
    canvas.addEventListener('click', function (event) {
        var pos = DU.getCoord(canvas.relMouseCoords(event), size) 
        area.toggle(pos.x, pos.y);
    });
};

HTMLCanvasElement.prototype.relMouseCoords = function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {
        x: canvasX,
        y: canvasY
    };
};

function Life(canvas, params) {
    var width = params.width || 30;
    var height = params.height || 30;
    var rule = params.rule || "traditional";
    var started = false;

    this.area = new Area(width, height, rule);
    this.drawer = DU.generateDrawer(this.area, canvas);
    this.canvas = canvas;

    var self = this;

    this.start = function(drawInterval) {
        if(!started) {
            started = true;
            DU.enableClickEvent(this.area, this.canvas);
            return setInterval(self.drawer, drawInterval || 75);
        }
    };    
};