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

    // This is called an "arrow function". It has slightly different
    // scoping semantics, but they're pretty easy to reason about as
    // long as you keep them simple.
    const clustering_coefficient = () => jsnx.averageClustering(G);

    const mean_degree = function() {
        let degrees = G.degree();
        let degreesum = 0;
        for (let degree of degrees.values()) {
            degreesum += degree;
        }
        return degreesum / degrees.size;
    };

    return {
        draw_graph,
        clustering_coefficient,
        mean_degree
    };
};

(function() {
    var G = jsnx.binomialGraph(6, 0.3);

    let app = Simulator(G);

    app.draw_graph();

    const cluster = app.clustering_coefficient();
    console.log(cluster);

    const mean_degree = app.mean_degree();
    console.log(mean_degree);

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
