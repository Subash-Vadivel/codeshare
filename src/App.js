import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Popup from "reactjs-popup";
import io from "socket.io-client";
import "reactjs-popup/dist/index.css";
import "./App.css";
const socket = io("http://localhost:8000");
const files = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: "let a = 1;",
  },
  "script.py": {
    name: "script.py",
    language: "python",
    value: "a = 1",
  },
  "script.java": {
    name: "script.java",
    language: "java",
    value:
      "public class Main {\n    public static void main(String[] args) {\n        int a = 1;\n    }\n}",
  },
  "script.rb": {
    name: "script.rb",
    language: "ruby",
    value: "a = 1",
  },
  "script.cpp": {
    name: "script.cpp",
    language: "cpp",
    value:
      "#include <iostream>\n\nint main() {\n    int a = 1;\n    std::cout << a << std::endl;\n    return 0;\n}",
  },
  "script.ts": {
    name: "script.ts",
    language: "typescript",
    value: "let a: number = 1;",
  },
  "script.c": {
    name: "script.c",
    language: "c",
    value:
      '#include <stdio.h>\n\nint main() {\n    int a = 1;\n    printf("%d\\n", a);\n    return 0;\n}',
  },
};

const languageOptions = Object.keys(files).map((fileName) => ({
  label: files[fileName].language,
  value: fileName,
}));

const themeOptions = [
  { label: "Light", value: "vs" },
  { label: "Dark", value: "vs-dark" },
];

function App() {
  const [userid, setuserid] = useState("");
  const [roomId, setRoomId] = useState("");
  const [jroomId, setjRoomId] = useState("");
  const [jroomstatus, setjroomstatus] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [ch, setCh] = useState(1);
  const [msg, setmsg] = useState("");
  const [members, setmembers] = useState([]);
  const [fileName, setFileName] = useState("script.c");
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("vs");
  const [code, setCode] = useState(files[fileName].value);
  const file = files[fileName];
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    socket.on("newuserid", (value) => {
      setuserid(value);
    });
    socket.on("updatecode", (value) => {
      setCode(value);
    });
    socket.on("quitdone", () => {
      setRoomId("");
      setjRoomId("");
      setjroomstatus("");
    });
    socket.on("roomno", (roomid) => {
      console.log("working");
      setRoomId(roomid);
    });
    socket.on("roomnotfounderror", () => {
      setjRoomId("-1");
      setjroomstatus("Room Not Found !!");
    });

    socket.on("roomfull", () => {
      setjRoomId("-1");
      setjroomstatus("Room Full (Maximum 5 Members Reached)");
    });
    socket.on("joined", (newroom) => {
      setRoomId(newroom);
      setjroomstatus("Joined the room ");
    });
    socket.on("members", (memberslist) => {
      setmembers(memberslist);
    });
    socket.on("output", (data) => {
      setOutput(data.output);
    });
    socket.on("runtimeerror", () => {
      setOutput("Some Thing Went Wrong Try Again");
    });
    socket.on("input", (value) => {
      setUserInput(value);
    });
    socket.on("language", (value) => {
      setFileName(value);
    });
    socket.on("message", (value) => {
      setMessages(value);
    });
  }, []);
  function sendmessage(event) {
    event.preventDefault();
    if (msg === "") {
      return;
    }
    const newMessage = { sender: userid, content: msg };
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      socket.emit("messagechange", updatedMessages);
      return updatedMessages;
    });
    socket.emit("messagechange", messages);
    setmsg("");
  }

  function handleInputChange(event) {
    socket.emit("inputchange", event.target.value);
    setUserInput(event.target.value);
  }
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }
  function handleLanguageChange(e) {
    socket.emit("languagechange", e.target.value);
    setFileName(e.target.value);
  }

  function handleThemeChange(e) {
    setTheme(e.target.value);
  }

  const handleRun = async (e) => {
    e.preventDefault();
    socket.emit("run", file.language, code, userInput == "" ? null : userInput);
  };
  const handleEditorChange = (value, event) => {
    // Handle editor value change
    socket.emit("codechange", value, roomId);
    setCode(value);
  };

  const handleroomsearch = (e) => {
    e.preventDefault();
    socket.emit("join", jroomId);
  };

  return (
    <>
      <div className="app-container">
        <Popup
          open={isOpen}
          onClose={() => setIsOpen(false)}
          position="right center"
        >
          <div className="popup-theme">
            <div className="options">
              <button onClick={() => setCh(1)}>Join</button>
              <button
                onClick={() => {
                  if (roomId == null || roomId == "") socket.emit("createroom");
                  setCh(2);
                }}
              >
                Invite
              </button>
              <button onClick={() => setCh(3)}>Members</button>
              <button onClick={() => setCh(4)}>Chat</button>
            </div>
            <div className="content">
              {ch === 1 ? (
                <div className="join-form">
                  {jroomstatus === "1" || jroomstatus === "" ? (
                    <form onSubmit={handleroomsearch}>
                      <input
                        type="text"
                        value={jroomId}
                        onChange={(e) => setjRoomId(e.target.value)}
                        placeholder="Enter 6-digit Room ID"
                        maxLength={6}
                        required
                      />
                      {jroomstatus}
                      <button type="submit">Join</button>
                    </form>
                  ) : (
                    <>
                      <p>{jroomstatus}</p>
                      {jroomId !== "-1" ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            socket.emit("quit");
                          }}
                        >
                          Quit
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setjroomstatus("");
                            setjRoomId("");
                          }}
                        >
                          Retry
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : ch === 2 ? (
                <div className="room-info">
                  <p className="room-id">{roomId}</p>
                  <p className="room-desc">Share this code to join the room</p>
                </div>
              ) : ch === 3 ? (
                <div className="members-list">
                  <h2>Members</h2>
                  <ul>
                    {members.map((member, index) => (
                      <li key={index} className="member-item">
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : ch === 4 ? (
                <div className="group-chat">
                  <div className="messages-container">
                    <div className="messages">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`message ${
                            message.sender === userid
                              ? "sent-message"
                              : "received-message"
                          }`}
                        >
                          <div className="message-content">
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form className="message-input">
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => setmsg(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <button
                      type="submit"
                      onClick={sendmessage}
                      className="send-button"
                    >
                      Send
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </Popup>

        <header className="header">
          <h1 className="app-name">Code Share</h1>
          <div className="dropdowns">
            <button className="run-button" onClick={() => setIsOpen(true)}>
              Co-Lab
            </button>
            <button className="run-button" onClick={handleRun}>
              Run
            </button>
            <div className="language-dropdown">
              <select value={fileName} onChange={handleLanguageChange}>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="theme-dropdown">
              <select value={theme} onChange={handleThemeChange}>
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <div className="editor-container">
          <Editor
            height="calc(100vh - 70px)" // Subtract the header height from the viewport height
            width="100%"
            theme={theme}
            onMount={handleEditorDidMount}
            path={file.name}
            defaultLanguage={file.language}
            value={code}
            onChange={handleEditorChange}
          />
        </div>
        <div className="output-container">
          <div className="input">
            <p>Input</p>
            <textarea
              value={userInput}
              onChange={handleInputChange}
              className="input-textarea"
              style={{ resize: "none" }}
            />
          </div>
          <div className="output">
            <p>Output</p>
            <textarea
              value={output}
              readOnly
              className="output-textarea"
              style={{ resize: "none" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;