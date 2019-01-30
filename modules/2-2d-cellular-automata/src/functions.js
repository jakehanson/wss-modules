function matrix(d, fill = 0){
    var _mat = new Array(d);

    for (var i = 0; i < d; i++){
        _mat[i] = new Int8Array(d).fill(fill);
    }
    
    return _mat;
};

// # A Cell

class Cell{
    constructor(index_t, index_x, space_size, frameName = 'CA', frame_size = 500, background = 'gray'){
        this.index_t = index_t;
        this.index_x = index_x;
        this.space_size = space_size;
        this.frame_size = frame_size;
        this.frame = d3.select('#' + frameName);
        this.background = background;
        this._type = 1;

        this.bondRatio = 0.05;
        this.cell_px_size = this.frame_size / this.space_size;

        this.makeCell();
    }

    makeCell(){
        this.self = this.frame.append('rect');

        this.self.attr('x', this.cell_px_size * this.index_x + this.bondRatio * this.cell_px_size)
            .attr('y', this.cell_px_size * this.index_t + this.bondRatio * this.cell_px_size)
            .attr('height', this.cell_px_size - 2 * this.bondRatio * this.cell_px_size)
            .attr('width', this.cell_px_size - 2 * this.bondRatio * this.cell_px_size)
            .attr('fill', 'black');
    }

    set type(t){
        if (t == 1 || t == 0 || t == null){
            this._type = t;

            if (t == 1) {
                this.self.attr('fill', 'black');
            }
            if (t == 0) {
                this.self.attr('fill', 'white');
            }
            if (t == null) {
                this.self.attr('fill', this.background);
            }
        }
        
    }

    get type(){
        return this._type;
    }

    get x(){
        return this.index_x;
    }

    get t(){
        return this.index_t;
    }
}

// # 2D Cellular Automata Object

class CA2D{
    constructor(cell_dim, px_dim, id){
        this.mat = new matrix(cell_dim);
        this.next_mat = new matrix(cell_dim);
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
        this.next_mat = new matrix(this.cell_dim);
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

        _cell.attr('_x', x)
            .attr('_y', y);

        _cell.on('click', () => this.flipCell(x, y));
        _cell.on('mouseover', this.handleMouseOver);
        _cell.on('mouseout', this.handleMouseOut);
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
        this.stop();
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

    handleMouseOver(){
        d3.select(this).attr('stroke', '#31a8f0');
        //console.log(this['id']);
    }

    handleMouseOut(){
        d3.select(this).attr('stroke', null);
        //console.log(this['id']);
    }

    flipCell(_x, _y){
        this.setCell(_x, _y, 1 - this.mat[_x][_y]);
    }

    gridMove(x, m){
        return (x + this.cell_dim + m) % this.cell_dim;
    }

    countNeighbor(i, j){
        var count = 0;
        count = this.mat[this.gridMove(i, -1)][this.gridMove(j, -1)] + 
                this.mat[this.gridMove(i, -1)][this.gridMove(j, 0)] + 
                this.mat[this.gridMove(i, -1)][this.gridMove(j, 1)] +
                this.mat[this.gridMove(i, 0)][this.gridMove(j, -1)] +
                //this.mat[this.gridMove(i, 0)][this.gridMove(j, 0)] +
                this.mat[this.gridMove(i, 0)][this.gridMove(j, 1)] +
                this.mat[this.gridMove(i, 1)][this.gridMove(j, -1)] +
                this.mat[this.gridMove(i, 1)][this.gridMove(j, 0)] +
                this.mat[this.gridMove(i, 1)][this.gridMove(j, 1)];
        return count;
    }

    updateNextMat(){
        //Any live cell with fewer than two live neighbors dies, as if by underpopulation.
        //Any live cell with two or three live neighbors lives on to the next generation.
        //
        //Any live cell with more than three live neighbors dies, as if by overpopulation.
        //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        for (var i = 0; i < this.cell_dim; i++){
            for (var j = 0; j < this.cell_dim; j++){
                if (this.mat[i][j] == 0){
                    // dead cell
                    if (this.countNeighbor(i, j) == 3) {
                        this.next_mat[i][j] = 1;
                    }
                } else {
                    // live cell
                    var nb = this.countNeighbor(i, j);
                    if (nb < 2) {
                        //Any live cell with fewer than two live neighbors dies, as if by underpopulation.
                        this.next_mat[i][j] = 0;
                    } else {
                        if (nb == 2 || nb == 3) {
                            //Any live cell with two or three live neighbors lives on to the next generation.
                            this.next_mat[i][j] = 1;
                        } else {
                            //Any live cell with more than three live neighbors dies, as if by overpopulation.
                            this.next_mat[i][j] = 0;
                        }
                    }
                }
            }
        }
    }

    updatePlot(){
        for (var i = 0; i < this.cell_dim; i++){
            for (var j = 0; j < this.cell_dim; j++){
                this.setCell(i, j, this.next_mat[i][j]);
            }
        }
        return 0;
    }

    step(){
        //Any live cell with fewer than two live neighbors dies, as if by underpopulation.
        //Any live cell with two or three live neighbors lives on to the next generation.
        //
        //Any live cell with more than three live neighbors dies, as if by overpopulation.
        //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
        this.updateNextMat();
        this.updatePlot();
        return 0;
    }

    clickstep(){
        this.stop();
        this.step();
    }

    run(dt = 500){
        this.interval = d3.interval(() => this.step(), dt);
        document.getElementById('RunCA').disabled = true;
    }

    stop(){
        try{
            // Incase there is no interval variable
            this.interval.stop();
        } 
        catch(err){

        }
        document.getElementById('RunCA').disabled = false;
        return;
    }

    setSize(){
        this.stop();

        this.setDim(parseInt(document.getElementById("CASize").value));

        return;
    }

    clean(){
        this.stop();

        this.setDim(this.cell_dim);
    }
}