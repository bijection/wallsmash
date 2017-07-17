import firebase from 'firebase/app'
import 'firebase/database'

firebase.initializeApp({
    apiKey: "AIzaSyC575_7reOgsW_UQT3LRi2hZiX6LsQdu88",
    authDomain: "cleverstaginc.firebaseapp.com",
    databaseURL: "https://cleverstaginc.firebaseio.com",
})

var database = firebase.database();
const scores = database.ref("gkc/highscore")

window.scores = scores

export default scores