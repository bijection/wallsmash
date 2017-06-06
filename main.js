const ctx = canvas.getContext('2d')

const ball = {
	x: innerWidth,
	y: innerHeight,
	vx:1000,
	vy:2000,
	r: 10
}

function render(){
	ctx.beginPath()
	ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
	ctx.fill()
}


const level = `..........
....###...
.#.#####..
...##  ##.`

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
	// canvas.style.width = '100%'
	// canvas.style.height = '100%'
	ctx.clearRect(0,0, canvas.width, canvas.height)


	render()

	ball.x+=ball.vx * dt
	ball.y+=ball.vy * dt

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

let last

requestAnimationFrame(t => {
	last = t
	requestAnimationFrame(tick)
})
