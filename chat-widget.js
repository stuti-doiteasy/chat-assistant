(function () {
    document.head.insertAdjacentHTML('beforeend', '<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css" rel="stylesheet">');


    const style = document.createElement('style');
    style.innerHTML = `
  .hidden {
    display: none;
  }
  #chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    flex-direction: column;
  }
  .chatbot__arrow--left {
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #f0f0f0;
  }
 .chatbot__arrow {
   width: 0;
   height: 0;
   margin-top: 18px;
  }
 .chatbot__arrow--right {
   border-top: 6px solid transparent;
   border-bottom: 6px solid transparent;
   border-left: 6px solid #1a181e;
  } 
  
  #chat-popup {
    height: 70vh;
    max-height: 70vh;
    transition: all 0.3s;
    overflow: hidden;
    position:relative;
  }

  .content-loader {
    display: none;
    padding: 12px 20px;
    position: absolute;
    z-index: 1;
    right: 50px;
    bottom: 100px;
  }


  
  .typing-loader::after {
    content: "Agent is typing.....";
    animation: typing 1s steps(1) infinite, blink .75s step-end infinite;
    font-size:10px;
  }
  
  @keyframes typing {
    from,to { width: 0; }
    50% { width: 15px; }
  }
  
  @keyframes blink {
    50% { color: transparent; }
  }
  @media (max-width: 768px) {
    #chat-popup {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    }
  }
  .icon {
  width: 32px;
  height: 32px;
  background-image: url('icon.png');
}

  `;

    document.head.appendChild(style);

    // Create container for chat widget
    const chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'chat-widget-container';
    document.body.appendChild(chatWidgetContainer);

    chatWidgetContainer.innerHTML = `
    <div id="chat-bubble" class="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center cursor-pointer text-3xl">
    <div class="icon"></div>
    </div>
    <div id="chat-popup" class="hidden absolute bottom-20 right-0 w-96 bg-white rounded-md shadow-md flex flex-col transition-all text-sm">
      <div id="chat-header" class="flex justify-between items-center p-4 bg-purple-800 text-white">
        <h3 class="m-0 text-lg">Travel Chat Support</h3>
        <button id="close-popup" class="bg-transparent border-none text-white cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="content-loader">
  <div class="typing-loader"></div>
</div>
      <div id="chat-messages" class="flex-1 p-4 overflow-y-auto"></div>
      <div id="chat-input-container" class="p-4 border-t border-purple-200">
        <div class="flex space-x-4 items-center">
          <input type="text" id="chat-input" class="flex-1 border border-purple-300 rounded-md px-4 py-2 outline-none w-3/4" placeholder="Type your message...">
          <button id="chat-submit" class="bg-purple-800 text-white rounded-md px-4 py-2 cursor-pointer">Send</button>
        </div>
        <div class="flex text-center text-xs pt-4">
          <span class="flex-1">Powered by <a href="https://www.youtube.com/@doiteasy5568" target="_blank" class="text-purple-600">@doiteasy</a></span>
        </div>
      </div>
    </div>
  `;

    // Add event listeners
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatBubble = document.getElementById('chat-bubble');
    const chatPopup = document.getElementById('chat-popup');
    const chatMessages = document.getElementById('chat-messages');
    const loader = document.querySelector('.content-loader');
    const closePopup = document.getElementById('close-popup');

    chatSubmit.addEventListener('click', function () {

        const message = chatInput.value.trim();
        if (!message) return;

        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        onUserRequest(message);

    });

    chatInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            chatSubmit.click();
        }
    });

    chatBubble.addEventListener('click', function () {
        togglePopup();
    });

    closePopup.addEventListener('click', function () {
        togglePopup();
    });

    function togglePopup() {
        const chatPopup = document.getElementById('chat-popup');
        chatPopup.classList.toggle('hidden');
        if (!chatPopup.classList.contains('hidden')) {
            document.getElementById('chat-input').focus();
        }
    }

    function highlightContactDetails(text) {
        // Email regex
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        // Phone number regex
        const phoneRegex = /(\b\+?1\s)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
        // Simples URL regex
        const urlRegex = /\b((http|https):\/\/)?[a-z0-9\.-]+\.[a-z]{2,}[^\s]*\b/g;

        // Replace and add mark tag for highlighting
        text = text.replace(emailRegex, '<mark>$&</mark>');
        text = text.replace(phoneRegex, '<mark>$&</mark>');
        text = text.replace(urlRegex, '<mark>$&</mark>');

        return text;
    }

    function onUserRequest(message) {
        // Display user message
        const messageElement = document.createElement('div');
        messageElement.className = 'flex justify-end mb-3';
        messageElement.innerHTML = `
      <div class="bg-purple-800 text-white rounded-lg py-2 px-4 max-w-[70%]">
        ${message}
      </div>
    `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';

        // Reply to the user
        let url = "https://api.openai.com/v1/chat/completions";
        let OPENAI_API_KEY = "xxxxxxxxxx";

        let headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        };

        let body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are talking to a customer support  who is helping customer to answer their questions related to Tourism and do not answer any question out side Tourism.  Note if you do not know the answer, transfer the conversation to agent name DoitEasy by share the mobile number: 000000000000\n\nPerson: Who are you? \nCustomer support:  I am customer support executive in DoitEasy?\n\nPerson:  Can you share your email or phone number? \nCustomer support: ya sure, you can send me a mail on doiteasy22@gmail.com"
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            "temperature": 1,
            "max_tokens": 256,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        };
        loader.style.display = 'inline-block';
        fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        })
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';
                reply(data['choices'][0]['message']['content'].replace('Customer support:', ''))
            }) // Logs the response data from the API to the console
            .catch(error => console.error('Error:', error));
        reply("Need a paid account of openai")
    }

    function reply(message) {
        const chatMessages = document.getElementById('chat-messages');
        const replyElement = document.createElement('div');
        replyElement.className = 'flex mb-3';
        replyElement.innerHTML = `
      <div class="bg-purple-200 text-black rounded-lg py-2 px-4 max-w-[70%]">
        ${highlightContactDetails(message)}
      </div>
    `;
        chatMessages.appendChild(replyElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

})();
