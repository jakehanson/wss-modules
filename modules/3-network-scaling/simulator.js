Array.prototype.iota = function() {
    for (let i = 0, len = this.length; i < len; ++i) {
        this[i] = i;
    }
    return this;
};

Array.prototype.zip = function(other) {
    if (other.length < this.length) {
        return other.map((e, i) => [this[i], e]);
    } else {
        return this.map((e, i) => [e, other[i]]);
    }
};

jsnx.Graph.prototype.components = function() {
    const V = this.order();
    let visited = new Array(V).fill(false);
    let components = [];
    for (let v = 0; v < V; ++v) {
        if (!visited[v]) {
            components.push(this.dfs(v, visited));
        }
    }
    return components;
};

jsnx.Graph.prototype.dfs = function(v, visited, component = []) {
    visited[v] = true;
    component.push(v);
    for (let w of this.neighbors(v)) {
        if (!visited[w]) {
            this.dfs(w, visited, component);
        }
    }
    return component;
};

jsnx.Graph.prototype.meanDegree = function() {
    return Array.from(this.degree().values()).reduce((a,x) => a + x) / this.order();
};

jsnx.Graph.prototype.averageShortestPath = function() {
    try {
        const nodes = this.nodes();
        let sum = 0, num_path = 0;
        for (let source of nodes.values()) {
            for (let target of nodes.values()) {
                sum += jsnx.shortestPathLength(this, { source, target });
                num_path += 1;
            }
        }
        return sum / num_path;
    } catch (e) {
        return Infinity;
    }
};

const random_subset = function(seq, m) {
    let targets = new Set();
    while (targets.size < m) {
        const x = seq[Math.floor(Math.random() * seq.length)];
        targets.add(x);
    }
    return Array.from(targets);
};

const Mechanism = {
    ER: 'erdos-renyi',
    BA: 'barabasi-albert'
};

const Simulator = function(graphid, plotid, propsid, nodes, er, ba, mechanism) {
    let MechanismName = {};
    MechanismName[`${Mechanism.ER}`] = 'Erdös-Rényi';
    MechanismName[`${Mechanism.BA}`] = 'Barabási-Albert';

    const div = d3.select(graphid);

    let G = new jsnx.Graph();

    const erdosRenyiGraph = () => jsnx.erdosRenyiGraph(nodes.value, er.value);

    const barabasiAlbertGraph = function() {
        const n = nodes.value;
        const m = ba.value;

        if (m < 1 || m >= n) {
            const msg = `Barabási-Albert network must have m ≥ 1 and m < n, m = ${m}, n = ${n}`;
            throw new Error(msg);
        }

        let g = jsnx.emptyGraph(m);
        let targets = new Array(m).iota();
        let repeated_nodes = new Array();
        source = m;
        while (source < n) {
            const sources = new Array(m).fill(source);
            g.addEdgesFrom(sources.zip(targets));
            Array.prototype.push.apply(repeated_nodes, targets);
            Array.prototype.push.apply(repeated_nodes, sources);
            targets = random_subset(repeated_nodes, m);
            source += 1;
        }
        return g;
    };

    const generate = function() {
        switch(mechanism) {
            case Mechanism.ER:
                G = erdosRenyiGraph();
                break;
            case Mechanism.BA:
                G = barabasiAlbertGraph();
                break;
            default:
                throw new Error(`unimplemented mechanism "${mechanism}"`);
        }
    };

    const draw = function() {
        const width = +div.attr('width');
        const height = +div.attr('height');

        jsnx.draw(G, {
            element: graphid,
            width: width,
            height: height,
            weighted: false,
            nodeStyle: {
                'r': 3
            },
            edgeStyle: {
                'stroke-width': 2
            }
        });

        const trace = {
            y: jsnx.degreeHistogram(G),
            xbins: {
                size: 1
            },
            opacity: 0.5,
            type: 'bar',
        };

        console.log(trace.x);

        const layout = {
            title: 'Degree Distribution',
            xaxis: { title: 'Degree', dtick: 1 },
            yaxis: { title: 'Frequency' },
            font: { size: 8 },
            margin: {
                l: 50,
                r: 20,
                t: 50,
                b: 50,
            },
            bargap: 0.1,
            showLegend: false,
        }

        Plotly.newPlot(plotid, [trace], layout, {
            displayLogo: false,
            responsive: true,
            displayModeBar: false
        });
    };

    const parameters = function() {
        switch(mechanism) {
            case Mechanism.ER:
                return `{ p: ${er.value} }`;
            case Mechanism.BA:
                return `{ m: ${ba.value} }`;
            default:
                throw new Error(`unimplemented mechanism "${mechanism}"`);
        }
    };

    const properties = function() {
        const props = [
            { 'label': 'Generative Mechanism', 'value': MechanismName[mechanism] },
            { 'label': 'Number of Nodes', 'value': nodes.value },
            { 'label': 'Parameters', 'value': parameters() },
            { 'label': 'Number of Components', 'value': G.components().length },
            { 'label': 'Density', 'value': jsnx.density(G).toFixed(3) },
            { 'label': 'Mean Degree', 'value': G.meanDegree().toFixed(3) },
            { 'label': 'Average Shortest Path Length', value: G.averageShortestPath().toFixed(3) }
        ];

        d3.select(propsid).selectAll('table').remove();

        const table = d3.select(propsid)
            .append('table')
            .classed('properties', true);

        const tbody = table
            .append('tbody')
            .classed('properties__body', true);

        const rows = tbody.selectAll('tr').data(props);
        rows.enter().append('tr').classed('properties__property', true);
        rows.exit().remove();

        const cells = rows.selectAll('td')
            .data(function(row) {
                return Object.keys(row).map(function (column) {
                    return { column: column, value: row[column] };
                });
            });
        cells.enter()
            .append('td')
            .classed('properties__label', (d) => d.column === 'label')
            .classed('properties__value', (d) => d.column === 'value')
            .text(function(d) {
                return (d.column === 'label') ? d.value + ':' : d.value;
            });
        cells.exit().remove();
    };

    const run = function() {
        generate();
        draw();
        properties();
    };

    const setup_slider = function(id, parser, obj, fmt = (x) => x, callback) {
        d3.select(`${id} input`)
            .property('min', obj.min)
            .property('max', obj.max)
            .property('step', obj.step)
            .property('value', obj.value)
            .on('input', function() {
                obj.value = parser(this.value);
                d3.select(`${id} output`).html(fmt(obj.value));
                if (callback) {
                    callback(obj.value);
                }
            });
        d3.select(`${id} output`).html(fmt(obj.value));
    };

    const adjust_max = function(id, max, parser, obj) {
        obj.max = max;
        obj.value = obj.min;

        d3.select(`${id} input`)
            .property('max', obj.max)
            .property('value', obj.value);

        d3.select(`${id} output`).html(obj.value);
    };

    const disable_all_mechanisms = function() {
        d3.selectAll('.mechanism input').each(function() { disable_mechanism(this.value); })
    };

    const disable_mechanism = function(id) {
        d3.select(`#${id}-mech label`).style('color', '#888888');
        d3.select(`#${id}-param label`).style('color', '#888888');
        d3.select(`#${id}-param input`).property('disabled', true);
        d3.select(`#${id}-param output`).style('color', '#888888');
    };

    const enable_mechanism = function(id) {
        mechanism = id;
        d3.select(`#${id}-mech label`).style('color', '#000000');
        d3.select(`#${id}-param label`).style('color', '#000000');
        d3.select(`#${id}-param input`).property('disabled', false);
        d3.select(`#${id}-param output`).style('color', '#000000');
    };

    const setup_mechanism = function(id, checked) {
        d3.select(`${id} input`)
            .property('checked', checked)
            .on('change', function() {
                disable_all_mechanisms();
                enable_mechanism(this.value);
            });
    };

    const init = function() {
        setup_slider('#nodes', parseInt, nodes, (x) => x, function(max) {
            adjust_max('#barabasi-albert-param', max - 1, parseInt, ba);
        });
        setup_slider('#erdos-renyi-param', parseFloat, er, (x) => x.toFixed(2));
        setup_slider('#barabasi-albert-param', parseInt, ba);

        disable_all_mechanisms();

        setup_mechanism('#erdos-renyi-mech', mechanism === Mechanism.ER);
        setup_mechanism('#barabasi-albert-mech', mechanism === Mechanism.BA);

        enable_mechanism(d3.select('input[name="gen-mech"]:checked').node().value);

        d3.select('#run').on('click', run);
        run();
    };

    return {
        init
    };
};

(function() {
    let nodes = { min: 10, max: 50, step: 1, value: 10 };
    let erdos_renyi = { min: 0.0, max: 1.0, step: 0.01, value: 0.5 };
    let barabasi_albert = { min: 1, max: nodes.value - 1, step: 1, value: 1 };

    Simulator('#simulator', 'histogram', '#properties',
        nodes, erdos_renyi, barabasi_albert, Mechanism.ER).init();
}())
