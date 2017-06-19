let ctx;
let scoreSpan;

let numRows = 0;
let numCols = 0;

let balls = []
let game_state = 'aiming'
let mouse = {x:0, y:0}
let ball_start_pos, next_ball_start_pos
let particles = []

let currentLevel = 1000
const next_ball_types = Array.from(new Array(currentLevel), () => 'ball')
let ball_types = Array.from(next_ball_types)

const level = `..........
....888...
.8.88888..
...88..88.`

const BALL_SPEED = 1200
const BALL_RADIUS = 10
const MIN_ANGLE = Math.PI/12
const NUM_ROWS = 10
const NUM_COLS = 10

const NORMAL_COLOR = '#48f'
const JITTER_COLOR = '#691c7e'

const cells = []
const items = new Set()
// items.add([0,0,'ball'])

// level
// .split('\n')
// .map((k, row) => k
// .split('')
// .forEach((char, col) => cells.push([row, col, Number(char) * 4 || 0 ])))

let frame_number = 0

function updateCellsForCurrentLevel() {

    //Shift each cell down one
    cells.forEach(cell => {
        cell[0]++
        if(cell[0] === (NUM_ROWS - 1) && cell[2] > 0) {
          if(game_state != 'lost') gameLost()
          game_state = 'lost'
        }
    })

    items.forEach(item => {
        item[0]++
    })

    //create new row
    const chanceOfBrick = 0.5;
    const chanceOfItem = 0.2;
    for (i=0; i<NUM_COLS; i++) {
        if(Math.random() <= chanceOfBrick) cells.push([0, i, currentLevel]);
        else if(Math.random() <= chanceOfItem){
            if(currentLevel > 10 && currentLevel < 20) items.add([0, i, 'jitter'])
            else items.add([0, i, 'ball'])
        }
    }
}

updateCellsForCurrentLevel()
updateCellsForCurrentLevel()
updateCellsForCurrentLevel()
updateCellsForCurrentLevel()

function tick(t){
    frame_number++
    const dt = (t - last) / 1000

    last = t
    requestAnimationFrame(tick)

    canvas.width = innerWidth * 1.5
    canvas.height = innerHeight * 1.5

    ctx.clearRect(0,0, canvas.width, canvas.height)




    render(t, dt)
    update_ball_positions(dt)
    update_particles(dt)

    if(game_state === 'playing'){

        if(ball_types.length) {

            let type = ball_types.shift()

            if(type === 'ball'){
                let launch_angle = get_launch_angle()

                const r = BALL_RADIUS
                const x = ball_start_pos || canvas.width / 2
                const y = canvas.height - r

                balls.push({
                    // this is a thing for finding nans
                    // _x: x,
                    // set x(n){
                    //     if(isNaN(n)) throw n
                    //     this._x = n
                    // },
                    // get x(){
                    //     return this._x
                    // },
                    x,
                    y,
                    vx:Math.cos(launch_angle) * BALL_SPEED, // cos(theta)
                    vy:-1*Math.sin(launch_angle) * BALL_SPEED, // sin(theta)
                    r,
                    type
                })

            } else if(type === 'jitter'){
                let launch_angle = get_launch_angle(Math.sin(ball_types.length / 8 * Math.PI) *Math.PI / 100)

                const r = BALL_RADIUS
                const x = ball_start_pos || canvas.width / 2
                const y = canvas.height - r

                balls.push({
                    x,
                    y,
                    vx:Math.cos(launch_angle) * BALL_SPEED, // cos(theta)
                    vy:-1*Math.sin(launch_angle) * BALL_SPEED, // sin(theta)
                    r,
                    type
                })
            }

        } else {
            if(balls.every(ball => ball.gathered)) {
                balls = []

                //update to next level
                currentLevel++;
                scoreSpan.innerHTML = String(currentLevel)

                //change game state
                game_state = 'aiming'
                ball_start_pos = next_ball_start_pos
                ball_types = Array.from(next_ball_types)

                //potentially set game_state to 'lost'
                updateCellsForCurrentLevel()
            }
        }

        balls
        .filter(ball => ball.done)
        .forEach(ball => {
            // console.log(ball_start_pos, ball.x, ball.gather_dir)
            const d = next_ball_start_pos - ball.x
            if(Math.abs(d) < 1e-8 || d / ball.gather_dir < 0) {
                ball.x = next_ball_start_pos
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

const get_launch_angle = (da = 0)=>{
    const r = BALL_RADIUS
    const x = ball_start_pos || canvas.width / 2
    const y = canvas.height - r

    const dx = mouse.x - x
    const dy = mouse.y - y

    let launch_angle = Math.atan2(-dy, dx) + da
    if(launch_angle < -Math.PI / 2) launch_angle = Math.PI

    const max_angle = Math.atan2(canvas.height / NUM_ROWS, -canvas.width)
    const min_angle = Math.atan2(canvas.height / NUM_ROWS, canvas.width)

    launch_angle = Math.min(Math.max(min_angle, launch_angle), max_angle)

    return launch_angle
}

function render(t, dt){

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

    balls.forEach(({x,y,vx,vy,r,type}) => {
        ctx.beginPath()
        if(type === 'ball') {
            ctx.fillStyle = NORMAL_COLOR
            ctx.arc(x, y, r , 0, Math.PI * 2)
        } else if(type === 'jitter') {
            ctx.fillStyle = JITTER_COLOR
            ctx.arc(x, y, r , 0, Math.PI * 2)
        }
        ctx.fill()
    })

    const launcher_x = ball_start_pos || canvas.width / 2
    const launcher_y = canvas.height - BALL_RADIUS
    //launcher

    //if balls can be launched, display line between bottomcenter and mouse

    const launcher_line_length = Math.sqrt(canvas.height*canvas.height + canvas.width*canvas.width)
    if (game_state === 'aiming') {

        let launch_angle = get_launch_angle()

        ctx.save();
        ctx.strokeStyle = '#aaa'
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.lineWidth=5;
        ctx.moveTo(launcher_x, launcher_y);
        ctx.lineTo(launcher_x + launcher_line_length*Math.cos(launch_angle), launcher_y - launcher_line_length*Math.sin(launch_angle));
        ctx.stroke()
        ctx.restore()

        ctx.beginPath()
        ctx.arc(launcher_x, launcher_y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fill()
    }

    function drawcell(cell, bang){
        const [r,c,num] = cell

        if(!num) return;

        const { w,h, x,y, cx, cy} = get_cell_rect(r,c)
        // if(bang) ctx.translate((Math.random() - .5)*4, (Math.random() - .5)*4);

        // if(num < 50) {
        //     ctx.fillStyle = 'rgba(' + gradient('magma', 1 - (num / 50)) + ',1)'
        // } else {
        //     ctx.fillStyle = 'rgba(' + gradient('magma2', ((num - 50) / Math.max(currentLevel- 49, 50))) + ',1)'
        // }
    
        ctx.fillStyle = 'rgba(' + gradient('progress', num / 125) + ',1)'
        ctx.fillRect(x, y, w,h)

        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = '40px Avenir'
        ctx.fillStyle = 'black';
        ctx.fillText(num, cx, cy + 2)
        ctx.fillStyle = 'white';
        ctx.fillText(num, cx, cy)

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    cells.forEach(c => drawcell(c))
    cells.filter(cell=>cell.hit).forEach(c => drawcell(c, true))

    items.forEach(item => {
        const [r,c,type] = item
        if(type == 'ball'){
            const { w,h, x,y, cx, cy} = get_cell_rect(r,c)
            ctx.fillStyle = NORMAL_COLOR
            ctx.beginPath()
            ctx.arc(cx, cy, 10, 0, Math.PI*2)
            ctx.fill()

            ctx.strokeStyle = NORMAL_COLOR
            ctx.beginPath()
            ctx.arc(cx, cy, 20 + 5*Math.sin(t / 300), 0, Math.PI*2)
            ctx.stroke()
        } else if(type == 'jitter'){
            const { w,h, x,y, cx, cy} = get_cell_rect(r,c)
            ctx.fillStyle = JITTER_COLOR
            ctx.beginPath()
            ctx.arc(cx, cy, 10, 0, Math.PI*2)
            ctx.fill()

            ctx.strokeStyle = JITTER_COLOR
            ctx.beginPath()
            ctx.arc(cx, cy, 20 + 5*Math.sin(t / 300), 0, Math.PI*2)
            ctx.stroke()
        }
    })

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

    if (game_state === 'lost') {
        ctx.fillStyle = 'rgba(255,255,255,.5)'
        ctx.fillRect(0,0, canvas.width, canvas.height)

        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = canvas.height / 10 + 'px Avenir'

        ctx.fillStyle = NORMAL_COLOR
        ctx.fillText('You Lose 😱', canvas.width / 2, canvas.height / 2)

    }


}

function restartGame(){

}

function gameLost(){
  let uname = localStorage.getItem("username")
  let pr = localStorage.getItem("pr")
  console.log("Game state lost")
  if(!uname){
    swalPrompt("New high score!", "Enter your username below to post your score to the leaderboard.", (uname)=>{
      pushNewScore(uname, currentLevel, restartGame)
    })
  }else if(currentLevel > pr){
    swal("New high score!", currentLevel+" is your new personal record.")
    pushNewScore(uname, currentLevel)
  }
}

function update_ball_positions(dt){
    cells.forEach(cell => cell.hit = false)

    balls.forEach(ball => {


        move_and_collide_ball(ball, dt)

        if(ball.y > canvas.height - ball.r) {
            ball.y = canvas.height - ball.r
            // ball.vy *= -1
            ball.vx = 0
            ball.vy = 0

            if(!balls.some(ball => ball.done)){
                next_ball_start_pos = ball.x
                ball.gathered = true
            } else {
                ball.vx = (next_ball_start_pos - ball.x) * (2 + Math.random())
                ball.gather_dir = (next_ball_start_pos - ball.x) || 1
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
        if(!p.age) p.age = 0
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


function move_and_collide_ball(ball,dt){

    const radius = ball.r


    const v = Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy)
    let distance_left = v * dt
    while(distance_left > 0) {

        const [vx,vy] = unit([ball.vx, ball.vy])
        const inv = [1/vx, 1/vy]
        
        const start = [ball.x, ball.y]
        const end = [ball.x + vx * distance_left, ball.y + vy * distance_left]
        
        if(isNaN(end[0])) throw 'walp'

        let mind = Infinity
        let minp;
        let mincell;
        let normal;

        const walls = [
            [[radius,0], [radius, canvas.height - radius]],
                // [[0, canvas.height], [canvas.width, canvas.height]],
            [[canvas.width - radius, canvas.height - radius], [canvas.width - radius, radius]],
            [[canvas.width - radius, radius], [radius,radius]],
        ]

        if(!ball.done && !ball.falling) walls.forEach(wall => {

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

        if(!ball.done && !ball.falling) cells.forEach(cell => {
            const [r,c,num] = cell
            if(num <= 0) return;

            const rect = get_cell_rect(r,c)

            const hit = box_ray_intersection({
                x: rect.x - radius,
                y: rect.y - radius,
                w: rect.w + radius * 2,
                h: rect.h + radius * 2,
            }, start, inv, distance_left)

            // console.log(hit)
            // console.log(r,c,hit)

            if(!hit) return;

            const {x,y,w,h} = rect

            const arcs = [
                [x, y],
                [x+w, y],
                [x+w, y + h],
                [x, y+h],
            ]

            const segs = [
                [[x, y - radius], [x + w, y - radius]],
                [[x + w + radius, y], [x + w + radius, y + h]],
                [[x + w, y + h + radius], [x, y + h + radius]],
                [[x - radius, y + h], [x - radius, y ]],
            ]


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

            arcs.forEach(a => {
                const hit = lineCircleIntersection(start, end, a, radius)

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

        })


        items.forEach(item => {
            const [r,c,type] = item
            const {cx, cy} = get_cell_rect(r,c)
            const hit_dist = ball.r + 30
            if(dist2([ball.x, ball.y], [cx, cy]) < hit_dist*hit_dist){
                items.delete(item)

                if(type === 'ball') {

                    next_ball_types.push('ball')

                    balls.push({
                        x: cx,
                        y: cy,
                        vx:0, // cos(theta)
                        vy:BALL_SPEED, // sin(theta)
                        r: BALL_RADIUS,
                        falling: true,
                        type: 'ball'
                    })

                } else if(type === 'jitter') {

                    next_ball_types.push('jitter')

                    balls.push({
                        x: cx,
                        y: cy,
                        vx:0, // cos(theta)
                        vy:BALL_SPEED, // sin(theta)
                        r: BALL_RADIUS,
                        falling: true,
                        type: 'jitter'
                    })

                }
            }
        })


        if(minp){



            const bounce = 2* dot(minus(end, start), normal)
            const newv = scale(unit(minus(minus(end, start), scale(normal, bounce))), v)

            // const d = dist(end, start) -

            ball.x = minp[0]
            ball.y = minp[1]

            ball.vx = newv[0]
            ball.vy = newv[1]

            distance_left -= dist(minp, start)

            if(mincell){
                mincell.hit = true
                mincell[2]--
                if(mincell[2] <= 0){
                    for (var i = 0; i < 10; i++) {
                        const { cx, cy} = get_cell_rect(...mincell)
                        const a = Math.random() * 2 * Math.PI
                        const v = Math.random()
                        particles.push({
                            ax: 0,
                            ay: 0,
                            ar: 0,
                            vx: Math.cos(a)*1000 *v,
                            vy: Math.sin(a)*1000 *v,
                            vr: 100,
                            f: .1,
                            x : cx,
                            y : cy,
                            r : 1,
                            lifetime: Math.random()
                        })
                    }
                }
            }

        } else {
            ball.x = end[0]
            ball.y = end[1]
            distance_left = 0
        }

        // ctx.beginPath()
        // ctx.moveTo(...start)
        // ctx.lineTo(ball.x, ball.y)
        // ctx.stroke()


    }

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

function box_ray_intersection(b, [x, y], [invx, invy], length) {

    const tx1 = (b.x - x)*invx;
    const tx2 = (b.x + b.w - x)*invx;

    // console.log(tx1, tx2)
 
    let tmin = Math.min(tx1, tx2);
    let tmax = Math.max(tx1, tx2);
 
    // console.log(tmin, tmax)
 

    const ty1 = (b.y - y)*invy;
    const ty2 = (b.y + b.h - y)*invy;
 
    // console.log(ty1, ty2)


    tmin = Math.max(tmin, Math.min(ty1, ty2));
    tmax = Math.min(tmax, Math.max(ty1, ty2));
 
    // console.log(tmin, tmax)

    return tmax > Math.max(tmin, 0) && tmin < length
}

// console.log(box_ray_intersection({x:0,y:0,w:10,h:10}, [15, 10], [-Math.SQRT2, -Math.SQRT2], 100))

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
    const w = canvas.width / NUM_COLS, h = canvas.height / NUM_ROWS
    return { w,h, x: w*c, y: h*r, cx: w*(c + .5), cy: h*(r+.5)}
}



let last

requestAnimationFrame(t => {
    last = t
    requestAnimationFrame(tick)
})
