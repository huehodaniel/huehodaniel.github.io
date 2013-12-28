var consoleNode = LU.$('htmlconsole') ;

function newLine(text) {
    var elem = document.createElement('p');
    elem.classList.add('console-line');
    elem.appendChild(document.createTextNode(text));
    return elem;
}

console.__log = console.log;

console.log = function() {
    console.__log.apply(null, arguments);
    consoleNode.appendChild(newLine(LU.map(arguments, function(e) {
        return JSON.stringify(e);
    }).join(' ')));
};

function __separate(arr) {
    if(arr.length < 2) return LU.pair(arr, null);
    
    var next = [];
    
    function pushNext(e) {
        next.push(e);
    }
    
    var i = 0;
    while(true) {
        if(arr[i] >= arr[i + 1]) {
            arr.splice(i+1, 1).forEach(pushNext);
        } else {
            i++;
        }
        
        if(i >= arr.length - 1) break;
    }
    
    return LU.pair(arr, next);
}

function separate(arr) {
    var intermediary, result = [];
    do {
        intermediary = __separate(intermediary.snd);
        result.push(intermediary.fst);
    } while(intermediary.snd !== null);
    return intermediary;
}

function merge(segments) {
    function notEmpty(arr) {
        return arr.length > 0;
    }
    
    var result = [];
    while(notEmpty(segments)) {
        var idx = -1, min = Infinity;
        segments.forEach(function(e, i) {
            if(e[0] < min) {
                min = e[0];
                idx = i;
            }
        });
        if(idx == -1) break;
        
        result.push(min);
        segments[idx].shift();
        if(!notEmpty(segments[idx])) {
            segments.splice(idx, 1);
        }
    }
    
    return result;
}

function sort(arr) {
    return merge(separate(arr));
}

function randomArr(n) {
    var i = 0, arr = [];
    while(i++ < n) {
        arr.push(Math.random());
    }
    return arr;
}