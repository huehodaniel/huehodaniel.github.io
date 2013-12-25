// Prototypes e statics

Number.compare = function compare(a, b) {
    if(a < b) return -1;
    else if(a > b) return 1;
    else return 0;
};

Array.prototype.swap = function(fst, snd) {
    var tmp = this[fst];
    this[fst] = this[snd];
    this[snd] = tmp;
};

/** http://dev.enekoalonso.com/2010/07/20/little-tricks-string-padding-in-javascript/
    http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng **/
String.prototype.paddingLeft = function(paddingValue) {
   return String(paddingValue + this).slice(-paddingValue.length);
};

/** http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element **/
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

/** http://stackoverflow.com/questions/5767325/remove-specific-element-from-an-array **/
Array.prototype.remove = function(element) {
    var count = 0, index;

    while((index = this.indexOf(element)) > -1) {
       this.splice(index, 1);
       count++;
    }
    
    return count;
};

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

LU.inverse = function inverse(func) {
    return function(args) {
        return !(func(args));
    }
};

LU.merge = function merge(obj1, obj2) {
    var result = {};
    for(var p1 in obj1) 
        result[p1] = obj1[p1];
    for(var p2 in obj2) 
        result[p2] = obj2[p2];
    return result;
};

LU.identity = function identity(arg) {
    return arg;
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
};

LU.ChainTimer = function Timer(interval) {
    this.interval = interval || 1000;

    var actions = {}, actionNames = [], stop = true;

    var executer = function executer() {
        if(stop) return;

        for(var i = 0, len = actionNames.length; i < len; i++) {
            actions[actionNames[i]]();
        }

        setTimeout(executer, this.interval);
    };

    this.stop = function() {
        stop = true;
    };

    this.start = function() {
        if(stop) {
            stop = false;
            executer();
        }
    };

    this.push = function(name, func) {
        actions[name] = func;
        actionNames.remove(name);
        actionNames.push(name);
    };

    this.update = function(name, func) {
        actions[name] = func;
        if(actionNames.indexOf(name) < 0) {
            actionNames.push(name);
        }
    };

    this.remove = function(name) {
        delete actions[name];
        actionNames.remove(name);
    };
};

/** http://jquery-howto.blogspot.com.br/2009/09/get-url-parameters-values-with-jquery.html **/
/** (shitty method) **/
LU.getURLParams = function getURLParams()
{
    var queryStart = window.location.href.indexOf('?');
    if(queryStart === -1) return {}

    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars;
};

LU.getURL = function getURL()
{
    var queryStart = window.location.href.indexOf('?');
    return queryStart !== -1 ? window.location.href.slice(0, queryStart) : window.location.href;
};

LU.getAnnotatedDOMObjects = function getAnnotatedDOMObjects(annotation) {
    var objs = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-'+annotation+']'), function(e) {
        objs[e.id] = e;
    });
    return objs;
};

LU.chunkify = function chunkify(string, pieces) {
    var result = [], len = string.length / pieces, sect = 0;
    for(var i = 0; i < pieces; i++) {
        result.push(string.substring(sect, (sect += len)));
    }
    return result;
};

LU.colorCodify = function colorCodify(cssColorCode) {
    var actualCode = cssColorCode.slice(1);
    if(actualCode.length != 6) throw new TypeError("Invalid color code");

    return parseInt(actualCode, 16);
};

LU.RGBMask = {
    R: { mask: 255 << 0, shift: 0 },
    G: { mask: 255 << 8, shift: 8 },
    B: { mask: 255 << 16, shift: 16 },
};

LU.colorDecode = function colorDecode(encodedColor) {
    return "#" + encodedColor.toString(16);
};

LU.$ = function getElement(id) {
    document.getElementById(id);
};