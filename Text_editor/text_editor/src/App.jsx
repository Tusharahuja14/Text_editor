import React, { useEffect, useRef, useState } from "react";

const channel = new BroadcastChannel("realtime-editor");

const USERS = [
  { username: "alice", password: "123", color: "#ef4444" },
  { username: "bob", password: "456", color: "#3b82f6" },
  { username: "charlie", password: "789", color: "#22c55e" },
];

function App() {
  const [username, setUsername] = useState("");
  const [userColor, setUserColor] = useState("#000");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState("");
  const [lastEditor, setLastEditor] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const editorRef = useRef(null);

  // On mount: try load logged in user & saved content
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      const u = USERS.find((u) => u.username === storedUser);
      if (u) {
        setUsername(u.username);
        setUserColor(u.color);
        setLoggedIn(true);
      }
    }

    const saved = localStorage.getItem("savedContent");
    if (saved) {
      const parsed = JSON.parse(saved);
      setContent(parsed.content);
      setLastEditor(parsed.lastEditor);
      if (editorRef.current) editorRef.current.innerHTML = parsed.content;
    }

    // Listen to BroadcastChannel updates from other tabs
    channel.onmessage = (event) => {
      const { username: sender, content: newContent } = event.data;
      if (sender !== username) {
        setContent(newContent);
        setLastEditor(sender);
        localStorage.setItem(
          "savedContent",
          JSON.stringify({ content: newContent, lastEditor: sender })
        );
        if (editorRef.current) editorRef.current.innerHTML = newContent;
      }
    };

    return () => {
      channel.close();
    };
  }, [username]);

  // Sync editor content if state changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // On user input: save content and broadcast
  const onInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    setLastEditor(username);
    localStorage.setItem(
      "savedContent",
      JSON.stringify({ content: html, lastEditor: username })
    );
    channel.postMessage({ username, content: html });
  };

  // Format text (bold, italic)
  const formatText = (command) => {
    document.execCommand(command, false, null);
    const html = editorRef.current.innerHTML;
    setContent(html);
    setLastEditor(username);
    localStorage.setItem(
      "savedContent",
      JSON.stringify({ content: html, lastEditor: username })
    );
    channel.postMessage({ username, content: html });
  };

  // Apply text color
  const applyTextColor = (color) => {
    document.execCommand("foreColor", false, color);
    const html = editorRef.current.innerHTML;
    setTextColor(color);
    setContent(html);
    setLastEditor(username);
    localStorage.setItem(
      "savedContent",
      JSON.stringify({ content: html, lastEditor: username })
    );
    channel.postMessage({ username, content: html });
  };

  // Load saved content on demand and show it
  const loadSavedContent = () => {
    const saved = localStorage.getItem("savedContent");
    if (saved) {
      const parsed = JSON.parse(saved);
      setContent(parsed.content);
      setLastEditor(parsed.lastEditor);
      if (editorRef.current) editorRef.current.innerHTML = parsed.content;
      channel.postMessage({ username, content: parsed.content });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setLoggedIn(false);
    setUsername("");
    setContent("");
    setLastEditor("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = e.target.username.value.trim();
    const pass = e.target.password.value;
    const validUser = USERS.find(
      (u) => u.username === user && u.password === pass
    );
    if (validUser) {
      localStorage.setItem("username", user);
      setUsername(user);
      setUserColor(validUser.color);
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div className="app-container">
        <style>{basicStyles}</style>
        <h1>🔐 Login to Collaborative Editor</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input name="username" placeholder="Username" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        <p>
          Try: <code>alice/123</code>, <code>bob/456</code>,{" "}
          <code>charlie/789</code>
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <style>{basicStyles}</style>
      <h1>📝 Real-Time Collaborative Editor</h1>
      <p>
        Editing as <span style={{ color: userColor }}>{username}</span>{" "}
        <button onClick={handleLogout}>Logout</button>
      </p>
      <div className="toolbar">
        <button onClick={loadSavedContent}>📂 Load Saved</button>
        <button onClick={() => formatText("bold")}>
          <b>B</b>
        </button>
        <button onClick={() => formatText("italic")}>
          <i>I</i>
        </button>
        <input
          type="color"
          value={textColor}
          onChange={(e) => applyTextColor(e.target.value)}
          title="Change Text Color"
        />
        {lastEditor && (
          <span style={{ marginLeft: 10 }}>
            Last edited by <b>{lastEditor}</b>
          </span>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={onInput}
        spellCheck={false}
        suppressContentEditableWarning={true}
        className="editor"
        style={{
          minHeight: 200,
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 4,
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
}

const basicStyles = `
  .app-container {
    max-width: 600px;
    margin: 40px auto;
    font-family: sans-serif;
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  input {
    padding: 8px;
    font-size: 16px;
  }
  button {
    padding: 6px 10px;
    font-size: 16px;
    cursor: pointer;
    margin-right: 5px;
  }
  .toolbar {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export default App;
