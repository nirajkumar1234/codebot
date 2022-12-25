// alert('Welcome to the Codex - A new Gen AI tool for programmer made by passionate-coder Niraj Chaurasiya.')
import bot from './assets/bot.svg'
import user from './assets/user.svg'

// 'speechSynthesis' in window ? console.log("Web Speech API supported!") : console.log("Web Speech API not supported :-(")



const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval


function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}


// const speakText = (text) => {
//     const synth = window.speechSynthesis
//     let ourText = text;
//     const utterThis = new SpeechSynthesisUtterance(ourText)
//     synth.speak(utterThis)
// }




function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}


// const synth = window.speechSynthesis
const speakText = (parsedData) => {
    if ('speechSynthesis' in window) {
        const utterThis = new SpeechSynthesisUtterance(parsedData)
        // utterThis.pitch = 1.5
        utterThis.volume = 1
        utterThis.rate = 1
        utterThis.lang = 'pt-BR'
        window.speechSynthesis.speak(utterThis)
        console.log("first")
    }
    else {
        alert("SpeechSynthesis is not supported");
    }
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();

        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
        // speakText(parsedData)
        console.log(parsedData);


        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "I am sorry , but my API's and ML is offline right now."
        // alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

