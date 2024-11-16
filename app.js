const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Replace with your OpenAI API compatible endpoint
        const response = await axios.post('https://0x70f7c1c765fa59c1a96466b69e72b94b1d449cd2.gaianet.network/v1/chat/completions', {
            messages: [
                {
                    role: 'system',
                    content: "You are a Reddit moderator who analyzes posts and comments by always displaying Title, Subreddit, Text, and Hashtags when available, checks for similar content in the knowledge base, and provides moderation decisions (APPROVED/REJECTED) with clear reasoning, marking any missing elements as 'N/A'."
                },
                {
                    role: 'user',
                    content: message
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json({ response: response.data.choices[0].message.content });

        //if reponse include tool calls, send them to the tool call endpoint
        if (response.data.choices[0].message.content.includes('```json')) {

            //interact with smart contract function
            
            const toolCallResponse = await axios.post('https://0x70f7c1c765fa59c1a96466b69e72b94b1d449cd2.gaianet.network/v1/tool/calls', {
                response: response.data.choices[0].message.content
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
        
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});