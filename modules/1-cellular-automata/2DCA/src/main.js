// Constants

// Global Variables
var pxSize = 500;
var matSize = 16;
var cellSize = pxSize / matSize;
var bondRatio = 0.05;
var mat = new matrix(matSize);
var next_mat = new matrix(matSize);

// # INIT
//init();
caMap = new CA2D(16, 400, 'CA');

// # FUNCTIONS

// ## Basic functions

function init(){
    setBackground();
    setInitCells(matSize);
    return 0;
}

function setBackground(){
    d3.select("#CA")
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', pxSize)
        .attr('width', pxSize)
        .attr('fill', 'gray');
    return 0;
}

function setInitCells(_matSize){
    var i, j;

    for (i = 0; i < _matSize; i++){
        // i: row 行
        for (j = 0; j < _matSize; j++){
            // j: column 列
            putInitCell(i, j, pxSize, _matSize);
        }
    }
    return 0;
}

function putInitCell(x, y, _pxSize, _matSize){
    // Put a cell at row x and column y. Add id = cell_x_y
    var _cell = d3.select("#CA").append('rect');

    _cell.attr('x', x * cellSize + cellSize * bondRatio)
        .attr('y', y * cellSize + cellSize * bondRatio)
        .attr('height', cellSize * (1 - 2 * bondRatio))
        .attr('width', cellSize * (1 - 2 * bondRatio))
        .attr('fill', 'white')
        .attr('id', 'Cell_' + x + ', ' + y);
    return 0;
}

// # Set Cells

function setCell(i, j, color){
    // color: 0 or 1. 0: white, 1: black
    mat[i][j] = color;
    if (color == 0){
        d3.select("#CA").select("rect[id='Cell_" + i + ', ' + j + "']")
            .attr('fill', 'white');
    } else {
        d3.select("#CA").select("rect[id='Cell_" + i + ', ' + j + "']")
            .attr('fill', 'black');
    }
}

function setRandomCells(p = 0.5){
    var i, j;
    for (i = 0; i < matSize; i++){
        for (j = 0; j < matSize; j++){
            if (Math.random() < p){
                // Set to black
                setCell(i, j, 1);
            } else {
                // Set to white
                setCell(i, j, 0);
            }
            
        }
    }
    return 0;
}