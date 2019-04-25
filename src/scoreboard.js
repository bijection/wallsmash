// import scores from './scores'
import swal from 'sweetalert2'
import 'unfetch/polyfill'

const getTopScores = (callback)=>{
  // scores.orderByChild("score").limitToLast(100).once('value',function(snapshot){
  //   callback(snapshot)
  // })


  fetch('/scores')
    .then(resp => resp.text())
    .then(data => {
      let scores = [];
      for(let line of data.split('\n')){
        try {
          scores.push(JSON.parse(line))
        } catch (err) {
          console.warn(line, err)
        }
      }
      callback(scores)
    }, err => {
      console.warn(err)
    })
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}


document.getElementById("scoreboardButton")
.addEventListener("click", 
  () => getTopScores((scores)=>{
  	// let scores = []
  	// scoreSnapshot.forEach(function(score) {
  	// 	scores = [score.val()].concat(scores)
   //  });
    
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
            <td align="center" style="width: 40%; padding: 5px;">${escapeHtml(score)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`

   	swal({
   		title: "GKC Top Scores",
   		html: table,
   		// type: 'info'
   	})

  })
)