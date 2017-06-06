const ctx = canvas.getContext('2d')

const balls = []

function render(){
	ctx.beginPath()


	//loop through all balls
	balls.forEach(({x,y,r}) => {
		ctx.beginPath()
		ctx.arc(x, y, r, 0, Math.PI * 2)
		ctx.fill()
	})

	//launcher
	ctx.arc(canvas.width / 2, canvas.height, 50, 0, Math.PI * 2)
	ctx.fill()

	//if balls can be launched, display line between bottomcenter and mouse 
	if (canLaunch) {
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([5, 15]);
		ctx.lineWidth=5;
		ctx.moveTo(canvas.width / 2, canvas.height);
		ctx.lineTo(mouseCoord.x, mouseCoord.y);
		ctx.stroke();
		ctx.restore();
	}


    cells.forEach(cell => {

    	const [r,c,num] = cell

    	if(!num) return;

    	const { w,h, x,y} = get_cell_rect(r,c)

        ctx.strokeRect(w*c , h*r , w,h)
        ctx.font = '40px times'
        ctx.fillText(num, w*(c+.5), h*(r+.5))

	})
}


const level = `..........
....888...
.8.88888..
...88..88.`

function get_cell_rect(r,c){
	const w = canvas.width / 10, h = 100
	return { w,h, x: w*c, y: h*r}
}

const cells = [] 

level
    .split('\n')
    .map((k, row) => k
    	.split('')
    	.forEach((char, col) => cells.push([row, col, Number(char) || 0 ])))

mouseCoord = {x:0, y:0}
canLaunch = true

function bounce (rect, circle)
{
    // compute a c2c-to-c2c vector
    var half = { x: rect.w/2, y: rect.h/2 };
    var c2c = {
        x: circle.x - (rect.x+half.x),
        y: circle.y - (rect.y+half.y)};

    // check circle position inside the rectangle quadrant
    var side_dist = {
        x: Math.abs(c2c.x) - half.x,
        y: Math.abs(c2c.y) - half.y};
    if (side_dist.x >  circle.r || side_dist.y >  circle.r) return false // outside
    if (side_dist.x < -circle.r && side_dist.y < -circle.r) return false // inside
    
    if (side_dist.x < 0 || side_dist.y < 0) { // intersects side or corner
        var dx = 0, dy = 0, d = 0;
        if (Math.abs(side_dist.x) < circle.r && side_dist.y < 0){
            dx = c2c.x*side_dist.x < 0 ? -1 : 1;
            d = Math.abs(side_dist.x)
        } else if (Math.abs(side_dist.y) < circle.r && side_dist.x < 0){
            dy = c2c.y*side_dist.y < 0 ? -1 : 1;
            d = Math.abs(side_dist.y)
        }
        return [dx, dy, d];
    }

    // circle is near the corner
    let bounce = side_dist.x*side_dist.x + side_dist.y*side_dist.y  < circle.r*circle.r;
    if (!bounce) return false

    var norm = Math.sqrt (side_dist.x*side_dist.x+side_dist.y*side_dist.y);
    var dx = c2c.x < 0 ? -1 : 1;
    var dy = c2c.y < 0 ? -1 : 1;
    return [dx*side_dist.x/norm, dy*side_dist.y/norm, norm]
}


function tick(t){
	const dt = (t - last) / 1000
	last = t
	requestAnimationFrame(tick)

	canvas.width = innerWidth * 1.5
	canvas.height = innerHeight * 1.5

	ctx.clearRect(0,0, canvas.width, canvas.height)


	render()


  	// console.log(cells)
  	balls.forEach(ball => {
	  	const total_displacement_x = ball.vx * dt
	  	const total_displacement_y = ball.vy * dt
	  	const total_displacement = Math.sqrt(total_displacement_y*total_displacement_y + total_displacement_x*total_displacement_x)

	  	let partial_displacement = 0


	  	function creep(displacement){
			ball.x+= total_displacement_x / total_displacement * displacement
			ball.y+= total_displacement_y / total_displacement * displacement

			let hit = false

		    let abx = 0, aby = 0
		    let adx = 0, ady = 0

		    let vhits = 0
		    let dhits = 0

		    cells.forEach(cell => {

		    	const [r,c,num] = cell

		    	if(!num) return;

		        let b = bounce(get_cell_rect(r,c), ball)

		        if(!b) return;

		        cell[2] --

		        let [bx, by, d] = b

		        var normal_len = bx*ball.vx + by*ball.vy

		        let nx = bx*normal_len, ny = by*normal_len
		        let amt = 1+1
		        
		        abx -= amt*nx
		        aby -= amt*ny

		        vhits++

		        let amt2 = ball.r - d
		        if(amt2 > 0){
		            adx += amt2*bx
		            ady += amt2*by
		            dhits++
		        }
		    })

		    if(vhits > 0){
		        ball.vx += abx/vhits
		        ball.vy += aby/vhits
		    }

		    if(dhits > 0){
		        ball.x += adx / dhits
		        ball.y += ady / dhits
		    }

		    return vhits > 0 || dhits > 0
	  	}



	  	while(total_displacement - partial_displacement > 10 && !creep(10)){

	  		partial_displacement += 10
	  	}

	  	const remaining_displacement = total_displacement - partial_displacement
		if(remaining_displacement <= 10 && remaining_displacement > 0) {
			creep(total_displacement - partial_displacement)
		}

		if(ball.x > canvas.width - ball.r) {
			ball.x = canvas.width - ball.r
			ball.vx *= -1
		}
		if(ball.x < ball.r) {
			ball.x = ball.r
			ball.vx *= -1
		}
		if(ball.y > canvas.height - ball.r) {
			ball.y = canvas.height - ball.r
			// ball.vy *= -1
			ball.vx = 0
			ball.vy = 0
		}
		if(ball.y < ball.r) {
			ball.y = ball.r
			ball.vy *= -1
		}
  	})

}

//moves launch-line as the cursor moves
//TODO: this mouse coordinate is definietly wrong. fix for better controls
function mouseMoved(evt) {
	var rect = canvas.getBoundingClientRect();
	mouseCoord = {
		x: (evt.clientX - rect.left) * 2,
		y: (evt.clientY - rect.top) * 2
	};
}

function keyPressed(evt) {
	if (evt.keyCode == 32) {
		spaceBarPressed();
	}
}

function spaceBarPressed() {

	const r = 10
	const x = canvas.width / 2
	const y = canvas.height - r

	const dx = mouseCoord.x - x
	const dy = mouseCoord.y - y
	const d = Math.sqrt(dx*dx + dy*dy)

	balls.push({
		x,
		y,
		vx:dx / d * 1000,
		vy:dy / d * 1000,
		r
	})
}

document.addEventListener('mousemove', mouseMoved, false);
document.addEventListener('keydown', keyPressed, true);



let last

requestAnimationFrame(t => {
	last = t
	requestAnimationFrame(tick)
})
