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

    const average_shortest_path = function() {
        let shortestpathsum = 0;
        let nodes = G.nodes();
        let pathnumber = 0;
        for (let node1 of nodes.values()){
            for (let node2 of nodes.values()){
                let shortestpath = jsnx.shortestPathLength(G,{source:node1,target:node2});
                shortestpathsum += shortestpath;
                pathnumber += 1;
            }
        }

        return shortestpathsum / pathnumber;
    };

    return {
        draw_graph,
        clustering_coefficient,
        mean_degree,
        average_shortest_path,
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

    // The jsnx.shortestPathLength method raises an error if you
    // ask for the path length between disconnected nodes. We catch the
    // error here and print it to the console so the script will keep
    // running. If you don't have this, the script will stop, and the
    // histogram will not be computed.
    try {
        const average_length = app.average_shortest_path();
        console.log(average_length);
    } catch(err) {
        console.error(err);
    }

    var distribution = jsnx.degreeHistogram(G);
    console.log(distribution);
}());
