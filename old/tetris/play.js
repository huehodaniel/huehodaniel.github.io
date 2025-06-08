
var Tetris = {};

Tetris.Directions = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

Tetris.Sequence = [
    Tetris.Directions.UP,
    Tetris.Directions.RIGHT,
    Tetris.Directions.DOWN,
    Tetris.Directions.LEFT
];

Tetris.Block = function(b1, b2, b3) {
    this.b1 = b1;
    this.b2 = b2;
    this.b3 = b3;
    this.seq = [b1, b2, b3];
};

Tetris.Block.prototype.toString = function() {
    return this.b1 + ' -> ' + this.b2 + ' -> ' + this.b3; 
};

Tetris.Blocks = {};

(function() {
    var dir = function(d) {
        return Tetris.Directions[d];
    };

    var newBlock = function(b1, b2, b3) {
        return new Tetris.Block(dir(b1), dir(b2), dir(b3));
    };

    var baseBlocks = {
        L_BLOCK       : newBlock('LEFT', 'UP', 'UP'),
        Z_BLOCK       : newBlock('LEFT', 'UP', 'LEFT'),
        I_L_BLOCK     : newBlock('RIGHT', 'UP', 'UP'),
        I_Z_BLOCK     : newBlock('RIGHT', 'UP', 'RIGHT'),
        SQUARE_BLOCK  : newBlock('LEFT', 'UP', 'RIGHT'),
        LINE_BLOCK    : newBlock('LEFT', 'LEFT', 'LEFT')
    };

    var rotate = function(block, upDir) {
        if(upDir == Tetris.Directions.UP) {
            return block;
        }

        var seq = function(b) {
            return Tetris.Sequence.wrap(b + upDir);
        };

        return new Tetris.Block(seq(block.b1), seq(block.b2), seq(block.b3));
    };

    var populate = function(block, name) {
        Tetris.Blocks[name] = {};
        for(var dir in Tetris.Directions) {
            Tetris.Blocks[name][dir] = rotate(block, Tetris.Directions[dir]);
        }
    };

    for(var b in baseBlocks) {
        populate(baseBlocks[b], b);
    }

})();

(function() {
    var elems = LU.getAnnotatedDOMObjects('game-ui');
    var w = 12, h = 12, scr = new Pixel(elems.canvas, {
        width: w,
        height: h
    });

    var center = {
        x: 6,
        y: 6
    };

    var randomParams = {
        min: 1,
        max: 24
    };

    var randomBlock = function() {
        for(var block in Tetris.Blocks) {
            for(var upDir in Tetris.Blocks[block]) {
                if(chance.natural(randomParams) == 1) {
                    return Tetris.Blocks[block][upDir];
                }
            }
         }

         return randomBlock();
    };

    var timer = new LU.ChainTimer(800);

    var createMappingsForBlock = function(block) {
        return block.seq.reduce(function(pe, ce) {
            var prev = pe.last(), next = { x: prev.x, y: prev.y }
            if(ce == Tetris.Directions.UP) next.y--;
            else if(ce == Tetris.Directions.DOWN) next.y++;
            else if(ce == Tetris.Directions.LEFT) next.x--;
            else if(ce == Tetris.Directions.RIGHT) next.x++;
            pe.push(next);
            return pe;
        }, [center]);
    };

    var mappings = [];

    var randomColorParams = {
        pool: '0123456789ABCDEF',
        length: 6
    };

    var randomColor = function() {
        return '#' + chance.string(randomColorParams);
    };

    timer.push("changeBlock", function() {
        mappings.forEach(function(e) {
            scr.set(e.x, e.y, '#000000');
        });

        mappings = createMappingsForBlock(randomBlock());

        mappings.forEach(function(e) {
            scr.set(e.x, e.y, randomColor());
        });
    });

    timer.push("draw", function() {
        scr.draw();
    });

    timer.start();
})();

