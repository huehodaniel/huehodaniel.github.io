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
        counter: function(e, idx, self) {
            return self.__neighbors(idx).reduce(function (pe, ce) {
                var val = self.array[ce] || Area.empty;
                return val.snd ? pe + 1 : pe;
            }, 0);
        },
        trad: function(e, idx, self, low, high, born) {
            var count = Area.rules.__helpers.counter(e, idx, self);
            if (count < low || count > high) e.fst = false;
            else if (count === born) e.fst = true;
        },
        virus: function(e, idx, self, min, max) {
            var count = Area.rules.__helpers.counter(e, idx, self);
            if(count > min) e.fst = true;
            if(count > max) e.fst = false;
        },
    },
    traditional: function TraditionalLife(e, idx, self) {
        Area.rules.__helpers.trad(e, idx, self, 2, 3, 3);
    },
    couple: function CoupleLife(e, idx, self) {
        Area.rules.__helpers.trad(e, idx, self, 2, 3, 2);
    },
    virus: function VirusMode(e, idx, self) {
        Area.rules.__helpers.virus(e, idx, self, 0, 4);
    },
    watershed: function CannibalMode(e, idx, self) {
        var rain = chance.bool({likelihood: 25});
        if(rain) self.array[idx].fst = rain;
        else Area.rules.__helpers.virus(e, idx, self, 2, 7);
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
}