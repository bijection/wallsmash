

document.getElementById("scoreboardButton").addEventListener("click", function(){
  
  getTopScores((scoreSnapshot)=>{
  	let scores = []
  	scoreSnapshot.forEach(function(score) {
  		scores = [score.val()].concat(scores)
    });
    
    let tableDiv = document.createElement('div')
    tableDiv.style.height = "300px"
    tableDiv.style["text-size"] = "1.5em"
    tableDiv.style.overflow = "scroll"
    let scoreTable = document.createElement('table');
    scoreTable.style.width = "100%"
    scoreTable.id = "scoreTable"

    let tbdy = document.createElement('tbody');
    var tr = document.createElement('tr');
    th0 = document.createElement('th')
    th0.appendChild(document.createTextNode("Place"))
    th0.style.width = "10%"
    th0.align = "left"
    th1 = document.createElement('th')
    th1.appendChild(document.createTextNode("Username"))
    th1.style.width = "50%"
    th1.align = "center"
    th2 = document.createElement('th')
    th2.appendChild(document.createTextNode("Score"))
    th2.style.width = "40%"
    th2.align = "center"
    tr.appendChild(th0)
    tr.appendChild(th1)
    tr.appendChild(th2)
    tbdy.appendChild(tr)
    for(let scoreObjIndex in scores){
    	let scoreObj = scores[scoreObjIndex]
    	let tr = document.createElement('tr');
    	var numTd = document.createElement('td');
    	numTd.align = "center"
    	numTd.style.width = "10%"
    	numTd.style.padding = "5px"
    	var scorerTd = document.createElement('td');
    	scorerTd.align = "center"
    	scorerTd.style.width = "50%"
    	scorerTd.style.padding = "5px"
    	var scoreTd = document.createElement('td');
    	scoreTd.align = "center"
    	scoreTd.style.width = "40%"
    	scoreTd.style.padding = "5px"

    	numTd.appendChild(document.createTextNode(''+(parseInt(scoreObjIndex)+1)))
    	scorerTd.appendChild(document.createTextNode(scoreObj.username))
    	scoreTd.appendChild(document.createTextNode(scoreObj.score))

    	tr.appendChild(numTd)
    	tr.appendChild(scorerTd)
    	tr.appendChild(scoreTd)
    	tbdy.appendChild(tr)
    }
   	scoreTable.appendChild(tbdy)
   	tableDiv.appendChild(scoreTable)
   	console.log(scoreTable.outerHTML)

   	swal({
   		title: "GKC Scoreboard",
   		html: tableDiv.outerHTML,
   		type: 'info'
   	})

  })
  return false;
})