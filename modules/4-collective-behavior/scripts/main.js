'use strict';

// TO DO:
// Disable Colony Size Slider?
// Array Pushback


// We need an object to represent ants
const Ants = function(num_ants) {

    // If the provided number of ants is not greater than 0, throw an
    // error because the code is invalid.
    if (num_ants < 0) {
        throw new Error(`invalid number of ants code: got ${num_ants}, expected greater than 0`);
    }

    // Update the `state` (arrays of x,y locations) according to rule
    const fire = function(x_positions, x_velocities, y_positions, y_velocities) {

        for (let i = 0; i < num_ants; ++i) {
            x_positions[i] = x_positions[i]+x_velocities[i];
            y_positions[i] = y_positions[i]-y_velocities[i];

        }

        console.log(x_positions);

    };


    // Create an Ants object with accessors for the number of ants, and the fire method as
    // defined above.
    return Object.create({
        get num_ants() {
            return num_ants;
        },

        set num_ants(c) {
            if (c < 0) {
                throw new Error(`invalid number of ants code: got ${num_ants}, expected greater than 0`);
            }
            num_ants = c;
        },
        fire
    });
};


// We need an object to represent an elementary cellular automaton.
const ECA = function(code) {
    // The ECAs are two-colored
    const k = 2;
    // They have 256 possible rules
    const volume = 256;

    // If the provided code is not between 0 and 255 (inclusive), throw an
    // error because the code is invalid.
    if (code < 0 || code >= volume) {
        throw new Error(`invalid ECA code: got ${code}, expected 0...${volume-1}`);
    }

    // Update the `state` (an array of cell states) according to the ECA rule.
    const fire = function(state, dest) {
        if (dest === undefined || dest === null) {
            // If no `dest` is provided (or its null) assign a copy of `state` to the `dest`.
            dest = state.slice();
        } else if (state.length !== dest.length) {
            // Throw and error if the `state` and `dest` arrays have different lengths
            throw new Error('state and destination have different lengths');
        }

        // If the state is not empty, we will update the state
        if (state.length !== 0) {
            // Get the index of the last element of the state
            const end = state.length - 1;

            // Get the value of the cell "to the left of" the first element
            const left = state[end];
            // Get the value of the cell "to the right of" the last element
            const right = state[0];

            // Create a variable to store the running shift for the 0-th cell
            let shift = 2 * left + state[0];

            // For all but the last cell in the array
            for (let i = 0; i < end; ++i) {
                // Update the running shift with the state to the right of the current cell
                shift = 7 & (2 * shift + state[i + 1]);
                // Set the i-th cell's state according to the rule
                dest[i] = 1 & (code >> shift);
            }
            // Update the shift using the last cell's right-side neighbor
            shift = 7 & (2 * shift + right);
            // Set the last cell's state according to the rule
            dest[end] = 1 & (code >> shift);
        }

        // console.log(dest);
        return dest;
    };

    // Create an ECA object with accessors for the code, and the fire method as
    // defined above.
    return Object.create({
        get code() {
            return code;
        },

        set code(c) {
            if (c < 0 || c >= volume) {
                throw new Error(`invalid ECA code: got ${c}, expected 0...${volume-1}`);
            }
            code = c;
        },

        fire
    });
};

/**
 * The `App` factory function creates an object to encapsulate the core logic
 * for the application.  The object is created given an initial number of cells
 * (`cell_count`), an ECA `code`, and the time to wait between subsequent
 * simulation cycles (`step_time`) in milliseconds.
 */
const App = function({ radius, aperture, code, num_ants, disc_rate, step_time}) {
    // Create a color scheme with two colors `[white, grey]`
    const color_scheme = d3.scaleOrdinal(['#ffffff', '#666666']);

    // Get the SVG element with id 'trajectory'
    let svg = d3.select('#trajectory');
    let width = svg.attr('width');
    let height = svg.attr('height');

    // Get the center coords
    let cx = width/2;
    let cy = height/2;

    // Create an initial rule
    let rule = ECA(code);
    let nest = Ants(num_ants);

    // Initialize zero-filled array of cell states
    let state = new Array(radius).fill(0);
    let x_positions = new Array(nest.num_ants).fill(cx); // initialize array and fill with zeros
    let x_velocities = new Array(nest.num_ants).fill(0); // initialize array and fill with zeros
    let y_positions = new Array(nest.num_ants).fill(cy-radius); // initialize array and fill with zeros
    let y_velocities = new Array(nest.num_ants).fill(-1); // initialize array and fill with zeros

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
        .attr("transform","translate(" + [cx, cy] + ")") // center arc
        .attr("d", arc({
            innerRadius: radius, 
            outerRadius: radius+1, // 1 pixel thick
            startAngle: aperture*Math.PI/360,
            endAngle: 2*Math.PI-aperture*Math.PI/360,
        }));

        svg.selectAll("circle").remove();
        for (let i = 0; i < num_ants; ++i) {
            svg.append("circle")
            .attr("cx",x_positions[i])
            .attr("cy",y_positions[i])
            .attr("r",5);
        }

        // svg.append("circle")
        // .attr("cx", x_positions[0])
        // .attr("cy", y_positions[0])
        // .attr("r", 5);


        // If the simulation has run for more timesteps than can fit
        // into the SVG
        // if (timestep >= nrows) {
        //     row = nrows - 1;

        //     // Remove the top-most rendered row
        //     svg.select('g').remove();

        //     // Shift all of the other rows up one
        //     svg.selectAll('g').selectAll('rect').each(function() {
        //         const cell = d3.select(this);
        //         cell.attr('y', cell.attr('y') - cell_size);
        //     });
        // }

        // // Remove the click handler from all of the rendered cells
        // d3.selectAll('g').selectAll('rect').on('click', null);

        // // Create the newest row of the simulation
        // svg.append('g').selectAll('rect')           // add a `g` tag
        //     .data(state)                            // set the data to `state`
        //     .enter().append('rect')                 // for each element of `state` create a `rect`
        //     .attr('x', (_, j) => j * cell_size)     // set the x-position of the rectangle
        //     .attr('y', row * cell_size)             // set the y-position of the rectangle
        //     .attr('width', cell_size)               // set the width of the cell
        //     .attr('height', cell_size)              // set the height of the cell
        //     .style('fill', color_scheme)            // set the fill color based on the cell's state
        //     .style('stroke', 'black')               // draw a black border around the cell
        //     .on('click', function(_, i) {           // add click handler to toggle the cell's state
        //         state[i] = 1 & (state[i] + 1);
        //         d3.select(this).datum(state[i]).style('fill', color_scheme);
        //     });
    };

    // Simulate exactly one timestep
    const step = function() {
        // Update the state given the rule
        rule.fire(state, state);
        nest.fire(x_positions, x_velocities,y_positions, y_velocities);
        // Increment the timestep counter
        timestep += 1;
        // Render the new state
        render();
    };

    // Start the simulation
    const start = function() {
        // Disable the step and start buttons
        d3.select('#step').attr('disabled', true);
        d3.select('#start').attr('disabled', true);
        //d3.select('#number').attr('disabled',true);


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
            //d3.select('#number').attr('disabled',null);

            // Disable the stop button
            d3.select('#stop').attr('disabled', true);
        }
    };

    // Restart the simulation
    const restart = function() {
        // Stop the simulation (if it is running)
        stop();

        // Reinitialize the state to all zeros
        state = new Array(radius).fill(0);
        x_positions = new Array(nest.num_ants).fill(cx); // initialize array and fill with zeros
        x_velocities = new Array(nest.num_ants).fill(0.); // initialize array and fill with zeros
        y_positions = new Array(nest.num_ants).fill(cy-radius); // initialize array and fill with zeros
        y_velocities = new Array(nest.num_ants).fill(-1); // initialize array and fill with zeros

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

        get code() {
            return rule.code;
        },

        set code(c) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the ECA code
            rule.code = c;   // sets the code of the rule object
        },

        get num_ants() {
            return nest.num_ants;
        },

        set num_ants(c) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the ECA code
            nest.num_ants = c; // sets the number of ants for our nest object
            x_positions = new Array(nest.num_ants).fill(0); // initialize array and fill with zeros

            d3.select('#number').html(`${nest.num_ants} ants`);

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
        code: 30,
        num_ants: 100,
        disc_rate: 50,
        step_time: 550
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
    d3.select('#number-slider').on('input', function() {
        app.num_ants = parseInt(this.value);
    }).attr('value', `${app.num_ants}`);
    // Set the slider's initial label
    d3.select('#number').html(`${app.num_ants} ants`);


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

    // Register an onchange handler to the rule dropdown menu, and add an option for each of
    // the 256 rules
    d3.select('#rule').on('change', function() {
        // Simply set the ECA code
        app.rule = parseInt(this.value);
    }).selectAll('option')          // Select all of the option tags
        .data(d3.range(256))        // Set an array [0,...,255] as the data, on for each rule
        .enter().append('option')   // Add an option tag for each rule
        .attr('value', (d) => d)    // Set the value of the option to the rule
        .attr('selected', (d) => (d === app.rule) ? true : null) // Select the default rule code
        .html((d) => d);            // Set the text of the dropdown option
}());