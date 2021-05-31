import scores from './scores'
import swal from 'sweetalert2'

const getTopScores = (callback)=>{
  scores.orderByChild("score").limitToLast(100).once('value',function(snapshot){
    callback(snapshot)
  })
}


function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}


export let weeklyScores
scores.limitToLast(200).once('value', (scoreSnapshot)=>{
    const tops = {}

    scoreSnapshot.forEach((handle) => {
      const val = handle.val()
      if(!tops[val.username] || tops[val.username].score < val.score) tops[val.username] = val
    })

    weeklyScores = Object.values(tops).sort((a,b) => b.score - a.score).filter(x => x.score > 1000).slice(0,30)
    updateScoreFeed()
})


export const updateScoreFeed = () => {
  const feed = `
      <div class='week-scores'>
        <div>High Scores</div>
        <div>This Week</div>
      </div>
      ${weeklyScores.map(({username, score}, i) => `
      <div>
      <div class='score-place'><span>#${i + 1} Weekly</span></div>
        <div><b>${escapeHtml(username.slice(0,100))}</b></div>
        <div>${(+escapeHtml(score)).toLocaleString()}</div>
      </div>
    `).join('')}`
    const el=document.querySelector(".scores-marquee")
    el.innerHTML = feed + feed
    el.classList.add('marquee')
}


document.querySelector(".scores-marquee")
.addEventListener("click", 
  () => {

    const table = `<div style="overflow: scroll; max-height: 300px">
      <table id="scoreTable" style="width: 100%;">
        <tbody>
          <tr>
            <th align="left" style="width: 10%;">Place</th>
            <th align="center" style="width: 50%;">Username</th>
            <th align="center" style="width: 40%;">Score</th>
          </tr>
          ${weeklyScores.map(({username, score}, i) => `<tr>
            <td align="center" style="width: 10%; padding: 5px;">${i + 1}</td>
            <td align="center" style="width: 50%; padding: 5px;">${escapeHtml(username)}</td>
            <td align="center" style="width: 40%; padding: 5px;">${(+escapeHtml(score)).toLocaleString()}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`

     swal({
       title: "Wallsmash Weekly Top Scores",
       html: table,
       // type: 'info'
     })

})

document.getElementById("scoreboardButton")
.addEventListener("click", 
  () => getTopScores((scoreSnapshot)=>{
  	let scores = []
  	scoreSnapshot.forEach(function(score) {
  		scores = [score.val()].concat(scores)
    });
    
    console.log(scores)

    const table = `<div style="overflow: scroll; max-height: 300px">
      <table id="scoreTable" style="width: 100%;">
        <tbody>
          <tr>
            <th align="left" style="width: 10%;">Place</th>
            <th align="center" style="width: 50%;">Username</th>
            <th align="center" style="width: 40%;">Score</th>
          </tr>
          ${scores.map(({username, score}, i) => `<tr>
            <td align="center" style="width: 10%; padding: 5px;">${i + 1}</td>
            <td align="center" style="width: 50%; padding: 5px;">${escapeHtml(username)}</td>
            <td align="center" style="width: 40%; padding: 5px;">${(+escapeHtml(score)).toLocaleString()}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`

   	swal({
   		title: "Wallsmash All Time Top Scores",
   		html: table,
   		// type: 'info'
   	})

  })
)