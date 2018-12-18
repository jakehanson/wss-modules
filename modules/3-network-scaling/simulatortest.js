var G = jsnx.binomialGraph(6, 0.3);

jsnx.draw(G, {
    element: '#simulator',
    weighted: false,
    edgeStyle: {
        'stroke-width': 10
    }
});

var cluster = jsnx.averageClustering(G);
console.log(cluster);

var degrees = G.degree();
var degreesum = 0;
for (let degree of degrees.values()) {
    degreesum += degree;
}
var meandegree = degreesum / degrees.size;
console.log(meandegree);

var shortestpathsum = 0;
var nodes = G.nodes();
var pathnumber = 0;
for (let node1 of nodes.values()){
    for (let node2 of nodes.values()){
        var shortestpath = jsnx.shortestPathLength(G,{source:node1,target:node2});
        shortestpathsum += shortestpath;
        pathnumber += 1;
    }
}

var averagelength = shortestpathsum / pathnumber;
console.log(averagelength);

var distribution = jsnx.degreeHistogram(G);
console.log(distribution);
