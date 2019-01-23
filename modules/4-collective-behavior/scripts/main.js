'use strict';

/* TO DO */
// Initialization Rules
// Collisions between ants

/* Styling */
// Widen progress bars
// Add ant graphic
// Add winning nest procedure
// Smooth progress transition?

// 700 lines after update/discovery rules?
// 800 lines after adding bells and whistles to svg

const init_ant = function(cx, cy, radius, r_enc, aperture, ant_array, velocity, timestep) {

    let x = 0, y = 0; // variable to store location
    let vx = 0, vy = 0; // variable to store velocity 
    let x_L = -(radius-r_enc)*Math.sin(aperture/2*Math.PI/180); // x-location of left boundary
	let y_L = (radius-r_enc)*Math.cos(aperture/2*Math.PI/180);  // y-location of left boundary
	let x_R = -x_L;
	let y_R = y_L;

	aperture = aperture/180*Math.PI; // we are going to use radians here

    // If it is the first nest, start it in the center of the aperture
    if (timestep == 0) {
    	x = 0;
    	y = -radius;    

	// Subsequent ants enter at a random location	
    } else {
    	let delta = Math.abs(Math.atan(r_enc/radius)); // as close to the edge as an ant can get
    	let theta_L = 3*Math.PI/2-aperture/2+delta; // left starting angle
    	let theta_R = 3*Math.PI/2+aperture/2-delta; // right starting angle
    	let rand_angle = theta_L+Math.random()*(theta_R-theta_L); // put us somewhere between theta_L and theta_R
    	x = radius*Math.cos(rand_angle);
    	y = radius*Math.sin(rand_angle);
    }

    // Calculate Clearance angles for heading
    let alpha = Math.abs(Math.atan((y-y_R)/(x_R-x)));
    let beta = Math.abs(Math.atan((y-y_L)/Math.abs(x_L-x)));
    let launch_angle = alpha + Math.random(Math.PI-beta-alpha); // randomly puts us in [alpha, PI-beta]
    let v_x = velocity*Math.cos(launch_angle);
    let v_y = velocity*Math.sin(launch_angle);


    // Block the entrance for the moment
    // if (timestep == 0) {
	   //  v_x = 0; // block the entrance
	   //  v_y = 0; // block the entrance
    // }


    // Append x,y position and velocity
    ant_array.push({
        "x": cx+x,
        "y": cy+y,
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
	for (let i = 0; i < ant_array.length; ++i) {
		ant_array[i].x += ant_array[i].vx*delta_t;
		ant_array[i].y += ant_array[i].vy*delta_t;
	}
};

// Define function for updating ant locations and correctly switching velocity
const wall_collision = function(cx, cy, ant_array, delta_t, i, velocity, r_enc, aperture, width, height, ticker){

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

	// Check if we exited
	angle_1 = (angle_1*180/Math.PI);  // convert to degrees
	angle_1 = (angle_1%360+360)%360;  // put it in [0,360]
	if (angle_1 > 270-aperture/2. && angle_1 < 270 + aperture/2){
		ant_array[i].vx = 0;
		ant_array[i].vy = 0;
		// Send ants to their respective sidelines
        if (ant_array[i].x < width/2) {
			ant_array[i].x = r_enc;
			ant_array[i].y = height - r_enc*(1+i);
            // Update progress bar
            ticker.left++;
        } else {
			ant_array[i].x = width - r_enc;
			ant_array[i].y = height - r_enc*(1+i);
            // Update progress bar
            ticker.right++;

        }
        ant_array.splice(i,1); // remove the ant that exited

    // If not, update heading
	} else {
		ant_array[i].vx = (x_temp-x)/delta_t;
		ant_array[i].vy = (y_temp-y)/delta_t;		
	}

};

/**
 * The `App` factory function creates an object to encapsulate the core logic
 * for the application.  The object is created given the nest geometries,
 * colony size, and some Brownian motion parameters
 **/
const App = function({radius_A, radius_B, aperture_A, aperture_B, rate_A, rate_B, colony_size, velocity, max_ants}) {

    
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

    let ant_array = []; // empty array to hold ants
    let ticker = {"left": 0, "right": 0}; // values of progress bar

    const fire = function() {

    	let t = 0; // keeps track of time between timesteps
    	let t_c = dt; // time until next event
    	let index = 0; // this is the index of the ant hitting the wall next

	    // Check if we need to add new ants
	    if (timestep % rate_A == 0 && ant_array.length < colony_size) {
	    	// Make sure this isn't the last ant
	    	if (ant_array.length != colony_size - 1){
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
		}
	    if (timestep % rate_B == 0 && ant_array.length < colony_size) {
		    init_ant(cx_B, cy_B, radius_B, r_enc, aperture_B, ant_array,velocity, timestep); // add ant to nest B
	    }

	    // Get time until next collision
	    while (t < dt) {

	    	let t_remaining = dt-t; // initialize time until next rendering
	    	let t_min = t_remaining; // variable to keep track of min time

	    	// Loop over ants
    		for (let i = 0; i < ant_array.length; ++i) {

                let x = 0, y = 0, R = 0; // initialize variables

    			// Calculate time until wall collision
		        if (ant_array[i].x < width/2) {
		        	// Nest A update
			    	x = ant_array[i].x-cx_A;
			    	y = ant_array[i].y-cy_A;
			    	R = radius_A;
		        } else {
			    	x = ant_array[i].x-cx_B;
			    	y = ant_array[i].y-cy_B;
			    	R = radius_B;
		        }

                t_c = get_t_wall(x, y, ant_array[i].vx, ant_array[i].vy, R, r_enc);

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
                    console.log
					wall_collision(cx_A, cy_A, ant_array, t_min, index, velocity, r_enc, aperture_A, width, height, ticker);
				} else {
					// run wall update with nest B
					//console.log("Running wall collision",t,t_min);
					wall_collision(cx_B, cy_B, ant_array, t_min, index, velocity, r_enc, aperture_B, width, height, ticker);
				}

    		}

	    };

	};


    // The render method take care of rendering a single timestep of the simulation
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

        d3.select("#left-prog").attr("max", max_ants);
        d3.select("#right-prog").attr("max", max_ants);
        d3.select("#left-prog").attr("value", ticker.left);
        d3.select("#right-prog").attr("value", ticker.right);

        // See if we have reached the desired number of transporters
        if (ticker.left == max_ants) {
            console.log("Simulation over.");
            console.log("Nest A Wins!");
            stop();
            // Disable the step and start buttons and all initial param sliders
            d3.select('#step').attr('disabled', true);
            d3.select('#start').attr('disabled', true);
        } else if (ticker.right == max_ants) {
            console.log("Simulation over.");
            console.log("Nest B Wins!");
            stop();
            // Disable the step and start buttons and all initial param sliders
            d3.select('#step').attr('disabled', true);
            d3.select('#start').attr('disabled', true);
        }

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
        // d3.select('#colony-slider').attr('disabled',true);
        // d3.select('#velocity-slider').attr('disabled',true);


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
            // d3.select('#colony-slider').attr('disabled',null);
            // d3.select('#velocity-slider').attr('disabled',null);

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
        ticker.left = 0; // reset left progress
        ticker.right = 0; // reset right progress

        // Render the new state
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
        max_ants: 15, // number of transporters required to end the simulation
        velocity: 25 // pixels/sec
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
    // d3.select('#colony-slider').on('input', function() {
    //     app.colony_size = parseInt(this.value);
    // }).attr('value', `${app.colony_size} ants`);
    // // Set the slider's initial label
    // d3.select('#colony').html(`${app.colony_size} ants`);

    // // Register an oninput handler to the velocity slider, and set the initial value
    // d3.select('#velocity-slider').on('input', function() {
    //     app.velocity = parseInt(this.value);
    // }).attr('value', `${app.velocity} pixels/sec`);
    // // Set the slider's initial label
    // d3.select('#velocity').html(`${app.velocity} pixels/sec`);

}());