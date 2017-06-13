const pushNewScore = (username, score, callback)=>{
  let pr = localStorage.getItem("pr")
  if(score>pr){
    localStorage.setItem("pr", score)
  }
  if(!callback){ callback = function(){}}

  scores.push({
    username: username,
    score: score
  }, callback)
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
