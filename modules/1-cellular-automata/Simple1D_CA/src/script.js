// constants
const svg_width = 500.;
const svg_height = 500.;
const spaceSize = 20;

// Set head color
d3.selectAll("h1").style("color", "cc3311")

d3.select("#CA")
    .attr('height', svg_height)
    .attr('width', svg_width);

// Set SVG

AddBackGround();

setRandomCells();

function clearCells(){
    /*d3.select("#CA").selectAll('rect')
        .transition()
        .duration(500)
        .attr('fill', 'gray')*/
    d3.select("#CA").selectAll('rect')
        .remove();
    AddBackGround();
}

function setRandomCells(){
    clearCells();
    var i;
    var j;
    var c;
    for (i = 0; i < spaceSize; i++){
        for (j = 0; j < spaceSize; j++){
            c = Math.random()
            if (c < 0.5){
                putCell(i, j, svg_width / spaceSize, 'white')
            }else{
                putCell(i, j, svg_width / spaceSize, 'black')
            }
        }
    }
}

function AddBackGround(){
    d3.select('#CA')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', svg_width)
        .attr('height', svg_height)
        .attr('fill', 'gray')
}


function putCell(t, index, cellSize, color){
    d3.select("#CA")
    /*
    // Add shadow
    .append('rect')
        .attr('x', index * cellSize + cellSize * 0.05)
        .attr('y', t * cellSize + cellSize * 0.05)
        .attr('rx', cellSize * 0.1)
        .attr('ry', cellSize * 0.1)
        .attr('width', cellSize * 0.9)
        .attr('height', cellSize * 0.9)
        .attr('fill', '#333333');
    */
    d3.select("#CA")
    .append('rect')
        .attr('x', index * cellSize)
        .attr('y', t * cellSize)
        .attr('rx', cellSize * 0.1)
        .attr('ry', cellSize * 0.1)
        .attr('width', cellSize * 0.9)
        .attr('height', cellSize * 0.9)
        .attr('fill', color)
        //.attr('stroke', 'gray')
        //.attr('stroke-width', 1);
    return 0;
}