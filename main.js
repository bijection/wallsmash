const ctx = canvas.getContext('2d')

const ball = {
	x: innerWidth,
	y: innerHeight,
	vx:-1000,
	vy:-2150,
	r: 10
}

balls = []

function render(){
	ctx.beginPath()

	//single ball
	//ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
	//ctx.fill()

	//loop through all balls
	for (var i=0; i < balls.length; i++) {
		tempBall = balls[i]
		ctx.arc(tempBall.x, tempBall.y, tempBall.r, 0, Math.PI * 2)
	}
	ctx.fill()

	//launcher
	ctx.arc(bottomCenter.x, bottomCenter.y, 50, 0, Math.PI * 2)
	ctx.fill()

	//if balls can be launched, display line between bottomcenter and mouse 
	if (canLaunch) {
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([5, 15]);
		ctx.lineWidth=5;
		ctx.moveTo(bottomCenter.x, bottomCenter.y);
		ctx.lineTo(mouseCoord.x, mouseCoord.y);
		ctx.stroke();
		ctx.restore();
	}

	
}


const level = `..........
....222...
.2.22222..
...22..22.`

const cells = [] 

level
    .split('\n')
    .map((k, row) => k
    	.split('')
    	.forEach((char, col) => cells.push([row, col, Number(char) || 0 ])))

bottomCenter = {x: innerWidth, y:innerHeight*2}
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

function collide(rect){
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
		ball.vy *= -1
	}
	if(ball.y < ball.r) {
		ball.y = ball.r
		ball.vy *= -1
	}
}

function tick(t){
	const dt = (t - last) / 1000
	last = t
	requestAnimationFrame(tick)
	canvas.width = innerWidth * 2
	canvas.height = innerHeight * 2
	ctx.clearRect(0,0, canvas.width, canvas.height)


	render()



    let abx = 0, aby = 0
    let adx = 0, ady = 0

    let vhits = 0
    let dhits = 0


  	// console.log(cells)
  	const total_displacement_x = ball.vx * dt
  	const total_displacement_y = ball.vy * dt
  	const total_displacement = Math.sqrt(total_displacement_y*total_displacement_y + total_displacement_x*total_displacement_x)

  	let partial_displacement = 0


  	function creep(x, y){
		ball.x+=x
		ball.y+=y

	    cells.forEach(cell => {

	    	const [r,c,num] = cell
	    	const w = 100, h = 100


	    	if(!num) return;
	        ctx.strokeRect(w*c , h*r , w,h)

	        let b = bounce({ w,h, x: w*c, y: h*r}, ball)

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
	            ball.x += amt2*bx
	            ball.y += amt2*by
	            dhits++
	        }
	    })

	    if(vhits > 0){
	        ball.vx += abx/vhits
	        ball.vy += aby/vhits
	    }

	    if(dhits > 0){
	        ball.x += adx
	        ball.y += ady
	    }
  	}



  	while(total_displacement - partial_displacement > 10){

  		partial_displacement += 10

  		creep(total_displacement_x / total_displacement * 10, total_displacement_y / total_displacement * 10)

  	}

	creep(total_displacement_x / total_displacement * (total_displacement - partial_displacement), total_displacement_y / total_displacement * (total_displacement - partial_displacement))

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
		ball.vy *= -1
	}
	if(ball.y < ball.r) {
		ball.y = ball.r
		ball.vy *= -1
	}
}

//moves launch-line as the cursor moves
//TODO: this mouse coordinate is definietly wrong. fix for better controls
function mouseMoved(evt) {
	var rect = canvas.getBoundingClientRect();
	mouseCoord = {
		x: evt.clientX*2.0,
		y: evt.clientY*2.0
	};
}

function keyPressed(evt) {
	if (evt.keyCode == 32) {
		spaceBarPressed();
	}
}

function spaceBarPressed() {
	balls.push(ball)
	
}

document.addEventListener('mousemove', mouseMoved, false);
document.addEventListener('keydown', keyPressed, true);



let last

requestAnimationFrame(t => {
	last = t
	requestAnimationFrame(tick)
})
