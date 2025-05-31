# 📝 Real-Time Collaborative Text Editor

A React-based real-time collaborative text editor with:

- 🔐 User login system
- 🔄 Real-time syncing across browser tabs
- 💾 Save & load functionality using `localStorage`
- ✍️ Rich text formatting (Bold, Italic, Text Color)
- 👤 Tracks the last user who edited the content

---

## 🚀 Features

- **Multi-user login**: Choose from predefined users (`alice`, `bob`, `charlie`)
- **Collaborative editing**: Changes made in one tab reflect in all open tabs using `BroadcastChannel`
- **Text formatting**: Use Bold, Italic, and text color styling
- **Persistent storage**: Edited content and last editor info are saved in browser's `localStorage`
- **Editor UI**: Simple and clean interface with live edit feedback

---

## 👤 Demo Users

Use one of the following users to log in:

| Username | Password | Color     |
|----------|----------|-----------|
| `alice`  | `123`    | 🔴 Red     |
| `bob`    | `456`    | 🔵 Blue    |
| `charlie`| `789`    | 🟢 Green   |

---

## 📦 Installation

1. **Clone the repo**

```bash
git clone https://github.com/your-username/realtime-editor.git
cd realtime-editor
