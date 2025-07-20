import { useState, useEffect } from 'react'
import './ask-input.css';
import { FaArrowUp } from 'react-icons/fa';

export default function AskInput() {
    const [input, setInput] = useState('');
    const [animatedText, setAnimatedText] = useState('');
    const [botResponse, setBotResponse] = useState('');
    const [userPrompt, setUserPrompt] = useState('');

    // Animate the heading once
    useEffect(() => {
        const hOneSplit = 'Ask Bro...'.split('');
        let arr = [];
        let i = 0;
        const timeIn = setInterval(() => {
            arr.push(hOneSplit[i]);
            i += 1;
            setAnimatedText(arr.join(''));
            if (arr.length === hOneSplit.length) {
                clearInterval(timeIn);
            }
        }, 100);
        return () => clearInterval(timeIn);
    }, []);

    // Animate the bot response when it changes
    useEffect(() => {
        if (!botResponse) {
            setInput('');
            setAnimatedText('')
            return;
        }
        const inputSplit = botResponse.split('');
        let inputArr = [];
        let i = 0;
        const timeInArr = setInterval(() => {
            inputArr.push(inputSplit[i]);
            i += 1;
            setInput(inputArr.join(''));
            if (inputArr.length === inputSplit.length) {
                clearInterval(timeInArr);
            }
        }, 30);
        setAnimatedText('');
        return () => clearInterval(timeInArr);
    }, [botResponse]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const callAskApi = async () => {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: userPrompt
                })
            });
            const data = await response.json();
            setBotResponse(data.reply);
            setUserPrompt('');
        }
        callAskApi();
    }

    return (
        <div className='askInputBox'>
            <h1>{animatedText}</h1>
            <div className="botResponse">
                <p>{input}</p>
            </div>
            <div className="askBox">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userPrompt}
                        onChange={e => setUserPrompt(e.target.value)}
                        placeholder='Ask bro..'
                    />
                    <button type='submit' className="arrow-button">
                        <FaArrowUp />
                    </button>
                </form>
            </div>
        </div>
    )
}
