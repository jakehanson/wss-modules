'use strict';

/**
 * We need an object to represent an elementary cellular automaton.
 */
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
const App = function({ cell_count, code, step_time }) {
    // Create a color scheme with two colors `[white, grey]`
    const color_scheme = d3.scaleOrdinal(['#ffffff', '#666666']);

    // Get the SVG element with id 'trajectory'
    let svg = d3.select('#trajectory');

    // Create an initial rule
    let rule = ECA(code);

    // Initialize zero-filled array of cell states
    let state = new Array(cell_count).fill(0);

    // Get the width and height of the SVG element
    let width = svg.attr('width');
    let height = svg.attr('height');

    // Determine the cell size (height and width) of each cell
    let cell_size = width / cell_count;

    // Determine the number of rows that will fit in the SVG
    let nrows = Math.ceil(height / cell_size);

    // Reset the hight of the SVG to fix exactly `nrows`
    svg.attr('height', nrows * cell_size);

    // Create a counter to keep track of the number of timesteps thus far
    // simulated
    let timestep = 0;

    // Create a variable to store the simulation timer
    let timer = null;

    // The render method take care of rendering a single timestep of the
    // simulation
    const render = function() {
        let row = timestep;

        // If the simulation has run for more timesteps than can fit
        // into the SVG
        if (timestep >= nrows) {
            row = nrows - 1;

            // Remove the top-most rendered row
            svg.select('g').remove();

            // Shift all of the other rows up one
            svg.selectAll('g').selectAll('rect').each(function() {
                const cell = d3.select(this);
                cell.attr('y', cell.attr('y') - cell_size);
            });
        }

        // Remove the click handler from all of the rendered cells
        d3.selectAll('g').selectAll('rect').on('click', null);

        // Create the newest row of the simulation
        svg.append('g').selectAll('rect')           // add a `g` tag
            .data(state)                            // set the data to `state`
            .enter().append('rect')                 // for each element of `state` create a `rect`
            .attr('x', (_, j) => j * cell_size)     // set the x-position of the rectangle
            .attr('y', row * cell_size)             // set the y-position of the rectangle
            .attr('width', cell_size)               // set the width of the cell
            .attr('height', cell_size)              // set the height of the cell
            .style('fill', color_scheme)            // set the fill color based on the cell's state
            .style('stroke', 'black')               // draw a black border around the cell
            .on('click', function(_, i) {           // add click handler to toggle the cell's state
                state[i] = 1 & (state[i] + 1);
                d3.select(this).datum(state[i]).style('fill', color_scheme);
            });
    };

    // Simulate exactly one timestep
    const step = function() {
        // Update the state given the rule
        rule.fire(state, state);
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

            // Disable the stop button
            d3.select('#stop').attr('disabled', true);
        }
    };

    // Restart the simulation
    const restart = function() {
        // Stop the simulation (if it is running)
        stop();

        // Reinitialize the state to all zeros
        state = new Array(cell_count).fill(0);

        // Reset the timestep counter
        timestep = 0;

        // Remove all of the simulated rows
        svg.selectAll('g').remove();

        // Render the all-zero state
        render();
    };


    // With all of the methods defined, go ahead an render the initial state
    render();

    // We now create the object to be returned.
    return Object.create({
        get cell_count() {
            return cell_count;
        },

        set cell_count(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the cell_count
            cell_count = n;

            // Update the cell-count slider's label
            d3.select('#cell-count').html(`${cell_count} cells`);

            // Compute cell_size, nrows and set the height of the SVG according
            // to the new cell_count
            cell_size = width / cell_count;
            nrows = Math.ceil(height / cell_size);
            svg.attr('height', nrows * cell_size);

            // Restart the simulator
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
            rule.code = c;
        },

        // Include the step, start, stop and restart methods in the object
        step, start, stop, restart
    });
};


// Now we can run our simulator once the HTML page has loaded
(function() {
    // Create the initial application state
    const app = App({
        cell_count: 6,
        code: 30,
        step_time: 500
    });

    // Register onclick handlers to the step, start, stop and restart buttons
    d3.select('#step').on('click', app.step);
    d3.select('#start').on('click', app.start);
    d3.select('#stop').on('click', app.stop);
    d3.select('#restart').on('click', app.restart);

    // Register an aninput handler to the cell count slider, and set the slider's
    // initial value
    d3.select('#cell-count-slider').on('input', function() {
        // Simply set the cell_count
        app.cell_count = parseInt(this.value);
    }).attr('value', `${app.cell_count} cells`);
    // Set the slider's initial label
    d3.select('#cell-count').html(`${app.cell_count} cells`);

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
        app.code = parseInt(this.value);
    }).selectAll('option')          // Select all of the option tags
        .data(d3.range(256))        // Set an array [0,...,255] as the data, on for each rule
        .enter().append('option')   // Add an option tag for each rule
        .attr('value', (d) => d)    // Set the value of the option to the rule
        .attr('selected', (d) => (d === app.code) ? true : null) // Select the default rule code
        .html((d) => d);            // Set the text of the dropdown option
}());
