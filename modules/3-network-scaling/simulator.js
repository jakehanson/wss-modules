// This is called a factory function. The very last thing that it does
// is return an object. That object exposes functions that can can
// access variables that are defined locally inside of the factory
// function that would otherwise be unaccessible. As an example, the
// graph G is a variable that's only difined inside of this factory
// function, but the various methods, e.g. drawGraph, meanDegree, etc...
// can use them.
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
        for (let source of nodes.values()){
            for (let target of nodes.values()){
                // Javascript let's you create objects whose property names are inferred
                // from the name of the variables used to create them. So, for examples,
                // the following object:
                //     { source, target }
                // will be the same as
                //     { source: source, target: target }.
                // This makes the following line a little bit more concise.

                let shortest_path_length = jsnx.shortestPathLength(G, { source, target });

                shortest_path_sum += shortest_path_length;
                path_number += 1;
            }
        }

        return shortest_path_sum / path_number;
    };

    const degreeDistribution = () => jsnx.degreeHistogram(G);

    // This object is returned by this factory function and gives the call of Simulator
    // access to the functions (but not the variables) defined above. This encapsulation
    // makes it a bit easier to ensure that you don't make a mistake later and break
    // the variables defined above, e.g. the graph variable G.
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
    //Controls for simulator will go here
	//d3.select("addnode").attr("value","Add Node") 
	//d3.select("removenode").attr("value", "Remove Node")
	//d3.select("addedge").attr("value","Add Edge")
	//d3.select("removeedge").attr("value","Remove Edge")
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
