Array.prototype.last = function() {
    return this[this.length - 1];
};


//@unused
function discretize(min, max, pass) {
    var len = (max - min)/pass + 1, arr = new Array(len);
    for(var i = 0; i < len; i++) {
        arr[i] = min + pass*i;
    }
    return arr;
}

function problem(params) {
    return Math.pow(Math.E, -params.y);
}

function invert(f) {
    return function(params) {
        return 1/f(params);
    };
}

function rk_form(f, h) {
    return function(params) {
        return h*f(params);
    };
}

function next_K(accum, c, h, xn, yn, rk_f) {
    accum.push(rk_f({
        x: xn + c*h,
        y: yn + c*accum.last()
    }));
    return accum;
}

function reduce_next_K(h, xn, yn, rk_f) {
    return function(accum, c) {
        return next_K(accum, c, h, xn, yn, rk_f);
    };
}

function generate_Ks(f, h, xn, yn) {
    var rk_f = rk_form(f, h);
    return [0.5, 0.5, 1.0].reduce(
        reduce_next_K(h, xn, yn, rk_f),
        [rk_f({
            x: xn,
            y: yn
        })]);
}

function sum_Ks(k_arr) {
    return (k_arr[0] + 2*k_arr[1] + 2*k_arr[2] + k_arr[3])/6;
}

function runge_kutta_4_next(f, h, xn, yn) {
    return sum_Ks(generate_Ks(f, h, xn, yn));
}

function runge_kutta_4(f, h, x0, xn, y0) {
    var x = x0, y = y0;
    console.log(x, " -> ", y);
    while(x < xn) {
        y += runge_kutta_4_next(f, h, x, y);
        x += h;
        console.log(x, " -> ", y);
    }
}


