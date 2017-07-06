const pushNewScore = (username, score, callback)=>{
  localStorage.pr = score
  if(!callback){ callback = function(){}}

  scores.push({
    username: username,
    score: score
  }, callback)
}

const getTopScores = (callback)=>{
  scores.orderByChild("score").limitToLast(100).once('value',function(snapshot){
    callback(snapshot)
  })
}

const swalPrompt = (title, text, callback)=>{
  swal({
    title: title || "",
    text: text || "",
    input: 'text',
    showCancelButton: true,
    inputValidator: function (value) {
      return new Promise(function (resolve, reject) {
        if (value) {
          resolve()
        } else {
          reject('You need to write something!')
        }
      })
    }
  }).then(function (result) {
    localStorage.setItem("username", result)
    callback(result)
  })
}
