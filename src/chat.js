const chat = database.ref('gkc/chat')
export default chat

let missedMessages = 0


function setup_toggle(buttonId, elementSelector, localstorageKey, buttonName, cb=()=>0){
    const button = document.getElementById(buttonId)
    let hidden = localStorage[localstorageKey] === 'true'

    button.addEventListener('click', e => {
        hidden = !hidden
        hide_chat()
    })

    hide_chat()

    function hide_chat(){
        if(hidden) {
            document.querySelector(elementSelector).classList.add('hidden')
            button.innerText = 'Show '+buttonName
            missedMessages = 0
        } else {
            document.querySelector(elementSelector).classList.remove('hidden')
            button.innerText = 'Hide '+buttonName
        }

        cb(hidden)

        try{
            localStorage[localstorageKey] = hidden
        } catch(e){
            console.warn(e)
        }
    }

    return () => hidden
}

const messages_el = document.querySelector('.messages')
const chatHidden = setup_toggle('chat_toggle', '.chat', 'chat_hidden', 'Chat', hidden => {
    messages_el.scrollTop = messages_el.scrollHeight
})
const headerHidden = setup_toggle('header_toggle', '#header', 'header_hidden', 'Header')




chat.limitToLast(50).on('value', s => {
    messages_el.innerHTML = ''

    missedMessages++
        
    if(chatHidden()) document.getElementById('chat_toggle').innerText = 'Show Chat (' + missedMessages + ')'

    const now = Date.now()

    const messages = []
    // for some reason these curlies are needed, proabably webpack is being bad
    s.forEach(ref => {messages.push(ref.val())})
    
    messages.forEach((s, i) => {

        const prev = messages[i-1]
        const node = document.createElement('div')

        if(s.achievement) {
            node.classList.add('achievement', s.achievement)

            let score_level = s.score > 1e6 ? 'diamond'
                : s.score > 1e5 ? 'gold'
                : s.score > 1e4 ? 'silver'
                : 'bronze'

            if(s.achievement === 'good_score') node.classList.add(score_level)

            node.innerText = s.achievement === 'good_score' 
                ? `[${score_level}] ${s.username} scored ${(+s.score).toLocaleString()}`
                : s.achievement === 'personal_record' 
                ? s.username + ' set a new personal record: ' + (+s.score).toLocaleString()
                : s.achievement === 'weekly_record' 
                ? `${s.username} scored #${place+1} weekly: ${(+s.score).toLocaleString()}`
                : 'unknown achievement, reload the page?'
        } else {
            node.className = 'message-item'
            node.innerHTML = `
                <div class="username">
                    <div class="name"></div>
                    ${s.score ? `<div class="score"></div>` : ''}
                    <div class="time"></div>
                </div>	
                <div class="message"></div>
            `
    
            node.querySelector('.message').innerText = s.message.toString().slice(0,2000)
            node.querySelector('.name').innerText = s.username
            if(s.score) node.querySelector('.score').innerText = (+s.score).toLocaleString()
            node.querySelector('.time').innerText = now - s.timestamp > 1000 * 60 * 60 * 2 
                ? new Date(s.timestamp).toLocaleDateString()
                : new Date(s.timestamp).toLocaleTimeString()//.replace(/(?<=.+:[^;]+):\d+/, '')    
        }


        if(prev && s.timestamp - prev.timestamp > 1000 * 60 * 15) {
            const node = document.createElement('div')
            node.className = 'message-spacer'
            messages_el.appendChild(node)
        }
        messages_el.appendChild(node)
    })

    messages_el.scrollTop = messages_el.scrollHeight
})

