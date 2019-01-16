// constants
const svg_width = 500.;
const svg_height = 500.;

// variables
var spaceSize = 20;
var line0 = [];
var current_line = [];
var pointer = 0;
var can_run = false;
var theRule = 110;
var RuleCode = new Int8Array(8).fill(0);

////////////////////
// Initialize

// Set head color
d3.selectAll("h1").style("color", "cc3311")

d3.select("#CA")
    .attr('height', svg_height)
    .attr('width', svg_width);

// Set SVG

AddBackGround();
makeRulePlot();
Rule2Code();

//setRandomCells();
setRandomInitCells();

update_run();

////////////////////
// Functions

function Rule2Code(){
    RuleCode = binCode(theRule, 8);
    UpdateRulePlot();
}

function UpdateRulePlot(){
    var i = 0;

    for (i = 0; i < 8; i++){
        var _cell = d3.select('#ECARule_'+i);
        if (RuleCode[i] == 0){
            _cell.attr('fill', 'white');
        } else {
            _cell.attr('fill', 'black');
        }
    }
    
}

function UpdateRule(){
    theRule = FromDigits(RuleCode);
    document.getElementById("CARule").value = theRule;
    return 0;
}

function makeRulePlot(){
    var obj = d3.selectAll('#ECARule');
    var i, j;
    var code = [0, 0, 0];
    var _cellSize = 15;
    var _pendx = 10;
    var _pendy = 10;

    for (i = 0; i < 8; i++){
        code = binCode(7 - i);
        console.log(code);
        _RulePlotCode(code, _pendx + i * (500 - 2 * _pendx) / 8., _pendy, _cellSize);
        _putControlCell(7 - i, _pendx + i * (500 - 2 * _pendx) / 8. + _cellSize, _pendy + _cellSize, _cellSize);
    }
}

function _putControlCell(stateID, x, y, size){
    d3.selectAll('#ECARule')
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', size)
        .attr('height', size)
        .attr('stroke', 'gray')
        .attr('fill', 'white')
        .attr('id', 'ECARule_'+stateID)
        .on('click', flipRule)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);
}

function handleMouseOver(){
    d3.select(this).attr('stroke', '#31a8f0');
    console.log(this['id']);
}

function handleMouseOut(){
    d3.select(this).attr('stroke', 'gray');
}

function flipRule(){
    var _p = parseInt(this['id'][8]);
    RuleCode[_p] = 1 - RuleCode[_p];
    UpdateRulePlot();
    UpdateRule();
    return 0;
}

function _RulePlotCode(code, x, y, size){
    var j = 0;
    var obj = d3.selectAll('#ECARule');

    for (j = 0; j < 3; j++){
        if (code[j] == 0){
            obj.append('rect')
                .attr('x', x + size * j)
                .attr('y', y)
                .attr('width', size)
                .attr('height', size)
                .attr('stroke', 'gray')
                .attr('fill', 'white');
        } else {
            obj.append('rect')
                .attr('x', x + size * j)
                .attr('y', y)
                .attr('width', size)
                .attr('height', size)
                .attr('stroke', 'gray')
                .attr('fill', 'black');
        }
    }
}

function binCode(x, _n = 3){
    var code = new Int8Array(_n).fill(0);
    var _x = x;
    var i = 0;

    while (_x > 0){
        if (i < _n) code[i] = _x % 2;
        i++;
        _x = Math.floor(_x / 2);
    }
    
    return code;
}

function FromDigits(list, base = 2){
    var i;
    var num = 0;
    var _base = 1;
    for (i = 0; i < list.length; i++){
        num += list[i] * _base;
        _base = _base * base;
    }
    return num;
}

function update_run(){
    // Update button "run", "step", and "run to end"
    if (can_run){
        document.getElementById('run').disabled = false;
        document.getElementById('step').disabled = false;
        document.getElementById('run_end').disabled = false;
        document.getElementById('clear').disabled = false;
    }else{
        document.getElementById('run').disabled = true;
        document.getElementById('step').disabled = true;
        document.getElementById('run_end').disabled = true;
        document.getElementById('clear').disabled = true;
    }
    return 0;
}

function clearCells(){
    // Delete all cells
    d3.select("#CA").selectAll("rect[id='Cell']")
        .remove();
    
    can_run = false;
    update_run();
}

function setRandomCells(){
    // Test
    // Set random 0/1 cells
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
    // Put a cell at (t, index)
    d3.select("#CA")
    .append('rect')
        .attr('x', index * cellSize)
        .attr('y', t * cellSize)
        .attr('rx', cellSize * 0.1)
        .attr('ry', cellSize * 0.1)
        .attr('width', cellSize * 0.9)
        .attr('height', cellSize * 0.9)
        .attr('fill', color)
        .attr('id', 'Cell');
        //.on('click', clearCells);
        //.attr('stroke', 'gray')
        //.attr('stroke-width', 1);
    return 0;
}

function putCells(line){
    // put a line of cells
    var i;
    var p = pointer;
    for (i = 0; i < line.length; i++){
        if (line[i] == 0) {
            putCell(p, i, svg_width / line.length, 'white');
        } else{
            putCell(p, i, svg_width / line.length, 'black');
        }
    }
    pointer = pointer + 1;
    return 0;
}

function setSingleInitCells(){
    line0 = new Int8Array(spaceSize).fill(0);
    var theCenter = Math.round(spaceSize / 2.0);

    line0[theCenter] = 1;
    pointer = 0;
    current_line = line0;
    //console.log(line0);

    clearCells();

    putCells(line0);

    can_run = true;
    update_run();

    return 0;
}

function setRandomInitCells(){
    line0 = new Int8Array(spaceSize).fill(0);
    var i;

    for (i = 0; i < line0.length; i++){
        if (Math.random() < 0.5) {
            line0[i] = 0;
        } else {
            line0[i] = 1;
        }
    }

    current_line = line0;
    pointer = 0;
    //console.log(line0);

    clearCells();

    putCells(line0);

    can_run = true;
    update_run();

    return 0;
}

function OneStep(){
    // Go one step and update interface
    current_line = cellularAutomata(theRule, current_line);
    putCells(current_line);
    return 0;
}

function sign(x){
    if (x > 0){
        return 1;
    } else {
        return 0;
    }
}

function CARule(rule, l, c, r){
    var code = l * 4 + c * 2 + r;

    return sign(rule & (1 << code));
}

function cellularAutomata(rule, states){
    // Given CA rule and current states, return next states
    var next = new Int8Array(states.length).fill(0);

    for (i = 1; i < states.length; i++){
        next[i] = CARule(rule, states[i-1], states[i], states[i+1]);
    }
    next[0] = CARule(rule, states[states.length - 1], states[0], states[1]);
    next[states.length - 1] = CARule(rule, states[states.length - 2], states[states.length - 1], states[0]);

    return next;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

async function RunToEnd(sleepTime = 0){
    var i = 0;
    for (i = 0; i < spaceSize - 1; i++){
        OneStep();
        await sleep(sleepTime)
    }
}

function setRule(){
    theRule = parseInt(document.getElementById("CARule").value);
    Rule2Code();
    return 0;
}

function setSize(){
    spaceSize = parseInt(document.getElementById("CASize").value);
    return 0;
}