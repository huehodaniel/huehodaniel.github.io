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

    var modified = {};
    var filled = false;

    var mapToArray = function mapToArray(x, y) {
        return x + params.width * y;
    };

    var mapToField = function mapToField(i) {
        return {
            x: i % params.width,
            y: (i / params.width) | 0
        }
    };

    var mapToCanvas = function mapToCanvas(i) {
        var toField = mapToField(i);
        return {
            x: toField.x * sizes.x,
            y: toField.y * sizes.y
        };
    };


    this.set = function setPixel(x, y, value) {
        var pos = mapToArray(x, y);
        if(array[pos] !== value) {
            modified[pos] = true;
            array[pos] = value;
        }
    };

    this.get = function getPixel(x, y) {
        return array[mapToArray(x, y)];
    };

    this.fill = function fillCanvas(value) {
        filled = true;
        for(var i = 0; i < arraySize; i++) {
            array[i] = value;
        }
    };

    this.draw = function drawCanvas() {
        if(filled) {
            for(var idx = 0; idx < arraySize; idx++) {
                var mapping = mapToCanvas(idx);
                ctx.fillStyle = array[idx];
                ctx.fillRect(mapping.x, mapping.y, sizes.x, sizes.y);
            }
        } else {
            var values = Object.keys(modified), len = values.length;
            for(var idx = 0; idx < len; idx++) {
                var mapping = mapToCanvas(values[idx]);
                ctx.fillStyle = array[values[idx]];
                ctx.fillRect(mapping.x, mapping.y, sizes.x, sizes.y);
            }
        }

        filled = false;
        modified = {};
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

    this.info = function Info() {
        return {
            sizes: sizes,
            canvas: canvas
        };
    }

    this.fill(params.color);
}

function PixelEditor(pixelObj, colorPickerObj) {
    var pixelData = pixelObj.info();

    var getCoord = function getCoord(absPos, cellSize) {
        return {
            x: (absPos.x / cellSize.x) | 0,
            y: (absPos.y / cellSize.y) | 0
        };
    };

    var canvas = pixelData.canvas;
    var selectedColor = "#000000";

    canvas.addEventListener('click', function (event) {
        var pos = getCoord(canvas.relMouseCoords(event), pixelData.sizes);
        pixelObj.set(pos.x, pos.y, selectedColor);
    });

    var validate = /^#[A-Fa-f0-9]{6}$/
    
    this.setColor = function() {
        if(validate.test(colorPicker.value)) {
            selectedColor = colorPicker.value;
        }
    };
}

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