const Simulator = function(id = '#simulator') {
    const simId = id;
    const div = d3.select(simId);

    let G = jsnx.binomialGraph(6, 0.3);

    const drawGraph = function() {
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
    const clusteringCoefficient = () => jsnx.averageClustering(G);

    const meanDegree = function() {
        let degrees = G.degree();
        let degree_sum = 0;
        for (let degree of degrees.values()) {
            degree_sum += degree;
        }
        return degree_sum / degrees.size;
    };

    const averageShortestPathLength = function() {
        const nodes = G.nodes();
        let shortest_path_sum = 0;
        let path_number = 0;
        for (let node1 of nodes.values()){
            for (let node2 of nodes.values()){
                let shortest_path_length = jsnx.shortestPathLength(G,{source:node1,target:node2});
                shortest_path_sum += shortest_path_length;
                path_number += 1;
            }
        }

        return shortest_path_sum / path_number;
    };

    const degreeDistribution = () => jsnx.degreeHistogram(G);

    return {
        drawGraph,
        clusteringCoefficient,
        meanDegree,
        averageShortestPathLength,
        degreeDistribution
    };
};

(function() {
    let app = Simulator();

    app.drawGraph();

    const cluster = app.clusteringCoefficient();
    console.log(cluster);

    const mean_degree = app.meanDegree();
    console.log(mean_degree);

    // The jsnx.shortestPathLength method raises an error if you
    // ask for the path length between disconnected nodes. We catch the
    // error here and print it to the console so the script will keep
    // running. If you don't have this, the script will stop, and the
    // histogram will not be computed.
    try {
        const average_length = app.averageShortestPathLength();
        console.log(average_length);
    } catch(err) {
        console.error(err);
    }

    const distribution = app.degreeDistribution();
    console.log(distribution);
}());
