let ctx;
let scoreSpan;

let numRows = 0;
let numCols = 0;

let balls = []
let game_state = 'aiming'
let mouse = {x:0, y:0}
let ball_start_pos
let particles = []

let currentLevel = 33

const level = `..........
....888...
.8.88888..
...88..88.`

const BALL_SPEED = 1200
const MIN_SLOPE = Math.PI/12

const cells = []

level
.split('\n')
.map((k, row) => k
.split('')
.forEach((char, col) => cells.push([row, col, Number(char) *4 || 0 ])))

let frame_number = 0

function updateCellsForCurrentLevel() {

    //Shift each cell down one
    for (i=0; i<cells.length;i++) {
        let currentCell = cells[i];
        currentCell[0] += 1;
    }

    //create new row
    let numPossibleBricks = 10;
    let chanceOfBrick = 0.5;
    for (i=0; i<numPossibleBricks; i++) {
        let shouldAddBrick = Math.random() <= chanceOfBrick;
        let tempRow = 0;
        let tempCol = i;
        let tempVal = 0;
        if (shouldAddBrick) {
            tempVal = currentLevel;
        }
        newCell = [tempRow, tempCol, tempVal];
        cells.push(newCell);
    }
}

function tick(t){
    frame_number++
    const dt = (t - last) / 1000

    last = t
    requestAnimationFrame(tick)

    canvas.width = innerWidth * 1.5
    canvas.height = innerHeight * 1.5

    ctx.clearRect(0,0, canvas.width, canvas.height)


    // ctx.setTransform(1, 0, 0, 1, 0, 0);

    render()
    update_ball_positions(dt)
    update_particles(dt)

    if(game_state === 'playing'){

        if(balls.length < currentLevel) {
            const r = 10
            const x = ball_start_pos || canvas.width / 2
            const y = canvas.height - r

            const dx = mouse.x - x
            const dy = mouse.y - y
            const d = Math.sqrt(dx*dx + dy*dy)

            balls.push({
                x,
                y,
                vx:dx / d * BALL_SPEED,
                vy:dy / d * BALL_SPEED,
                r
            })
        } else {
            if(balls.every(ball => ball.gathered)) {
                balls = []

                //update to next level
                currentLevel++;
                scoreSpan.innerHTML = String(currentLevel)
                updateCellsForCurrentLevel()

                //change game state
                game_state = 'aiming'
            }
        }

        balls
        .filter(ball => ball.done)
        .forEach(ball => {
            // console.log(ball_start_pos, ball.x, ball.gather_dir)
            const d = ball_start_pos - ball.x
            if(Math.abs(d) < 1e-8 || d / ball.gather_dir < 0) {
                ball.x = ball_start_pos
                ball.vx = 0
                ball.gathered = true
                // console.log('gathered', ball)
            }
        })


    }
}

function keyPressed(evt) {
    if (evt.keyCode == 32) {
        shoot();
    }
}

function touchMoved(evt) {
    if (game_state != 'aiming') {return};

    var rect = canvas.getBoundingClientRect();

    var x = evt.touches[0].pageX;
    var y = evt.touches[0].pageY;

    mouse = {
        x: (x - rect.left) * 2,
        y: (y - rect.top) * 2
    }
}

function shoot() {
    if(game_state === 'aiming'){
        balls = []
        game_state = 'playing'
    }
}

document.addEventListener('mousemove', e => {
    if(game_state != 'aiming') return;
    var rect = canvas.getBoundingClientRect();
    mouse = {
        x: (e.clientX - rect.left) * 2,
        y: (e.clientY - rect.top) * 2
    }
})

//for desktop: spacebar or mousedown to fire
document.addEventListener('keydown', keyPressed, true);
document.addEventListener('mousedown', shoot, true);
//for mobile: touchmove to pan around, touchend to fire
document.addEventListener('touchmove', touchMoved, true);
document.addEventListener('touchend', shoot, true);

//prevent scrolling on touchscreen
document.ontouchstart = function(e){
    if ('ontouchstart' in document.documentElement) {
        e.preventDefault();
    }
}

//once HTML loads, grab the canvas and score elements
window.onload = function() {
    ctx = canvas.getContext('2d');
    scoreSpan = document.getElementById("score")
    scoreSpan.innerHTML = String(currentLevel)
}



function render(){

    //supposed to be motion trails
    // this works bad for some reason
    // ctx.fillStyle = 'rgba(0,0,255,.3)'
    // balls.forEach(({x,y,vx,vy,r}) => {
    //     const v = Math.sqrt(vx*vx + vy*vy)

    //     ctx.beginPath()
    //     ctx.moveTo(x- vx/v * 60, y - vy/v * 60)
    //     ctx.lineTo(x+vx/v * r, y-vy/v*r)
    //     ctx.lineTo(x-vx/v * r, y+vy/v*r)
    //     ctx.closePath()
    //     ctx.fill()
    // })

    ctx.fillStyle = '#48f'
    balls.forEach(({x,y,vx,vy,r}) => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
    })
    const launcher_x = ball_start_pos || canvas.width / 2    

    //launcher

    //if balls can be launched, display line between bottomcenter and mouse
    launcher_y = canvas.height - 10
    launcher_line_length = Math.sqrt(canvas.height*canvas.height + canvas.width*canvas.width)
    aimloop: if (game_state === 'aiming') {

        x_diff = mouse.x - launcher_x
        y_diff = Math.max(0,launcher_y - mouse.y)
        launcher_slope = y_diff/x_diff
        if(Math.abs(launcher_slope) < MIN_SLOPE){
          x_diff = Math.sign(launcher_slope) == 1 ? Math.cos(MIN_SLOPE) : -1*Math.cos(MIN_SLOPE)
          // x_diff = Math.sign(y_diff)*x_diff
          y_diff = Math.sin(MIN_SLOPE)
        }
        cur_line_length = Math.sqrt(x_diff*x_diff + y_diff*y_diff)
        line_scale_factor = launcher_line_length/cur_line_length
        x_diff *= line_scale_factor
        y_diff *= line_scale_factor

        ctx.save();
        ctx.strokeStyle = '#aaa'
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.lineWidth=5;
        ctx.moveTo(launcher_x, launcher_y);
        ctx.lineTo(launcher_x + x_diff, launcher_y - y_diff);
        ctx.stroke()
        ctx.restore()

        ctx.beginPath()
        ctx.arc(launcher_x, launcher_y, 10, 0, Math.PI * 2)
        ctx.fill()
    }


    function drawcell(cell, bang){
        const [r,c,num] = cell

        if(!num) return;

        const { w,h, x,y} = get_cell_rect(r,c)
        if(bang) ctx.translate((Math.random() - .5)*4, (Math.random() - .5)*4);

        ctx.fillStyle = 'rgba(' + gradient('yiorrd', 1-(num / 32)) + ',1)'
        ctx.fillRect(w*c , h*r , w,h)

        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = '40px Avenir'
        ctx.fillStyle = 'black';
        ctx.fillText(num, w*(c+.5), h*(r+.5)+2)
        ctx.fillStyle = 'white';
        ctx.fillText(num, w*(c+.5), h*(r+.5))
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    cells.forEach(c => drawcell(c))
    cells.filter(cell=>cell.hit).forEach(c => drawcell(c, true))



    particles.forEach(({x,y,r, vx,vy, age, lifetime}) => {
        const alpha = (1 - age/lifetime)
        ctx.fillStyle = 'rgba(' + gradient('hotish', 1-alpha) + ',' + alpha / 3 + ')'
        ctx.strokeStyle = 'rgba(' + gradient('hotish', 1-alpha) + ',' + alpha  + ')'
        ctx.beginPath()
        // ctx.arc(x, y, r, 0, Math.PI * 2)
        // ctx.fill()
        ctx.lineWidth = r
        ctx.moveTo(x,y)
        ctx.lineTo(x+vx /10, y + vy / 10)
        ctx.stroke()
    })
    ctx.fillStyle = 'black'


}


function update_ball_positions(dt){
    cells.forEach(cell => cell.hit = false)

    balls.forEach(ball => {


        collide_circle_rects(ball, dt)


        if(ball.y > canvas.height - ball.r) {
            ball.y = canvas.height - ball.r
            // ball.vy *= -1
            ball.vx = 0
            ball.vy = 0

            if(!balls.some(ball => ball.done)){
                ball_start_pos = ball.x
                ball.gathered = true
            } else {
                ball.vx = (ball_start_pos - ball.x) * (2 + Math.random())
                ball.gather_dir = (ball_start_pos - ball.x) || 1
            }
            ball.done = true
        }


        const v = Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy)
        if(v == 0) ball.gathered = true
        // if(v > 0 && !ball.done){
        //     ball.vx *= BALL_SPEED / v
        //     ball.vy *= BALL_SPEED / v
        // }
    })
}



function update_particles(dt){
    const new_particles = []
    particles.forEach(p => {
        if(p.age > p.lifetime) return;

        p.vx += p.ax * dt
        p.vy += p.ay * dt
        p.vx *= (1 - p.f)
        p.vy *= (1 - p.f)
        p.vr += p.ar * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.r += p.vr * dt

        if(p.r < 0) return;
        p.age += dt
        new_particles.push(p)
    })
    particles = new_particles
}


function collide_circle_rects(circle,dt){


    const {r} = circle

    const v = Math.sqrt(circle.vx*circle.vx+circle.vy*circle.vy)
    let distance_left = v * dt

    do {
        
        const [vx,vy] = unit([circle.vx, circle.vy])
        const start = [circle.x, circle.y]
        const end = [circle.x + vx * distance_left, circle.y + vy * distance_left]

        let mind = Infinity
        let minp;
        let mincell;
        let normal;

        const walls = [
            [[0,0], [0, canvas.height]],
                // [[0, canvas.height], [canvas.width, canvas.height]],
            [[canvas.width, canvas.height], [canvas.width, 0]],
            [[canvas.width, 0], [0,0]],
        ]

        walls.forEach(wall => {

            const hit = intersection(start, minus(start, end), wall[0], minus(wall[1], wall[0]))
            if(hit && !equal(hit, start) && between(hit, start, end) && between(hit, wall[0], wall[1])) {
                const d = dist2(start, hit)
                if(d < mind){
                    mind = d
                    minp = hit
                    normal = unit(cross(wall[0], wall[1]))
                    mincell = false
                }
            }
        })

        cells.forEach(cell => {
            const [r,c,num] = cell
            if(num <= 0) return;

            const {x,y,w,h} = get_cell_rect(r,c)

            const arcs = [
                [x, y],
                [x+w, y],
                [x+w, y + h],
                [x, y+h],
            ]

            const segs = [
                [[x, y - r], [x + w, y - r]],
                [[x + w + r, y], [x + w + r, y + h]],
                [[x + w, y + h + r], [x, y + h + r]],
                [[x - r, y + h], [x - r, y ]],
            ]

            arcs.forEach(a => {
                const hit = lineCircleIntersection(start, end, a, r)

                if(hit){
                    const [h1, h2] = hit
                    const d1 = dist2(h1, start), d2 = dist2(h2, start)
                    if(between(h1, start, end) && d1 < mind && !equal(h1, start)) {
                        mind = d1
                        minp = h1
                        normal = unit(minus(h1, a))
                        mincell = cell
                    }
                    if(between(h2, start, end) && d2 < mind && !equal(h2, start)) {
                        mind = d2
                        minp = h2
                        normal = unit(minus(h2, a))
                        mincell = cell
                    }
                }
            })

            segs.forEach(s => {

                const hit = intersection(start, minus(start, end), s[0], minus(s[1], s[0]))
                if(hit && !equal(hit, start) && between(hit, start, end) && between(hit, s[0], s[1])) {
                    const d = dist2(start, hit)
                    if(d < mind){
                        mind = d
                        minp = hit
                        normal = unit(cross(s[0], s[1]))
                        mincell = cell
                    }
                }
            })
        })
    
        if(minp){

            

            const bounce = 2* dot(minus(end, start), normal)
            const newv = scale(unit(minus(minus(end, start), scale(normal, bounce))), v)

            // const d = dist(end, start) - 

            circle.x = minp[0]
            circle.y = minp[1]

            circle.vx = newv[0]
            circle.vy = newv[1]

            distance_left -= dist(minp, start)

            if(mincell){
                mincell.hit = true
                mincell[2]--
            }

        } else {
            circle.x = end[0]
            circle.y = end[1]
            distance_left = 0       
        }

        // ctx.beginPath()
        // ctx.moveTo(...start)
        // ctx.lineTo(circle.x, circle.y)
        // ctx.stroke()


    } while(distance_left > 0)

}


function lineCircleIntersection(start,end,o,r){
    const [m,n] = o
    const [x,y] = start
    const [x1,y1] = end
    const a = x1 - x, b = y1 - y

    const derp = a*a + b*b

    const wolo = (a*(m - x) + b*(n - y))
    const blah = 4*wolo*wolo - 4*derp*(m*m - 2*m*x + n*n - 2*n*y - r*r + x*x + y*y)

    if(blah < 0) return false

    const merp = a*m - a*x + b*n - b*y
    const bla = Math.sqrt(blah)

    const k1 = (bla / 2 + merp)/derp
    const k2 = (-bla / 2 + merp)/derp

    return [[x + k1*a, y+k1*b], [x + k2*a, y+k2*b]]
}


const between = ([x1,y1], [x2,y2], [x3,y3]) => 
    x1 >= Math.min(x2, x3)
 && x1 <= Math.max(x2, x3)
 && y1 >= Math.min(y2, y3)
 && y1 <= Math.max(y2, y3)


const minus = ([x1,y1], [x2,y2]) => [x1 - x2, y1 - y2]
const scale = ([x1,y1], s) => [x1*s, y1*s]
const dist2 = (p1,p2) => {
    const [dx, dy] = minus(p1,p2)
    return dx*dx + dy*dy
}
const dist = (p1,p2) => Math.sqrt(dist2(p1,p2))
const intersection = ([ax, ay], [bx, by], [cx, cy], [dx, dy]) => {
    const disc = (dx*by-dy*bx)
    if(disc === 0) return false
    const u = (bx*(cy-ay) + by*(ax-cx))/disc
    return [cx+u*dx, cy + u*dy]
}

function unit([x,y]){
    const d = Math.sqrt(x*x + y*y)
    return [x/d, y/d]
}

const cross = ([x1, y1], [x2, y2]) => [y2 - y1, x1 - x2]
const dot = ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2
const equal = ([x1, y1], [x2, y2]) => Math.abs(x1 - x2) < 1e-8 && Math.abs(y1 - y2) < 1e-8



function get_cell_rect(r,c){
    const w = canvas.width / 10, h = 100
    return { w,h, x: w*c, y: h*r}
}



let last

requestAnimationFrame(t => {
    last = t
    requestAnimationFrame(tick)
})
