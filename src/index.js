// import swal from 'sweetalert2'
// import 'sweetalert2/dist/sweetalert2.css'

// import './scoreboard'

import gradient from './gradient'
// import scores from './scores'

import './index.css'

let ctx;
let scoreSpan;
let recordSpan;
let score;

let game_state;
let last_level_end;
let mouse = {x:0, y:0}
let ball_start_pos, next_ball_start_pos

let balls;
let particles;
let trails;

let currentLevel;
let next_ball_types;
let ball_types;

let ball_speed;

const BALL_RADIUS = 10
const MIN_ANGLE = Math.PI/12
const NUM_ROWS = 10
const NUM_COLS = 10

const NORMAL_COLOR = '#48f'
const LASER_COLOR = '#691c7e'

let cells = []
let items = new Set()


function startGame(){
    game_state = 'aiming'
    
    currentLevel = 2
    // next_ball_types = Array.from(new Array(currentLevel-1), () => Math.random() > .7 ? 'laser':'ball')
    next_ball_types = Array.from(new Array(currentLevel-1), () => 'ball')
    ball_types = Array.from(next_ball_types)

    balls = []
    particles = []
    trails = []

    score = 0
    scoreSpan.innerHTML = score
    cells = []
    items = new Set()
    ball_start_pos = undefined

    for(let i = 0; i<4; i++)updateCellsForCurrentLevel()

}
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
    })

    items.forEach(item => {
        item[0]++
    })

    //create new row
    const chanceOfBrick = 0.5;
    const chanceOfItem = 0.2;
    for (let i=0; i<NUM_COLS; i++) {
        if(Math.random() <= chanceOfBrick) cells.push([0, i, currentLevel]);
        else if(Math.random() <= chanceOfItem){
            if(currentLevel == 5) items.add([0, i, 'laser'])
            else if(currentLevel > 5 && currentLevel < 15 && Math.random() > .5) items.add([0, i, 'laser'])
            else if(currentLevel > 15 && Math.random() > .95) items.add([0, i, 'laser'])
            else items.add([0, i, 'ball'])
        }
    }
}

function tick(t){
    frame_number++
    const dt = (t - last) / 1000

    last = t
    requestAnimationFrame(tick)

    // if(innerWidth < 700) {
    //     canvas.width = innerWidth * 2
    //     canvas.height = innerHeight
    // } else {
    //     canvas.width = innerWidth * 1.5
    //     canvas.height = innerHeight * 1.5
    // }
    const {width, height} = document.getElementById('canvas-wrap').getBoundingClientRect()
    
    canvas.width = width * 2
    canvas.height = height * 2

    ball_speed = Math.max(Math.min(2000, canvas.width), 1500)


    update_ball_positions(dt)
    update_particles(dt)
    render(t, dt)



    if(game_state === 'playing'){

        if(ball_types.length) {


            if(frame_number % 3 == 0){
                let type = ball_types.shift()

                if(type === 'ball'){
                    let launch_angle = get_launch_angle()

                    const r = BALL_RADIUS
                    const x = ball_start_pos || canvas.width / 2
                    const y = getBottom() - r

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
                        vx:Math.cos(launch_angle) * ball_speed, // cos(theta)
                        vy:-1*Math.sin(launch_angle) * ball_speed, // sin(theta)
                        r,
                        type,
                        last: !ball_types.filter(x => x==='ball').length
                    })

                } else if(type === 'laser'){
                    let launch_angle = get_launch_angle(Math.sin(ball_types.length / 8 * Math.PI) *Math.PI / 100)

                    const r = BALL_RADIUS
                    const x = ball_start_pos || canvas.width / 2
                    const y = getBottom() - r

                    // balls.push({
                    //     x,
                    //     y,
                    //     vx:Math.cos(launch_angle) * ball_speed, // cos(theta)
                    //     vy:-1*Math.sin(launch_angle) * ball_speed, // sin(theta)
                    //     r,
                    //     type
                    // })

                    const start = [x, y]
                    const vx = Math.cos(launch_angle) * (canvas.width + canvas.height)
                    const vy = -Math.sin(launch_angle) * (canvas.width + canvas.height) 
                    const end = [x+vx, y+vy]



                    cells.forEach(cell => {
                        const [r,c,n] = cell

                        if(n <= 0) return;

                        const rect = get_cell_rect(r,c)
                        const hit = box_ray_intersection(
                            rect,
                            start,
                            [1/vx, 1/vy],
                            canvas.width+canvas.height
                        )

                        if(!hit) return;

                        
                        const {x,y,w,h} = rect
                        const segs = [
                            [[x, y], [x + w, y]],
                            [[x + w, y], [x + w, y + h]],
                            [[x + w, y + h], [x, y + h]],
                            [[x, y + h], [x, y ]],
                        ]
                    
                        segs.forEach(s => {

                            const hit = intersection(start, [vx,vy], s[0], minus(s[1], s[0]))
                            if(hit && !equal(hit, start) && between(hit, start, end) && between(hit, s[0], s[1])) {
                                addParticle({
                                    vx,
                                    vy,
                                    vr: 100,
                                    f: .1,
                                    x : hit[0],
                                    y : hit[1],
                                    r : 1,
                                    lifetime: Math.random(),
                                    color: 'rgba(' + gradient('progress', n / 125) + ',1)'
                                })
                                cell[2]--
                                incrementScore()
                            }

                        })
                    })

                    addParticle({
                        x,
                        y,
                        toX: end[0],
                        toY: end[1],
                        r: 1, 
                        vr: 150,
                        fade: true,
                        color: '#aaf',
                        // colormap: 'yiorrd',
                        lifetime: .2
                    })
                    addParticle({
                        x,
                        y,
                        toX: end[0],
                        toY: end[1],
                        r: 2, 
                        // vr: -350,
                        fade: true,
                        color: LASER_COLOR,
                        // colormap: 'yiorrd',
                        lifetime: .2
                    })


                }

            }


        } else {
            if(balls.every(ball => ball.gathered)) {
                balls = []

                //update to next level
                currentLevel++;

                ball_start_pos = next_ball_start_pos
                ball_types = Array.from(next_ball_types)

                //potentially set game_state to 'lost'
                game_state='levelup'
                last_level_end = t
                updateCellsForCurrentLevel()
            }
        }

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

document.getElementById('canvas-wrap').addEventListener('mousemove', e => {
    if(!(game_state === 'aiming' || game_state == "levelup") ) return;
    var rect = canvas.getBoundingClientRect();
    mouse = {
        x: (e.clientX - rect.left) * 2,
        y: (e.clientY - rect.top) * 2
    }
})

//for desktop: spacebar or mousedown to fire
document.getElementById('canvas-wrap').addEventListener('keypress', keyPressed, true);
document.getElementById('canvas-wrap').addEventListener('click', shoot, true);
//for mobile: touchmove to pan around, touchend to fire
document.getElementById('canvas-wrap').addEventListener('touchmove', touchMoved, true);
document.getElementById('canvas-wrap').addEventListener('touchend', shoot, true);

//prevent scrolling on touchscreen
document.addEventListener('touchstart', function(e){
    if (e.target === canvas) {
        console.log('preventing scroll')
        e.preventDefault();
    }
}, {passive: false})

end_button.addEventListener('click', e => {
    balls
    .filter(ball => !ball.falling && !ball.done && !ball.gathered)
    .forEach(ball => {
        ball.vx = 0
        ball.vy = ball_speed
        ball.falling = true
    })
})




















const get_launch_angle = (da = 0)=>{
    const r = BALL_RADIUS
    const x = ball_start_pos || canvas.width / 2
    const y = getBottom() - r

    const dx = mouse.x - x
    const dy = mouse.y - y

    let launch_angle = Math.atan2(-dy, dx) + da
    if(launch_angle < -Math.PI / 2) launch_angle = Math.PI

    const w = canvas.width * (NUM_COLS - 1) / NUM_COLS / 2

    const max_angle = Math.atan2(canvas.height / NUM_ROWS, -w)
    const min_angle = Math.atan2(canvas.height / NUM_ROWS, w)

    launch_angle = Math.min(Math.max(min_angle, launch_angle), max_angle)

    return launch_angle
}

function draw_trails(){
    ctx.save()
    ctx.strokeStyle = NORMAL_COLOR
    ctx.lineWidth = 10
    ctx.globalAlpha = .3
    trails.forEach(([start, end]) => {
        ctx.beginPath()
        ctx.moveTo(...start)
        ctx.lineTo(...end)
        ctx.stroke()
    })
    ctx.restore()
}

function draw_balls(){
    balls.forEach(({x,y,vx,vy,r,type, last}) => {
        ctx.beginPath()
        if(type === 'ball') {
            ctx.fillStyle = NORMAL_COLOR
            ctx.arc(x, y, r , 0, Math.PI * 2)
        } else if(type === 'laser') {
            ctx.fillStyle = LASER_COLOR
            ctx.fillRect(x - r/2, y - r, r, r*2)
            // ctx.arc(x, y, r , 0, Math.PI * 2)
        }
        ctx.fill()
    })
}

function draw_launcher(){
    const launcher_x = ball_start_pos || canvas.width / 2
    const launcher_y = getBottom() - BALL_RADIUS
    const launcher_line_length = Math.sqrt(canvas.height*canvas.height + canvas.width*canvas.width)
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
    ctx.fillStyle = NORMAL_COLOR
    ctx.arc(launcher_x, launcher_y, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fill()
}

function draw_cell_glow(cell){
    const [r,c,num] = cell

    if(num <= 0) return;

    const { w,h, x,y, cx, cy} = get_cell_rect(r,c)

    ctx.save()
    ctx.strokeStyle = '#48f'
    ctx.lineWidth = 4
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 80;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#000'
    ctx.fillRect(x, y, w, h)
    // ctx.strokeRect(x, y, w, h)
    ctx.restore()
}

function draw_cell(cell, bang){
    const [r,c,num] = cell

    if(num <= 0) return;

    const { w,h, x,y, cx, cy} = get_cell_rect(r,c)
    
    const bx = bang ? (Math.random() - .5)*10 : 0
    const by = bang ? (Math.random() - .5)*10 : 0

    // if(num < 50) {
    //     ctx.fillStyle = 'rgba(' + gradient('magma', 1 - (num / 50)) + ',1)'
    // } else {
    //     ctx.fillStyle = 'rgba(' + gradient('magma2', ((num - 50) / Math.max(currentLevel- 49, 50))) + ',1)'
    // }

    ctx.fillStyle = 'rgba(' + gradient('progress', num / 125) + ',1)'
    ctx.fillRect(x + bx, y + by, w,h)

    // if(num > 125){
    //     ctx.globalAlpha = (num - 125) / 50
    //     ctx.drawImage(STARS_IM, x,y,w,h)
    //     ctx.globalAlpha = (num - 125) / 50

    //     // ctx.lineWidth = 10
    //     // ctx.strokeRect(x + bx, y + by, w, h)
    // }

    if(num > 130){
        const d = Math.min((num - 130)/60,1)
        if(Math.random() < d / 10){
            const size = (d * 10) + 2
            addParticle({
                type: 'circle',
                x: x + Math.random()*w,
                y: y + Math.random()*h,
                lifetime: 3,
                color: 'rgba('+gradient('stars', d)+',1)',
                fade: true,
                // endColor: [255,255,255,1],
                // vr: -10,
                r: 3*Math.random()
            })
        }
    }

    //     const sparkles = Math.floor(d * 10)

    //     ctx.fillStyle = '#fff'
    //     for (var i = 0; i < sparkles; i++) {
    //         const dx = ((r*3+c*7+i*13) % 11) / 11
    //         const dy = ((r*5+c*7+i*3) % 11) / 11

    //         ctx.beginPath()
    //         ctx.arc(x+w*dx, y + h *dy, dy * 10, 0, Math.PI*2)
    //         ctx.fill()
    //     }



    //     // const sparkles = Math.floor( Math.random() * r * 50)
    //     // ctx.fillStyle = 'rgba(255,255,255,1)'
    //     // for (var i = 0; i < sparkles; i++) {
    //     //     // ctx.beginPath()
    //     //     // ctx.arc(x+w*Math.random(), y + h *Math.random(), w / 50 * r * Math.random(), 0, Math.PI*2)
    //     //     // ctx.fill()
    //     // }
    // }

    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = '40px Avenir'
    ctx.fillStyle = 'black';
    ctx.fillText(num, cx + bx, cy + by + 2)

    ctx.fillStyle = 'white';
    ctx.fillText(num, cx + bx, cy + by)
}

function draw_cells(){
    // if(currentLevel > 120) cells.forEach(c => draw_cell_glow(c))
    cells.forEach(c => draw_cell(c))
    cells.filter(cell=>cell.hit).forEach(c => draw_cell(c, true))
}

function draw_items(t){
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
        } else if(type == 'laser'){
            const { w,h, x,y, cx, cy} = get_cell_rect(r,c)
            ctx.fillStyle = LASER_COLOR
            // ctx.beginPath()
            // ctx.arc(cx, cy, 10, 0, Math.PI*2)
            // ctx.fill()
            ctx.fillRect(cx - 5, cy - 10, 10, 20)


            ctx.strokeStyle = LASER_COLOR
            ctx.beginPath()
            ctx.arc(cx, cy, 20 + 5*Math.sin(t / 300), 0, Math.PI*2)
            // const sides = 10

            // let a = Math.random() * Math.PI * 2
            // const start_r = Math.sin(t / 1000) * 5 + 20//Math.random() * 10 + 20
            // ctx.moveTo(cx + start_r * Math.cos(a), cy + start_r * Math.sin(a))

            // for (var i = 0; i < sides; i++) {
            //     a += 1 / sides * Math.PI * 2
            //     const r = Math.sin(t / 10000 * i ) * 5 + 20//Math.random() * 10 + 20
            //     ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            // }
            // ctx.closePath()
            ctx.stroke()
        }
    })
}

function draw_particles(){

    particles.forEach(({x,y,r, vx,vy,toX,toY, age, lifetime, text, color, fade, startColor, endColor, colormap, type}) => {
        const alpha = Math.max(1 - age/lifetime, 0)
        if(fade) ctx.globalAlpha = alpha

        if(colormap) {
            color = 'rgba(' + gradient(colormap, 1-alpha) + ',1)'
        } 

        if(color) {
            ctx.fillStyle = color
            ctx.strokeStyle = color
        }


        if(type === 'text'){
            ctx.font = r+'px Avenir'
            ctx.fillText(text, x, y)
        } else if(type === 'circle'){
            ctx.beginPath()
            ctx.arc(x,y,r,0,Math.PI*2)
            ctx.fill()
        } else {
            // ctx.arc(x, y, r, 0, Math.PI * 2)
            // ctx.fill()
            ctx.beginPath()
            ctx.lineWidth = r
            ctx.moveTo(x,y)
            if(typeof toX != 'undefined') ctx.lineTo(toX, toY)
            else ctx.lineTo(x+vx /10, y + vy / 10)
            ctx.stroke()
        }

        ctx.globalAlpha = 1
    })
}

function draw_lost_screen(){
    ctx.fillStyle = 'rgba(0,0,0,.3)'
    ctx.fillRect(0,0, canvas.width, canvas.height)

    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    const text_size = canvas.width / 15
    ctx.font =  text_size+ 'px Avenir'


    const sadmessage = [
        'You Lose 😱',
        'あなたは失う 😱',
        'Tu Perdiste 😱',
        'أنت تفقد 😱',
        'Tu As Perdu 😱',
        '你输了 😱'
    ]

    ctx.fillStyle = '#f0f0f0'
    ctx.fillText(sadmessage[Math.floor(Date.now() / 1500) % sadmessage.length], canvas.width / 2, canvas.height / 2)
    
    ctx.font =  '30px Avenir'
    ctx.fillText('[tap to restart]', canvas.width / 2, canvas.height / 2 +text_size/2+20)
}

function draw_background(r, t){

    // ctx.fillStyle = 'rgba('+gradient('space', (currentLevel - 120) / 20) + ',1)'

    ctx.save()
    if(currentLevel <= 120) {
        ctx.clearRect(0,0,canvas.width,canvas.height)
    } else {

        if (currentLevel === 121 && game_state == 'levelup'){
            ctx.globalAlpha = r
        }

        const cx = canvas.width /2,
            cy = canvas.height /2,
            radius = Math.max(canvas.width, canvas.height),
            th = t/10000;

        const grad = ctx.createLinearGradient(cx-Math.sin(th)*radius, cy-Math.cos(th)*radius, cx+Math.sin(th)*radius, cy+Math.cos(th)*radius);


        for(var i = 0; i < 3; i++){
            let time = (t + i * 10000) / 1000;

            grad.addColorStop(i / 3, `hsl(${(Math.sin(time)+1)/2*100}, 20%, 10%)`)
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0,0,canvas.width,canvas.height);        
    }
    ctx.restore()
}

function get_level_transition_progress(t){
    var total = -get_cell_rect(0,0).h

    const dt = t - last_level_end
    const v = -1
    const d = v * dt

    return {total, r:Math.min(d/total,1)}
}

function render(t, dt){

    const {r, total} = get_level_transition_progress(t)
    draw_background(r, t)

    ctx.fillStyle='rgba(180,180,180,.3)'
    ctx.fillRect(0,getBottom(),canvas.width, canvas.height - getBottom())



    draw_trails()
    draw_balls()

    if (game_state === 'aiming') {
        //if balls can be launched, display line between bottomcenter and mouse
        draw_launcher()
    }

    if(game_state == 'levelup'){
        draw_launcher()
        
        // if(r < 1) ctx.translate(0, total * (1-ease(r)))
        if(r < 1) ctx.translate(0, total * (1-r))
        else {
            game_state = 'aiming'
            cells.forEach(cell => {
                if(cell[0] === (NUM_ROWS - 1) && cell[2] > 0) {
                  if(game_state != 'lost') gameLost()
                  game_state = 'lost'
                }
            })
        }
    }

    draw_cells()
    draw_items(t)
    draw_particles()

    if (game_state === 'lost') {
        draw_lost_screen()
    }


}

// window.swal = swal


function gameLost(){

    let uname = localStorage.username
    let pr = localStorage.pr || 0
    console.log("Game state lost")


    if(score > pr) {
        recordSpan.innerHTML = score
        try{localStorage.pr = score} catch(e) {}
        // swal({
        //     title: "New high score!",
        //     text: score+" is your new personal record.",
        //     input: 'text',
        //     inputPlaceholder: 'Nickname for Leaderboard',
        //     inputValue: localStorage.username || "",
        //     showCancelButton: true,
        //     confirmButtonText: "Submit",
        //     reverseButtons: true,
        //     inputValidator: value => new Promise(
        //         (resolve, reject) => value 
        //             ? resolve()
        //             : reject('You need to write something!')
        //     )
        // }).then(username => {
        //     try{localStorage.username = username} catch(e) {}
        //     scores.push({username, score})
        // }).catch(e => {
        //     console.warn(e)
        // })
    }

    const restart = e => {
        e.preventDefault()
        startGame()
        canvas.removeEventListener('click', restart)
        canvas.removeEventListener('touchend', restart)
    }

    canvas.addEventListener('click', restart)
    canvas.addEventListener('touchend', restart)

}

function update_ball_positions(dt){
    cells.forEach(cell => cell.hit = false)
    trails = []

    balls.forEach(ball => {


        if(ball.done){
            // console.log(ball_start_pos, ball.x, ball.gather_dir)
            const d = next_ball_start_pos - (ball.x + dt * ball.vx)
            if(Math.abs(d) < 1e-8 || d / ball.gather_dir < 0) {
                ball.x = next_ball_start_pos
                ball.vx = 0
                ball.gathered = true
                // console.log('gathered', ball)
            }
        }

        move_and_collide_ball(ball, dt)

        if(ball.y > getBottom() - ball.r && !ball.done) {
            ball.y = getBottom() - ball.r
            // ball.vy *= -1
            ball.vx = 0
            ball.vy = 0

            if(!balls.some(ball => ball.done)){
                next_ball_start_pos = Math.min(Math.max(ball.x, ball.r), canvas.width - ball.r)
                ball.gathered = true
            } else {
                ball.vx = (next_ball_start_pos - ball.x) * (2 + Math.random())
                ball.gather_dir = (next_ball_start_pos - ball.x) || 1
            }
            ball.done = true
        }

        // const v = Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy)
        // if(v == 0) ball.gathered = true
        // if(v > 0 && !ball.done){
        //     ball.vx *= ball_speed / v
        //     ball.vy *= ball_speed / v
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

function incrementScore(amount=1){
    score += amount

    scoreSpan.innerHTML = score

    scoreSpan.style.transition = 'none'
    scoreSpan.className = 'gold'

    setTimeout(() => {
        scoreSpan.style.transition = '1s'
        scoreSpan.className = ''
    }, 0)   
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
                    const theta = (Math.random() - .5) * Math.PI * 1/16 + Math.atan2(ball.vy, ball.vx)

                    balls.push({
                        x: cx,
                        y: cy,
                        vx: 0,//Math.cos(theta)*ball_speed,
                        vy: ball_speed,//Math.sin(theta)*ball_speed, // sin(theta)
                        r: BALL_RADIUS,
                        falling: true,
                        type: 'ball'
                    })

                    addParticle({
                        x: cx,
                        y: cy,
                        lifetime: .3,
                        r: 10,
                        vr: 200,
                        type: 'circle',
                        fade: true,
                        color: NORMAL_COLOR,
                    })

                } else if(type === 'laser') {

                    next_ball_types.push('laser')

                    balls.push({
                        x: cx,
                        y: cy,
                        vx:0, // cos(theta)
                        vy:ball_speed, // sin(theta)
                        r: BALL_RADIUS,
                        falling: true,
                        type: 'laser'
                    })

                }
            }
        })


        if(minp){



            const bounce = dot(minus(end, start), normal)
            const newv = scale(unit(minus(minus(end, start), scale(normal, 2*bounce))), v)
            

            // const d = dist(end, start) -

            ball.x = minp[0]
            ball.y = minp[1]

            ball.vx = newv[0]
            ball.vy = newv[1]

            distance_left -= dist(minp, start)

            if(mincell){

                // addParticle({
                //     vx: (canvas.width/2 + 40 - ball.x) * 3,
                //     vy: - (ball.y) * 3,
                //     vr: 0,
                //     f: 0,
                //     x : ball.x,
                //     y : ball.y,
                //     r : 10,
                //     lifetime: 3,
                //     color: 'rgba(' + gradient('progress', mincell[2] / 125) + ',1)',
                //     type: 'circle'
                // })

                // const hits = ball.type === 'laser'
                //     ? (Math.random() > .1 ? 1 : 10)
                //     : 1
                const hits = 1

                mincell.hit = true

                for (var i = 0; i < hits; i++) {
                    const pv = scale(unit(minus(minus(end, start), scale(normal, (1+Math.random())*bounce))), v*Math.random())
                    
                    addParticle({
                        vx: pv[0],
                        vy: pv[1],
                        vr: 100,
                        f: .1,
                        x : minp[0],
                        y : minp[1],
                        r : 1,
                        lifetime: Math.random(),
                        color: 'rgba(' + gradient('progress', mincell[2] / 125) + ',1)'
                    })

                    mincell[2]--
                }

                incrementScore(hits)




                if(mincell[2] <= 0){
                    for (var i = 0; i < 10; i++) {
                        const { cx, cy} = get_cell_rect(...mincell)
                        const a = Math.random() * 2 * Math.PI
                        const v = Math.random()
                        addParticle({
                            vx: Math.cos(a)*1000 *v,
                            vy: Math.sin(a)*1000 *v,
                            vr: 100,
                            f: .1,
                            x : cx,
                            y : cy,
                            r : 1,
                            lifetime: Math.random(),
                            color: '#ddd'
                        })

                    }
                }
            }

        } else {
            ball.x = end[0]
            ball.y = end[1]
            distance_left = 0
        }


        trails.push([start, [ball.x, ball.y]])

    }

}

function addParticle(p){
    particles.push(Object.assign({
        ax: 0,
        ay: 0,
        ar: 0,
        vx: 0,
        vy: 0,
        vr: 0,
        f: 0,
        x : canvas.width/2,
        y : canvas.height/2,
        r : 10,
        lifetime: 1
    }, p))
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

// const ease = t => (.04 - .04 / t) * Math.sin(25 * t) + 1
// const ease = t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t 



function get_cell_rect(r,c){
    const w = canvas.width / NUM_COLS, h = getBottom() / NUM_ROWS
    return { w,h, x: w*c, y: h*r, cx: w*(c + .5), cy: h*(r+.5)}
}


function getBottom(){
    return canvas.height - 30
}
















let last

ctx = canvas.getContext('2d');
scoreSpan = document.getElementById("score")

recordSpan = document.getElementById("record")
recordSpan.innerHTML = localStorage.pr || 0

startGame()


requestAnimationFrame(t => {
    last = t
    requestAnimationFrame(tick)
})