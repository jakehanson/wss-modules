'use strict';

// TO DO:
// Disable Colony Size Slider?
// Why no build gitpages?
// Array Pushback


const fire = function(ant_array) {

    const num_ants = ant_array.length;
    // console.log(num_ants);

    for (let i = 0; i < num_ants; ++i) {
        console.log("Ant Name ="+String(i));
        ant_array[i].cx += 1;
        ant_array[i].cy += 1;
        console.log("  cx="+String(ant_array[i].cx));
        console.log("  cy="+String(ant_array[i].cy));

    }
    
    console.log(ant_array);


};

/**
 * The `App` factory function creates an object to encapsulate the core logic
 * for the application.  The object is created given an initial number of cells
 * (`cell_count`), an ECA `code`, and the time to wait between subsequent
 * simulation cycles (`step_time`) in milliseconds.
 */
const App = function({ radius, aperture, colony_size, disc_rate, step_time}) {
    // Create a color scheme with two colors `[white, grey]`
    // const color_scheme = d3.scaleOrdinal(['#ffffff', '#666666']);

    // Get the SVG element with id 'trajectory'
    let svg = d3.select('#trajectory');
    let width = svg.attr('width');
    let height = svg.attr('height');

    // Get the center coords
    let center_x = width/2;
    let center_y = height/2;


    var ant_array = []; // initialize an empty array for our ants

    ant_array.push({
    "cx": center_x,
    "cy": center_y-radius
    });

    // Create a counter to keep track of the number of timesteps thus far
    // simulated
    let timestep = 0;

    // Create a variable to store the simulation timer
    let timer = null;

    // The render method take care of rendering a single timestep of the
    // simulation
    const render = function() {
        // let row = timestep;

        let arc = d3.arc();

        //console.log(radius);

        svg.selectAll("path").remove(); // Remove old nest
        svg.append("path")
        .attr("transform","translate(" + [center_x, center_y] + ")") // center arc
        .attr("d", arc({
            innerRadius: radius, 
            outerRadius: radius+1, // 1 pixel thick
            startAngle: aperture*Math.PI/360,
            endAngle: 2*Math.PI-aperture*Math.PI/360,
        }));


        const ant_plot = svg.selectAll("circle").data(ant_array);

        ant_plot.enter() 
        .append("circle")
        .merge(ant_plot)
        .attr("cx", (d) => d.cx)
        .attr("cy", (d) => d.cy)
        .attr("r", 5);

        ant_plot.exit().remove();


    };

    // Simulate exactly one timestep
    const step = function() {

        timestep += 1;
        // Update the state given the rule
        if (timestep%disc_rate == 0) {
            ant_array.push({
                "cx": center_x,
                "cy": center_y-radius
            });
        }
        fire(ant_array); // update ants
        render(); // render the initial state

    };

    // Start the simulation
    const start = function() {
        // Disable the step and start buttons
        d3.select('#step').attr('disabled', true);
        d3.select('#start').attr('disabled', true);
        d3.select('#colony-slider').attr('disabled',true);


        // Enable the stop button
        d3.select('#stop').attr('disabled', null);

        // Start a timer that will call the `step` function every `step_time`
        // milliseconds
        timer = d3.interval(step, step_time);
    };

    // Stop the simulation
    const stop = function() {
        // If the simulation is running (i.e. that the timer is not null)
        if (timer !== null) {
            // Stop the timers
            timer.stop();
            // Set the timer to null
            timer = null;

            // Enable the step and start buttons
            d3.select('#step').attr('disabled', null);
            d3.select('#start').attr('disabled', null);
            d3.select('#colony-slider').attr('disabled',null);

            //d3.select('#number').attr('disabled',null);

            // Disable the stop button
            d3.select('#stop').attr('disabled', true);
        }
    };

    // Restart the simulation
    const restart = function() {
        // Stop the simulation (if it is running)
        stop();

        // Reset the timestep counter
        timestep = 0;

        // Render the all-zero state
        render();
    };


    // With all of the methods defined, go ahead and render the initial state
    render();

    // We now create the object to be returned.
    return Object.create({
        get radius() {
            return radius;
        },

        set radius(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the cell_count
            radius = n;

            // Update the cell-count slider's label
            d3.select('#radius').html(`${radius} pixels`);

            this.restart();

        },

        get aperture() {
            return aperture;
        },

        set aperture(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the aperture
            aperture = n;

            // Update the cell-count slider's label
            d3.select('#aperture').html(`${aperture} degrees`);
            this.restart();
        },        

        get step_time() {
            return step_time;
        },

        set step_time(t) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the step_time
            step_time = t;

            // Update the speed slider's label
            d3.select('#speed').html(`${Math.round(100000 / step_time) / 100} steps/sec`);
        },

        get colony_size() {
            return colony_size;
        },

        set colony_size(c) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the ECA code
            colony_size = c; // sets the number of ants for our nest object
            // x_positions = new Array(nest.num_ants).fill(0); // initialize array and fill with zeros

            d3.select('#colony').html(`${colony_size} ants`);
            this.restart();


        },


        get disc_rate() {
            return disc_rate;
        },

        set disc_rate(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the discovery rate
            disc_rate = n;

            // Update the cell-count slider's label
            d3.select('#discovery').html(`${disc_rate} steps/ant`);
            this.restart();
        },

        // Include the step, start, stop and restart methods in the object
        step, start, stop, restart
    });
};


// Now we can run our simulator once the HTML page has loaded
(function() {
    // Create the initial application state
    const app = App({
        radius: 100,
        aperture: 25,
        colony_size: 100,
        disc_rate: 10,
        step_time: 100
    });

    // Register onclick handlers to the step, start, stop and restart buttons
    d3.select('#step').on('click', app.step);
    d3.select('#start').on('click', app.start);
    d3.select('#stop').on('click', app.stop);
    d3.select('#restart').on('click', app.restart);

    // Register an aninput handler to the radius slider, and set the slider's
    // initial value
    d3.select('#radius-slider').on('input', function() {
        app.radius = parseInt(this.value);
    }).attr('value', `${app.radius}`);
    // Set the slider's initial label
    d3.select('#radius').html(`${app.radius} pixels`);

    // Register an aninput handler to the aperture slider, and set the slider's
    // initial value
    d3.select('#aperture-slider')
    // .attr("min",0)
    // .attr("max",2*Math.PI-Math.PI/6.)
    // .attr("step",Math.PI/25.)
    .attr("value",app.aperture)
    .on('input', function() {
        app.aperture = parseInt(this.value);
    }).attr('value', `${app.aperture}`);
    // Set the slider's initial label
    d3.select('#aperture').html(`${app.aperture} degrees`);

    // Register an aninput handler to the colony size slider, and set the slider's
    // initial value
    d3.select('#colony-slider').on('input', function() {
        app.colony_size = parseInt(this.value);
    }).attr('value', `${app.colony_size} ants`);
    // Set the slider's initial label
    d3.select('#colony').html(`${app.colony_size} ants`);


    // Register an aninput handler to the discovery rate slider, and set the slider's
    // initial value
    d3.select('#discovery-slider').on('input', function() {
        app.disc_rate = parseInt(this.value);
    }).attr('value', `${app.disc_rate}`);
    // Set the slider's initial label
    d3.select('#discovery').html(`${app.disc_rate} steps/ant`);

    // Register an oninput handler to the speed slider, and set the slider's
    // initial value
    d3.select('#speed-slider').on('input', function() {
        app.step_time = parseInt(this.value);
    }).attr('value', `${Math.round(100000 / app.step_time) / 100} steps/sec`);
    // Set the slider's initial label
    d3.select('#speed').html(`${Math.round(100000 / app.step_time) / 100} steps/sec`);

}());