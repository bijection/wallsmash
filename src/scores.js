import firebase from 'firebase/app'
import 'firebase/database'

firebase.initializeApp({
    apiKey: "AIzaSyC575_7reOgsW_UQT3LRi2hZiX6LsQdu88",
    authDomain: "cleverstaginc.firebaseapp.com",
    databaseURL: "https://cleverstaginc.firebaseio.com",
})

var database = firebase.database();
const scores = database.ref("gkc/highscore")

window.database = database
window.scores = scores

export default scores

const chat = database.ref('gkc/chat')

let missedMessages = 0

const chat_toggle_button = document.getElementById('chat_toggle')
let hidden = localStorage.chat_hidden === 'true'

chat_toggle_button.addEventListener('click', e => {
    hidden = !hidden
    hide_chat()
})

hide_chat()

function hide_chat(){
    if(hidden) {
        document.querySelector('.chat').classList.add('hidden')
        chat_toggle_button.innerText = 'Show Chat'
        missedMessages = 0
    } else {
        document.querySelector('.chat').classList.remove('hidden')
        chat_toggle_button.innerText = 'Hide Chat'
    }

    try{
        localStorage.chat_hidden = hidden
    } catch(e){
        console.warn(e)
    }
}

const messages_el = document.querySelector('.messages')

chat.limitToLast(100).on('value', s => {
    messages_el.innerHTML = ''

    missedMessages++
        
    if(hidden) chat_toggle_button.innerText = 'Show Chat (' + missedMessages + ')'

    const now = Date.now()

    s.forEach(ref => {
        const s = ref.val()
        const node = document.createElement('div')
        node.className = 'message-item'
        node.innerHTML = `
            <div class="username">
                <div class="name"></div>
                <div class="time"></div>
            </div>	
            <div class="message"></div>
        `
        node.querySelector('.message').innerText = s.message.slice(0,2000)
        node.querySelector('.name').innerText = s.username
        node.querySelector('.time').innerText = now - s.timestamp > 1000 * 60 * 60 * 2 
            ? new Date(s.timestamp).toLocaleDateString()
            : new Date(s.timestamp).toLocaleTimeString().replace(/(?<=.+:[^;]+):\d+/, '')
        messages_el.appendChild(node)
    })

    messages_el.scrollTop = messages_el.scrollHeight
})

function newMessage({message, username}){
    chat.push({message, username, timestamp: firebase.database.ServerValue.TIMESTAMP})
}

const anon_names = [
    "anon",
    "anon_ang",
    "anon_cillo",
    "anon_ol",
    "anon_ychia",
    "anon_ym",
    "anon_yma",
    "anon_ymity",
    "anon_ymous",
    "anon_ymously",
    "anon_ymousness",
    "anon_ymuncule"
]


const username_input = document.querySelector('.compose input')
username_input.value = localStorage.username || anon_names[Math.floor(Math.random()*(anon_names.length))]
username_input.addEventListener('change', e => {
    try{
        localStorage.username = e.target.value
    } catch(e){
        console.warn(e)
    }
})

document.querySelector('.compose textarea').addEventListener('keypress', e=> {
    if(e.key === 'Enter' && !e.shiftKey && e.target.value.trim() !== '') {
        e.preventDefault()
        newMessage({
            message: e.target.value, 
            username: username_input.value
        })
        e.target.value = ''
    }
})