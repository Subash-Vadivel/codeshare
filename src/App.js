import { useRef, useState,useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import Popup from 'reactjs-popup';
import io from 'socket.io-client';
import 'reactjs-popup/dist/index.css';
import './App.css';
const socket=io('http://localhost:8000');
const files = {
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: "let a = 1;"
  },
  "script.py": {
    name: "script.py",
    language: "python",
    value: "a = 1"
  },
  "script.java": {
    name: "script.java",
    language: "java",
    value: "public class Main {\n    public static void main(String[] args) {\n        int a = 1;\n    }\n}"
  },
  "script.rb": {
    name: "script.rb",
    language: "ruby",
    value: "a = 1"
  },
  "script.cpp": {
    name: "script.cpp",
    language: "cpp",
    value: "#include <iostream>\n\nint main() {\n    int a = 1;\n    std::cout << a << std::endl;\n    return 0;\n}"
  },
  "script.ts": {
    name: "script.ts",
    language: "typescript",
    value: "let a: number = 1;"
  },
  "script.c": {
    name: "script.c",
    language: "c",
    value: "#include <stdio.h>\n\nint main() {\n    int a = 1;\n    printf(\"%d\\n\", a);\n    return 0;\n}"
  }
};

const languageOptions = Object.keys(files).map((fileName) => ({
  label: files[fileName].language,
  value: fileName,
}));

const themeOptions = [
  { label: 'Light', value: 'vs' },
  { label: 'Dark', value: 'vs-dark' },
];

function App() {

 
 const [roomId,setRoomId]=useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [code,setCode]=useState('');
  const [ch,setCh]=useState(1);

  const [fileName,setFileName]=useState("script.c");
  const editorRef=useRef(null);
  const [theme, setTheme] = useState('vs');

  const file=files[fileName];
  const [userInput, setUserInput] = useState('');
const [output, setOutput] = useState('');
  function handleInputChange(event) {
    setUserInput(event.target.value);
  }
  function handleEditorDidMount(editor,monaco)
  {
    editorRef.current=editor;
  }
  function handleLanguageChange(e) {
    setFileName(e.target.value);
  }
  
  function handleThemeChange(e) {
    setTheme(e.target.value);
  }

  const handleRun=async()=>{
         axios.post('http://localhost:5000/ourapi/compiler',{
          language:file.language=="python"?"python3":file.language,
          code:code,
          input:userInput==''?null:userInput
         }).then((res)=>{
          setOutput(res.data.output);
         }).catch((err)=>{
          setOutput("Some THing Went Wrong Try Again");
         })
  }
  const handleEditorChange = (value, event) => {
    // Handle editor value change
    setCode(value);
  };

  const handleroomsearch=()=>{

  }
  function popContent(){
    if(ch==1)
    {
        return <div className="join-form">
        <form onSubmit={handleroomsearch}>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter 6-digit Room ID"
            maxLength={6}
            required
          />
          <button type="submit">Join</button>
        </form>
      </div>
      
    }
    else if(ch==2)
    {
       return (
        <div className="room-info">
        <p className="room-id">{roomId}</p>
        <p className="room-desc">Share this code to join the room</p>
      </div>
       );
    }
  }
  
  return (
  <>

  <div className="app-container">

  <Popup open={isOpen} onClose={() => setIsOpen(false)} position="right center">
  <div className="popup-theme">
    <div className="options">
      <button onClick={()=>setCh(1)}>Join</button>
      <button onClick={()=>setCh(2)}>Invite</button>
      <button onClick={()=>setCh(3)}>Members</button>
      <button onClick={()=>setCh(4)}>Chat</button>


    </div>
    <div className="content">
              {popContent()}
    </div>
  </div>
</Popup>



      <header className="header">
        <h1 className="app-name">Code Share</h1>
        <div className="dropdowns">
          <button className="run-button" onClick={() => setIsOpen(true)} >Co-Lab</button>
          <button className="run-button" onClick={handleRun}>Run</button>
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
          defaultValue={file.value}
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
          style={{resize:"none"}}
        />
    
  </div>
  <div className="output">
    <p>Output</p>
    <textarea
          value={output}
          readOnly
          className="output-textarea"
          style={{resize:"none"}}
        />

  </div>
</div>
    </div>
  </>
  );
}

export default App;
