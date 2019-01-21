function matrix(d, fill = 0){
    var _mat = new Array(d);

    for (var i = 0; i < d; i++){
        _mat[i] = new Int8Array(d).fill(fill);
    }
    
    return _mat;
};

class CA2D{
    constructor(cell_dim, px_dim, id){
        this.mat = new matrix(cell_dim);
        this.cell_dim = cell_dim;
        this.graphSize = px_dim;
        this.obj = d3.select('#' + id);

        setBackground();
        setInitCells(cell_dim);
    };

    setBackground(){
        obj.append('rect')
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
                putInitCell(i, j, this.graphSize, _cell_dim);
            }
        }
        return 0;
    }
}