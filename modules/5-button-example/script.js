const yo = function() {
    console.log("Hello");
    console.info("Hello");
    console.error("OH NO!!!");
    console.warn("Watch out!!!");
    alert("Sup?");
    d3.select("#button_1").attr("value", "Das Button");
};

const blue = () => alert("like the ocean.");

d3.select("#button_1").on("click", yo);

d3.select("#faux-button").on("click", blue);

const random_centers = function(n, width, height) {
    const center = new Array(n);
    for (let i = 0, len = center.length; i < len; ++i) {
        center[i] = {
            x: width * Math.random(),
            y: height * Math.random()
        };
    }
    return center;
};

let centers = null;
let count = 0;

const render = function() {
    const radius = 5;

    const svg = d3.select("#random-dots").select("svg");

    const circles = svg.selectAll("circle").data(centers);

    circles
        .enter().append("circle")
        .merge(circles)
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", radius)
            .attr("fill", "red")

    circles.exit().remove();
}

const move_right = function() {
    if (centers !== null) {
        centers.forEach((d) => d.x += 1);
        count += 1;
    }
    if ((count + 1) % 10 == 0) {
        centers = centers.slice(0, Math.ceil(centers.length / 2));
    }
    console.log("move right");
    render();
};

const init = function(n) {
    const svg = d3.select("#random-dots").append("svg").on("click", move_right);
    const width = svg.style("width").replace("px","");
    const height = svg.style("height").replace("px","");

    centers = random_centers(n, width, height);

    render();
};

init(100);
