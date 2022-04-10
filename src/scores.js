import database from './database'
const scores = database.ref("gkc/highscore")

window.database = database
window.scores = scores

export default scores

