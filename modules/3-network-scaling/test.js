var jsnx = require('jsnetworkx');

var G= new jsnx.Graph();


//input nodes and edges from front end

G.addNode();
G.addEdge();




var cluster=jsnx.averageClustering(G);
console.log(cluster);
var degrees=G.degree();
degreesum=0;
for(var i = 0; i < degrees.length; i++) {
	degreesum += degrees[i];
}
var meandegree=degreesum/degrees.length;
console.log(meandegree);

var lengths=jsnx.all_pairs_average_shortest_path_length(G);
var lengthsum=0;
for(var i = 0; i < lengths.length; i++) {
	lengthsum += lengths[i];
}
var averagelength= lengthsum/lengths.length;
console.log(averagelength);
