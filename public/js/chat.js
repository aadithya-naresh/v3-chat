const socket = io()

const $Form = document.getElementById('message-form')
const $input = $Form.querySelector('input')
const $button = $Form.querySelector('button')
const $sendLocation = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate  = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix : true})


const autoscroll = () =>{
    const $newMessage =  $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)){
        messages.scrollTop = messages.scrollHeight;
    }

}
socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt : moment(message.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url) =>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
       username:url.username, 
       url:url.location,
       createdAt:moment(url.createdAt).format('hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$Form.addEventListener('submit',(e) =>{
    e.preventDefault()

$button.addEventListener('click',() =>{
        console.log('Clicked')

        //disable
        $button.setAttribute('disabled','disabled')

        socket.emit('sendMessage',$input.value, (message) =>{
            console.log(message)

            //enable
            $button.removeAttribute('disabled')

            //setfocusback
            $input.value = ''
            $input.focus()
        })
    })
})


$sendLocation.addEventListener('click', () =>{
    if(!navigator.geolocation)
    return alert('Sorry, geolocation is not supported by your browser!')

        // disable
        $sendLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) =>{

        socket.emit('sendLocation',position.coords.latitude,position.coords.longitude , (message) =>{
            console.log(message)

            //enable
         $sendLocation.removeAttribute('disabled')
        })

         
    })
})

socket.emit('Join',{
    username,
    room
}, (error) =>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})