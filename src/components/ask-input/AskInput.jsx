import { useState, useEffect, useRef } from 'react'
import './ask-input.css';
import { FaArrowUp } from 'react-icons/fa';
const API_URL = import.meta.env.VITE_LLM_API;

function renderBotMessage(content) {
    // Split into lines
    const lines = content.split(/\r?\n/);
    const elements = [];
    let listItems = [];
    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Bullet list
        if (/^([*-])\s+/.test(trimmed)) {
            listItems.push(trimmed.replace(/^([*-])\s+/, ''));
        } else {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={'ul-' + idx}>
                        {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
                    </ul>
                );
                listItems = [];
            }
            if (trimmed.length > 0) {
                elements.push(<div key={idx}>{parseInline(trimmed)}</div>);
            }
        }
    });
    if (listItems.length > 0) {
        elements.push(
            <ul key={'ul-last'}>
                {listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
            </ul>
        );
    }
    return elements;
}

function parseInline(text) {
    // Bold: **text**
    let parts = [];
    let lastIdx = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    let idx = 0;
    while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
            parts.push(text.slice(lastIdx, match.index));
        }
        parts.push(<strong key={'b' + idx}>{match[1]}</strong>);
        lastIdx = match.index + match[0].length;
        idx++;
    }
    if (lastIdx < text.length) {
        parts.push(text.slice(lastIdx));
    }
    // Links: http(s)://...
    parts = parts.flatMap((part, i) => {
        if (typeof part !== 'string') return part;
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const segments = [];
        let last = 0;
        let m;
        let segIdx = 0;
        while ((m = linkRegex.exec(part)) !== null) {
            if (m.index > last) segments.push(part.slice(last, m.index));
            segments.push(<a key={'a' + i + segIdx} href={m[1]} target="_blank" rel="noopener noreferrer">{m[1]}</a>);
            last = m.index + m[1].length;
            segIdx++;
        }
        if (last < part.length) segments.push(part.slice(last));
        return segments;
    });
    return parts;
}

export default function AskInput() {
    const [userPrompt, setUserPrompt] = useState('');
    const [chat, setChat] = useState([
        { role: 'bot', content: 'Hi! How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userPrompt.trim()) return;
        const prompt = userPrompt;
        setChat(prev => [...prev, { role: 'user', content: prompt }]);
        setUserPrompt('');
        setIsLoading(true);
        fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.text();
            })
            .then(text => text ? JSON.parse(text) : {})
            .then(data => {
                setChat(prev => [...prev, { role: 'bot', content: data.reply }]);
            })
            .catch(err => {
                setChat(prev => [...prev, { role: 'bot', content: 'Error: ' + err.message }]);
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <div className='askInputBox'>
            <h1>Ask Bro...</h1>
            <div className="chatArea">
                {chat.map((msg, idx) => (
                    <div key={idx} className={`chatBubble ${msg.role}`}>{
                        msg.role === 'bot' ? renderBotMessage(msg.content) : msg.content
                    }</div>
                ))}
                {isLoading && <div className="chatBubble bot loading">...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="askBox">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userPrompt}
                        onChange={e => setUserPrompt(e.target.value)}
                        placeholder='Ask bro..'
                        disabled={isLoading}
                    />
                    <button type='submit' className="arrow-button" disabled={isLoading || !userPrompt.trim()}>
                        <FaArrowUp />
                    </button>
                </form>
            </div>
        </div>
    )
}
