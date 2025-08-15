document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  let conversationHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }

    // Add user message to UI and history
    appendMessage('user', userMessage);
    conversationHistory.push({ role: 'user', content: userMessage });
    userInput.value = '';

    // Show "Thinking..." message
    const thinkingMessage = appendMessage('model', 'Thinking...');

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();
      const botResponse = data.response || 'Sorry, no response received.';

      // Replace "Thinking..." with the actual response
      thinkingMessage.textContent = botResponse;
      
      // Add bot response to history
      conversationHistory.push({ role: 'model', content: botResponse });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'Failed to get response from server.';
      // Update the message on error
      thinkingMessage.textContent = errorMessage;
      // Add error message to history to avoid losing user's message context
      conversationHistory.push({ role: 'model', content: errorMessage });
    }
  });

  function appendMessage(role, content) {
    const messageElement = document.createElement('div');
    // Use 'user' and 'model' classes for styling
    messageElement.classList.add('message', role);
    messageElement.textContent = content;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    return messageElement;
  }
});