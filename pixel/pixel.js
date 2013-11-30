function Pixel(canvas, parameters) {
    var ctx = canvas.getContext("2d");
    if(!ctx) {
        throw new TypeError("No canvas object");
    }

    var params = LU.merge({
        width: 320,
        height: 240,
        canvasX: 0,
        canvasY: 0,
        color: '#000000'
    }, parameters);

    var arraySize = params.width * params.height;
    var array = new Array(arraySize);
    var sizes = {
        x: (canvas.width / params.width) | 0,
        y: (canvas.height / params.height) | 0,
    };

    var modified = [];

    var mapToCanvas = function mapToCanvas(i) {
        return {
            x: sizes.x * (i % params.height), 
            y: sizes.y * ((i / params.height) | 0)
        };
    };

    var mapToPixel = function mapToPixel(x, y) {
        return x + params.width*y;
    };

    this.set = function setPixel(x, y, value) {
        var pos = mapToPixel(x, y);
        if(array[pos] !== value) {
            modified.push(pos);
            array[pos] = value;
        }
    };

    this.get = function getPixel(x, y) {
        return array[mapToPixel(x, y)];
    };

    this.fill = function fillCanvas(value) {
        for(var i = 0; i < arraySize; i++) {
            modified.push(i);
            array[i] = value;
        }
    };

    this.draw = function drawCanvas() {
        var modLen = modified.length;
        for(var idx = 0; idx < modLen; idx++) {
            var modIdx = modified[idx], mapping = mapToCanvas(modIdx);
            ctx.fillStyle = array[modIdx];
            ctx.fillRect(mapping.x, mapping.y, sizes.x, sizes.y);
        }
        modified.length = 0;
    };

    this.export = function exportCanvas(name) {
        var exported = {
            name: name,
            data: new Array(arraySize)
        };
        array.forEach(function(e, idx) {
            data[idx] = LU.colorCodify(e);
        });

        return JSON.stringify(exported);
    };

    this.import = function importCanvas(jsonObj) {
        var imported = JSON.parse(jsonObj);

        imported.data.forEach(function(e, idx) {
            array[idx] = LU.colorDecode(e);
        });
    };

    this.fill(params.color);
}

(function() {
    var elems = LU.getAnnotatedDOMObjects('game-ui');
    var w = 160, h = 120, scr = new Pixel(elems.canvas, {
        width: w,
        height: h
    });
    
    var rand = function(min, max) {
        return chance.natural({min: min, max: max - 1});
    };

    var dot = function() {
        var rX = rand(0, w), rY = rand(0, h), rC = '#' + rand(0, 1 << 24).toString(16).paddingLeft('000000');
        scr.set(rX, rY, rC);
    };

    var rep = 20;
    setInterval(function() {
        for(var i = 0; i < rep; i++) dot();
    }, 25);

    setInterval(function() {
        scr.draw();
    }, 10);

})();