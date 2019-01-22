'use strict';

// TO DO:
// Collisions between ants
// Exit rules
// Initialization Rules
// Styling
// 700 lines after update/discovery rules?
// 800 lines after adding bells and whistles to svg
// CSS styling

const init_ant = function(cx, cy, radius, r_enc, aperture, ant_array, velocity, timestep) {

	// First, calculate the x,y locations of nest edges so we can clear them
    let x_L = -(radius-r_enc)*Math.sin(aperture/2*Math.PI/180);
    let y_L = (radius-r_enc)*Math.cos(aperture/2*Math.PI/180);
    let x_R = -x_L;
    let y_R = y_L;

    let x = 0;
    let y = radius;

	// Start subsquent ants randomly in the aperture
    if (timestep != 0) {
    	let delta = Math.atan(r_enc/radius); // Ant must clear the edge
    	delta = delta*180/Math.PI; // convert to degrees
    	let rand_angle = (-aperture/2 + delta + Math.random()*(aperture-2*delta))*Math.PI/180; // puts us in [-a/2+delta, a/2-delta] rad
    	x = radius*Math.sin(rand_angle);
    	y = radius*Math.cos(rand_angle);
    }

    // Calculate Clearance angles
    let alpha = Math.atan((y-y_L)/Math.abs(x_L-x));
    let beta = Math.atan((y-y_R)/(x_R-x));

    let launch_angle = Math.PI/2+alpha+Math.random()*(Math.PI-(alpha+beta)); // randomly puts us in [pi/2+alpha,3pi/2-beta]
    let v_x = velocity*Math.sin(launch_angle);
    let v_y = -velocity*Math.cos(launch_angle);

    // Append x,y position and velocity
    ant_array.push({
        "x": cx-x,
        "y": cy-y,
        "vx": v_x,
        "vy": v_y,
        "color": "black"
    });

};


// Function to calculate time until ant hits nest wall
const get_t_wall = function(x, y, vx, vy, R, r_enc){
	return (-(x*vx+y*vy)+Math.sqrt(Math.pow(x*vx+y*vy,2)-(vx*vx+vy*vy)*(x*x+y*y-(R-r_enc)*(R-r_enc))))/(vx*vx+vy*vy);
};


// Function for moving the ants forward in time by dt
const simple_update = function(ant_array, delta_t){
	let num_ants = ant_array.length;

	for (let i = 0; i < num_ants; ++i) {
		ant_array[i].x += ant_array[i].vx*delta_t;
		ant_array[i].y += ant_array[i].vy*delta_t;
	}
};

// Define function for updating ant locations and correctly switching velocity
const wall_collision = function(cx, cy, ant_array, delta_t, i, velocity){

    let dt = 1/velocity; // this is the timestep in s (we only move 1 px max)

	// Next, we update the velocity of the ant colliding with the wall
	let x = ant_array[i].x-cx;
	let y = ant_array[i].y-cy;
	let vx = ant_array[i].vx;
	let vy = ant_array[i].vy;

	let x_0 = x-vx*delta_t; // old x location
	let y_0 = y-vy*delta_t; // old y location

	let v_0x = (x-x_0)/delta_t; // initial x_velocity
	let v_0y = (y-y_0)/delta_t; // initial y_velocity
	let v_mag = Math.sqrt(v_0x**2+v_0y**2); // initial velocity

	var angle_1; 
	var angle_2;
	var final_angle; 

	// Get angle to initial location
	if( (x_0 >= 0 && y_0 <= 0) || (x_0 >= 0 && y_0 > 0) ){
		angle_2 = Math.atan(y_0/x_0);
	} else {
		angle_2 = Math.PI + Math.atan(y_0/x_0);
	}

	// Get angle to current location
	if( (x >= 0 && y <= 0) || (x >= 0 && y > 0) ){
		angle_1 = Math.atan(y/x);
	} else {
		angle_1 = Math.PI + Math.atan(y/x);
	}

	// Get angle to final location
	final_angle = 2*angle_1-angle_2;
	let x_temp = Math.sqrt(Math.pow(x_0,2)+Math.pow(y_0,2))*Math.cos(final_angle);
	let y_temp = Math.sqrt(Math.pow(x_0,2)+Math.pow(y_0,2))*Math.sin(final_angle);
	ant_array[i].vx = (x_temp-x)/delta_t;
	ant_array[i].vy = (y_temp-y)/delta_t;

};

/**
 * The `App` factory function creates an object to encapsulate the core logic
 * for the application.  The object is created given the nest geometries,
 * colony size, and some Brownian motion parameters
 **/
const App = function({radius_A, radius_B, aperture_A, aperture_B, rate_A, rate_B, colony_size, velocity}) {

    
    // Set some global params
    let r_enc = 5; // encounter radius
    let timestep = 0; // keeps track of the number of timesteps
    let timer = null; // keeps track of whether or not the sim is running
    let dt = 1/velocity; // this is the timestep in s (we only move 1 px max)

    // Get the SVG element with id 'trajectory'
    let svg = d3.select('#trajectory');
    let width = svg.attr('width');
    let height = svg.attr('height');

    // Get the center of the nests
    let center_x = width/2;
    let cx_A = center_x - center_x/2;
    let cx_B = center_x + center_x/2;
    let cy_A = height/2;
    let cy_B = height/2;

    var ant_array = []; // empty array to hold ants

    const fire = function() {

    	let t = 0; // keeps track of time between timesteps
    	let t_c = dt; // time until next event
    	let index = 0; // this is the index of the ant hitting the wall next
	    let num_ants = ant_array.length;

	    // Check if we need to add new ants
	    if (timestep % rate_A == 0 && num_ants < colony_size) {
	    	// Make sure this isn't the last ant
	    	if (num_ants != colony_size - 1){
		    	init_ant(cx_A, cy_A, radius_A, r_enc, aperture_A, ant_array, velocity, timestep);
	    	} else {
	    		// if it is the last ant make sure nest B isn't also expecting an ant at this time
	    		if (timestep % rate_B != 0) {
		    		init_ant(cx_A, cy_A, radius_A, r_enc, aperture_A, ant_array, velocity, timestep);
	    		} else {
	    			// randomly choose which nest the last ant goes to
	    			let rand_nest = Math.floor(Math.random()*2);
	    			if (rand_nest == 0) {
			    		init_ant(cx_A, cy_A, radius_A, r_enc, aperture_A, ant_array, velocity, timestep); // add to nest A
	    			} else {
					    init_ant(cx_B, cy_B, radius_B, r_enc, aperture_B, ant_array,velocity, timestep); // add to nest B
	    			}
	    		}
	    	}
			num_ants = ant_array.length;	    
		}
	    if (timestep % rate_B == 0 && num_ants < colony_size) {
		    init_ant(cx_B, cy_B, radius_B, r_enc, aperture_B, ant_array,velocity, timestep); // add ant to nest B
	    }

	    // Get time until next collision
	    while (t < dt) {

	    	let t_remaining = dt-t; // initialize time until next rendering
	    	let t_min = t_remaining; // variable to keep track of min time

	    	// Loop over ants
    		for (let i = 0; i < num_ants; ++i) {

    			// Calculate time until wall collision
		        if (ant_array[i].x < width/2) {
		        	// Nest A update
			    	let x = ant_array[i].x-cx_A;
			    	let y = ant_array[i].y-cy_A;
			    	let R = radius_A;
			        t_c = get_t_wall(x, y, ant_array[i].vx, ant_array[i].vy, R, r_enc);
		        } else {
			    	let x = ant_array[i].x-cx_B;
			    	let y = ant_array[i].y-cy_B;
			    	let R = radius_B;
			        t_c = get_t_wall(x, y, ant_array[i].vx, ant_array[i].vy, R, r_enc);
		        }

		        if (t_c < t_min && t_c > 1e-12){
		        	//console.log("Time until wall collision ", t_c);
		        	t_min = t_c;
		        	index = i; // this is the index of the ant colliding with wall next
		        }

    		}

    		// So all I need to do is update positions and add t_min to t
    		// Need a method to update positions for a wall update, ant update, and simple update

			simple_update(ant_array,t_min); // step everything forward in time by t_min
			t += t_min; // update time 

			// If t_min did not equal t_remaining then we had a collision of some sort
    		if (t_min != t_remaining){
    			
    			// switch the velocity vector of the ant in question
				if (ant_array[index].x < width/2) {
					// run wall update with nest A
					//console.log("Running wall collision",t,t_min);
					wall_collision(cx_A, cy_A, ant_array, t_min, index, velocity);
				} else {
					// run wall update with nest B
					//console.log("Running wall collision",t,t_min);
					wall_collision(cx_B, cy_B, ant_array, t_min, index, velocity);
				}

    		}

    		if (t_min < 1e-6) {
    			break;
    		}

	    };

	};


    // The render method take care of rendering a single timestep of the
    // simulation
    const render = function() {


        // Draw Nests
        let arc = d3.arc();
        svg.selectAll("path").remove(); // Remove old nests
        svg.append("path")
        .attr("transform","translate(" + [cx_A, cy_A] + ")") // center arc
        .attr("d", arc({
            innerRadius: radius_A, 
            outerRadius: radius_A+1, // 1 pixel thick
            startAngle: aperture_A/2*Math.PI/180,
            endAngle: 2*Math.PI-aperture_A/2*Math.PI/180,
        }));
        svg.append("path")
        .attr("transform","translate(" + [cx_B, cy_B] + ")") // center arc
        .attr("d", arc({
            innerRadius: radius_B, 
            outerRadius: radius_B+1, // 1 pixel thick
            startAngle: aperture_B/2*Math.PI/180,
            endAngle: 2*Math.PI-aperture_B/2*Math.PI/180,
        }));

        // If there aren't any ants make an ant at the top of each nest
	    if (timestep == 0) {
		    ant_array = []; // empty array to hold all ants
		    init_ant(cx_A, cy_A, radius_A, r_enc, aperture_A, ant_array, velocity, timestep);
		    init_ant(cx_B, cy_B, radius_B, r_enc, aperture_B, ant_array,velocity, timestep);
	    }

        // Draw Ants
        const ant_plot = svg.selectAll("circle").data(ant_array);
        ant_plot.enter() 
        .append("circle")
        .merge(ant_plot)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", r_enc)
        .style("fill", (d) => d.color);
        ant_plot.exit().remove();

        // Draw Progress Bars
        /* The actual bar with the progress */

// .bar {
//    display: block;
//    overflow: hidden;
//    height: 18px;
//    width: 0px;
//    border: 1px solid rgba(0, 0, 0, 0.5);
//    border-radius: 10px;
//    margin-bottom: 5px;
//    margin-left: 10px;
//    box-shadow: 1px 1px 1px #888888;
// }

/* The div in which we append all the bars */
// .progress-bars {
//    width: 350px;
//    min-height: 100px;
//    margin-bottom: 50px;
//    padding: 25px 0 0 25px;
//    float: left;
// }

    };

    // Simulate exactly one timestep
    const step = function() {

        timestep += 1; // update timestep (not the same as the time..)
        fire(ant_array);
        render(); // render the initial state

    };

    // Start the simulation
    const start = function() {
        // Disable the step and start buttons and all initial param sliders
        d3.select('#step').attr('disabled', true);
        d3.select('#start').attr('disabled', true);
        d3.select('#radius-A-slider').attr('disabled',true);
        d3.select('#aperture-A-slider').attr('disabled',true);
        d3.select('#discovery-A-slider').attr('disabled',true);
        d3.select('#radius-B-slider').attr('disabled',true);
        d3.select('#aperture-B-slider').attr('disabled',true);
        d3.select('#discovery-B-slider').attr('disabled',true);
        d3.select('#colony-slider').attr('disabled',true);
        d3.select('#velocity-slider').attr('disabled',true);


        // Enable the stop button
        d3.select('#stop').attr('disabled', null);

        // Start a timer that will call the `step` function every dt milliseconds
        timer = d3.interval(step, dt*1000);
        //console.log(timer);
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
            d3.select('#radius-A-slider').attr('disabled',null);
            d3.select('#aperture-A-slider').attr('disabled',null);
            d3.select('#discovery-A-slider').attr('disabled',null);
            d3.select('#radius-B-slider').attr('disabled',null);
            d3.select('#aperture-B-slider').attr('disabled',null);
            d3.select('#discovery-B-slider').attr('disabled',null);
            d3.select('#colony-slider').attr('disabled',null);
            d3.select('#velocity-slider').attr('disabled',null);

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

        // Clear the ants and restart a signle ant in the center

        // Should we reset the timer variable to null? The simulation isn't running?

        // Render the all-zero state
        render();
    };


    // With all of the methods defined, go ahead and render the initial state
    render();

    // We now create the object to be returned.
    return Object.create({


        // Get and set radius A
        get radius_A() {
            return radius_A;
        },
        set radius_A(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the cell_count
            radius_A = n;

            // Update the cell-count slider's label
            d3.select('#radius-A').html(`${radius_A} pixels`);

            this.restart();

        },


        // Get and set radius B
        get radius_B() {
            return radius_B;
        },
        set radius_B(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the cell_count
            radius_B = n;

            // Update the cell-count slider's label
            d3.select('#radius-B').html(`${radius_B} pixels`);

            this.restart();

        },


        // Get and set aperture A
        get aperture_A() {
            return aperture_A;
        },
        set aperture_A(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the aperture
            aperture_A = n;

            // Update the cell-count slider's label
            d3.select('#aperture-A').html(`${aperture_A} degrees`);
            
            this.restart();
        },


        // Get and set aperture B
        get aperture_B() {
            return aperture_B;
        },
        set aperture_B(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the aperture
            aperture_B = n;

            // Update the cell-count slider's label
            d3.select('#aperture-B').html(`${aperture_B} degrees`);
            
            this.restart();
        },


        // Get and set rate A
        get rate_A() {
            return rate_A;
        },
        set rate_A(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the discovery rate
            rate_A = n;

            // Update the slider's label
            d3.select('#discovery-A').html(`${rate_A} steps/ant`);

            // restart
            this.restart();
        },


        // Get and set rate B
        get rate_B() {
            return rate_B;
        },
        set rate_B(n) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the discovery rate
            rate_B = n;

            // Update the slider's label
            d3.select('#discovery-B').html(`${rate_B} steps/ant`);

            // restart
            this.restart();
        },



        get colony_size() {
            return colony_size;
        },
        set colony_size(c) {
            // Stop the simulation (if it is running)
            this.stop();

            colony_size = c; // sets the number of ants for our nest object
            // x_positions = new Array(nest.num_ants).fill(0); // initialize array and fill with zeros

            d3.select('#colony').html(`${colony_size} ants`);
            this.restart();


        },


        get velocity() {
            return velocity;
        },

        set velocity(t) {
            // Stop the simulation (if it is running)
            this.stop();

            // Set the step_time
            velocity = t;

            // Update the speed slider's label
            d3.select('#velocity').html(`${velocity} pixels/sec`);
        },

        // Include the step, start, stop and restart methods in the object
        step, start, stop, restart
    });
};


// Now we can run our simulator once the HTML page has loaded
(function() {
    // Create the initial application state
    const app = App({
        radius_A: 40, // nest A radius
        radius_B: 180, // nest B radius
        aperture_A: 35, // nest A opening angle
        aperture_B: 35, // nest B opening angle
        rate_A: 90, // seconds between discovery
        rate_B: 90, // seconds between discovery
        colony_size: 50, // total number of ants
        velocity: 15 // pixels/sec
    });

    // Register onclick handlers to the step, start, stop and restart buttons
    d3.select('#step').on('click', app.step);
    d3.select('#start').on('click', app.start);
    d3.select('#stop').on('click', app.stop);
    d3.select('#restart').on('click', app.restart);

    // Register an oninput handler to the radius A slider, and set the initial value
    d3.select('#radius-A-slider').on('input', function() {
        app.radius_A = parseInt(this.value);
    }).attr('value', `${app.radius_A}`);
    // Set the slider's initial label
    d3.select('#radius-A').html(`${app.radius_A} pixels`);

    // Register an oninput handler to the radius B slider, and set the initial value
    d3.select('#radius-B-slider').on('input', function() {
        app.radius_B = parseInt(this.value);
    }).attr('value', `${app.radius_B}`);
    // Set the slider's initial label
    d3.select('#radius-B').html(`${app.radius_B} pixels`);

    // Register an oninput handler to the aperture A slider, and set the initial value
    d3.select('#aperture-A-slider')
    .attr("value",app.aperture_A)
    .on('input', function() {
        app.aperture_A = parseInt(this.value);
    }).attr('value', `${app.aperture_A}`);
    // Set the slider's initial label
    d3.select('#aperture-A').html(`${app.aperture_A} degrees`);

    // Register an oninput handler to the aperture B slider, and set the initial value
    d3.select('#aperture-B-slider')
    .attr("value",app.aperture_B)
    .on('input', function() {
        app.aperture_B = parseInt(this.value);
    }).attr('value', `${app.aperture_B}`);
    // Set the slider's initial label
    d3.select('#aperture-B').html(`${app.aperture_B} degrees`);

    // Register an oninput handler to the discovery rate A slider, and set the initial value
    d3.select('#discovery-A-slider').on('input', function() {
        app.rate_A = parseInt(this.value);
    }).attr('value', `${app.rate_A}`);
    // Set the slider's initial label
    d3.select('#discovery-A').html(`${app.rate_A} steps/ant`);

    // Register an oninput handler to the discovery rate B slider, and set the initial value
    d3.select('#discovery-B-slider').on('input', function() {
        app.rate_B = parseInt(this.value);
    }).attr('value', `${app.rate_B}`);
    // Set the slider's initial label
    d3.select('#discovery-B').html(`${app.rate_B} steps/ant`);

    // Register an oninput handler to the colony slider, and set the initial value
    d3.select('#colony-slider').on('input', function() {
        app.colony_size = parseInt(this.value);
    }).attr('value', `${app.colony_size} ants`);
    // Set the slider's initial label
    d3.select('#colony').html(`${app.colony_size} ants`);

    // Register an oninput handler to the velocity slider, and set the initial value
    d3.select('#velocity-slider').on('input', function() {
        app.velocity = parseInt(this.value);
    }).attr('value', `${app.velocity} pixels/sec`);
    // Set the slider's initial label
    d3.select('#velocity').html(`${app.velocity} pixels/sec`);

}());