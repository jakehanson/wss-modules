function matrix(d, fill = 0){
    var _mat = new Array(d);

    for (var i = 0; i < d; i++){
        _mat[i] = new Int8Array(d).fill(fill);
    }
    
    return _mat;
};

// # 2D Cellular Automata Object

class CA2D{
    constructor(cell_dim, px_dim, id){
        this.mat = new matrix(cell_dim);
        this.cell_dim = cell_dim;
        this.graphSize = px_dim;
        this.obj = d3.select('#' + id);
        this.cellSize = this.graphSize / this.cell_dim;
        this.bondRatio = 0.05

        this.clearAll();
        this.setBackground();
        this.setInitCells(this.cell_dim);
    };

    setDim(cell_dim){
        // Reset cell_dim and clear all cells
        this.cell_dim = cell_dim;
        this.clearAll();
        this.setBackground();
        this.setInitCells(this.cell_dim);
    }

    clearAll(){
        // Clear all things
        this.mat = new matrix(this.cell_dim);
        this.cellSize = this.graphSize / this.cell_dim;

        this.obj.selectAll('rect').remove();
    }

    setBackground(){
        this.obj.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', this.graphSize)
            .attr('width', this.graphSize)
            .attr('fill', 'gray');
        return 0;
    }

    setInitCells(_cell_dim){
    
        for (var i = 0; i < _cell_dim; i++){
            // i: row 行
            for (var j = 0; j < _cell_dim; j++){
                // j: column 列
                this.putInitCell(i, j, this.graphSize, _cell_dim);
            }
        }
        return 0;
    }

    putInitCell(x, y, _pxSize, _matSize){
        // Put a cell at row x and column y. Add id = cell_x_y
        var _cell = this.obj.append('rect');
    
        _cell.attr('x', x * this.cellSize + this.cellSize * this.bondRatio)
            .attr('y', y * this.cellSize + this.cellSize * this.bondRatio)
            .attr('height', this.cellSize * (1 - 2 * this.bondRatio))
            .attr('width', this.cellSize * (1 - 2 * this.bondRatio))
            .attr('fill', 'white')
            .attr('id', 'Cell_' + x + ', ' + y);
        return 0;
    }

    setCell(i, j, color = 1){
        // color: 0 or 1. 0: white, 1: black
        this.mat[i][j] = color;
        if (color == 0){
            this.obj.select("rect[id='Cell_" + i + ', ' + j + "']")
                .attr('fill', 'white');
        } else {
            this.obj.select("rect[id='Cell_" + i + ', ' + j + "']")
                .attr('fill', 'black');
        }
    }

    setRandomCells(p = 0.5){
        var i, j;
        for (i = 0; i < this.cell_dim; i++){
            for (j = 0; j < this.cell_dim; j++){
                if (Math.random() < p){
                    // Set to black
                    this.setCell(i, j, 1);
                } else {
                    // Set to white
                    this.setCell(i, j, 0);
                }
                
            }
        }
        return 0;
    }
}