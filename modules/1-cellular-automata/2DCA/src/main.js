// Constants

// Global Variables
var pxSize = 500;
var matSize = 16;
var cellSize = pxSize / matSize;
var bondRatio = 0.05;

// # INIT
init();

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

function setRandomCells(p = 0.5){
    var i, j;
    for (i = 0; i < matSize; i++){
        for (j = 0; j < matSize; j++){
            if (Math.random() < p){
                // Set to black
                d3.select("#CA").select("rect[id='Cell_" + i + ', ' + j + "']")
                    .attr('fill', 'black');
            } else {
                // Set to white
                d3.select("#CA").select("rect[id='Cell_" + i + ', ' + j + "']")
                    .attr('fill', 'white');
            }
            
        }
    }
    return 0;
}