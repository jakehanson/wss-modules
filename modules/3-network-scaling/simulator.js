const Simulator = function(G, id = '#simulator') {
    const simId = id;
    const div = d3.select(simId);

    const draw_graph = function() {
        const width = +div.attr('width');
        const height = +div.attr('height');

        jsnx.draw(G, {
            element: simId,

            width: width,
            height: height,

            weighted: false,
            edgeStyle: {
                'stroke-width': 10
            }
        });
    };

    return { draw_graph };
};

(function() {
    var G = jsnx.binomialGraph(6, 0.3);

    let app = Simulator(G);

    app.draw_graph();

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
}());
