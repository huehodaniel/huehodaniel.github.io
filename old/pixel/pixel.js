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
        color: '#000000',
        style: 'fillRect'
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
                ctx[params.style](mapping.x, mapping.y, sizes.x, sizes.y);
            }
        } else {
            var values = Object.keys(modified), len = values.length;
            for(var idx = 0; idx < len; idx++) {
                var mapping = mapToCanvas(values[idx]);
                ctx.fillStyle = array[values[idx]];
                ctx[params.style](mapping.x, mapping.y, sizes.x, sizes.y);
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