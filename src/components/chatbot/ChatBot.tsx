// import axios from "axios";
import { FormEvent, useState } from "react";
const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //   const res = await axios.post("", { message });
      //   console.log(res);
      //   setResponse(res.data.response);
      setResponse(message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div>ChatBotComponent</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
      <div>{response}</div>
    </>
  );
};

export default ChatBot;
