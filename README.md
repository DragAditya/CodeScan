# CodeScan 2.0

![CodeScan Banner](https://raw.githubusercontent.com/DragAditya/CodeScan/main/assets/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0-blue.svg)](https://github.com/DragAditya/CodeScan)
[![Tech Stack](https://img.shields.io/badge/Tech-HTML%2FCSS%2FJS-orange)](https://developer.mozilla.org/en-US/docs/Web)
[![AI Powered](https://img.shields.io/badge/AI-Gemini_Flash-purple)](https://ai.google.dev/models/gemini)

**Your complete AI-powered debugging assistant for single files and entire projects.**

CodeScan 2.0 is an intelligent web-based tool designed to help developers identify, understand, and fix issues in their code with the power of AI. From single-file analysis to comprehensive project scans, CodeScan provides actionable insights and even offers a "Jarvis" AI chat assistant for interactive debugging.

## 🚀 Overview

CodeScan 2.0 is a robust, client-side web application that leverages advanced AI models (Google Gemini) to provide in-depth code analysis. It goes beyond simple linting by understanding the context and suggesting best practices, security fixes, and performance improvements. Whether you're working on a small script or a multi-file project, CodeScan aims to streamline your debugging and code review process.

**Key Value Proposition:**
*   **AI-Driven Accuracy:** Get intelligent, context-aware suggestions powered by Google Gemini.
*   **Comprehensive Analysis:** Scan individual files or entire project folders for a holistic view of your codebase's health.
*   **Interactive Assistance:** Engage with the "Jarvis" AI chat for deeper understanding and personalized help.
*   **Actionable Fixes:** Receive not just issue descriptions, but also concrete code snippets for immediate implementation.
*   **User-Friendly Interface:** A clean, intuitive UI with features like theme toggling, language auto-detection, and visual severity charts.

## ✨ Features

CodeScan 2.0 comes packed with features to enhance your coding workflow:

### Core Analysis Capabilities
*   **Auto Language Detection:** Automatically identifies the programming language of your code (supports Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, Shell, HTML, CSS, and more).
*   **Single File Analysis:** Paste individual code snippets for quick, targeted debugging.
*   **Full Project Folder Scanning:** Upload entire project directories (via drag-and-drop or file browser) for a complete codebase audit.
*   **Project Requirement Detection:** Automatically identifies common project types (e.g., Node.js, Python) and lists dependencies/requirements.
*   **Severity-Based Issue Reporting:** Issues are categorized by High, Medium, and Low severity for easy prioritization.
*   **Detailed Explanations & Fixes:** Each issue comes with a clear explanation, a proposed fix, and code snippets for both the original problem and the corrected version.
*   **Fixed Project ZIP Download:** After a project scan, download a ZIP archive of your project with all suggested fixes applied.

### Interactive AI Assistant
*   **Jarvis AI Chat Assistant:** An integrated chat interface allows you to ask follow-up questions about identified issues, explore alternative solutions, or get general coding advice from the AI.

### User Interface & Experience
*   **Dark/Light Theme Toggle:** Switch between themes for comfortable viewing in any environment.
*   **Interactive Severity Chart:** A visual doughnut chart provides an at-a-glance overview of issue distribution by severity.
*   **Line Numbers:** Integrated line numbering in the code editor for easy navigation.
*   **API Key Management:** Securely manage your Google Gemini API key directly within the application.
*   **Copy & Clear Actions:** Convenient buttons to copy analyzed code or clear the editor.
*   **Progress Indicators:** Visual feedback during AI analysis and project scanning.
*   **Toast Notifications:** Non-intrusive messages for user feedback.

### Development & Extensibility
*   **Learning Mode (Experimental):** A toggle to potentially enhance AI explanations for educational purposes.

## 🛠️ Tech Stack

CodeScan 2.0 is built using modern web technologies and integrates with powerful AI services:

*   **Frontend:**
    *   **HTML5:** Structure of the web application.
    *   **CSS3:** Styling and responsive design.
    *   **JavaScript (ES6+):** Core logic, UI interactions, and API communication.
*   **Charting:**
    *   **Chart.js:** For rendering interactive severity charts.
*   **AI/Backend:**
    *   **Google Gemini API (Flash Model):** The core AI engine for code analysis, issue detection, and fix generation.
*   **File Handling:**
    *   **JSZip (Implicit):** Likely used for creating and downloading the fixed project ZIP files.
*   **Icons:**
    *   **Heroicons (Implicit):** Used for various UI icons (e.g., theme toggle).

## 🏗️ Architecture

CodeScan 2.0 operates as a **client-side single-page application (SPA)**.

*   **User Interface (HTML, CSS, JavaScript):** The entire application runs in the user's web browser. `index.html` provides the structure, `style.css` handles the aesthetics, and `script.js` contains all the application logic.
*   **State Management:** A global `state` object in `script.js` manages all application data, including theme, active tab, code content, detected issues, project files, and chat history.
*   **DOM Manipulation:** The `dom` object provides cached references to frequently accessed DOM elements, optimizing UI updates.
*   **Language Detection:** Client-side JavaScript functions (`detectLangFromCode`, `detectLangFromExt`) intelligently determine the programming language based on file extension and code patterns.
*   **AI Integration:** All heavy-lifting AI analysis is offloaded to the **Google Gemini API**. The `gemini` function in `script.js` handles API requests and responses. The API key is stored locally in the browser's `localStorage` and sent directly from the client to Google's API endpoints.
*   **No Backend Server:** CodeScan does not require a dedicated backend server for its operation, making it highly portable and easy to deploy.

```
+-------------------+
|     User Browser  |
|                   |
| +-----------------+-----------------+
| | index.html      | style.css       |
| | (Structure)     | (Styling)       |
| +-----------------+-----------------+
| | script.js (Application Logic)     |
| |   - State Management              |
| |   - DOM Manipulation              |
| |   - Language Detection            |
| |   - File/Folder Upload & Parsing  |
| |   - Issue Rendering & Charting    |
| |   - Chat Interface                |
| +--------+--------------------------+
|          |
|          | (HTTPS API Calls)
|          v
| +---------------------------------+
| | Google Gemini API               |
| | (Code Analysis, Fix Generation) |
| +---------------------------------+
```

## 🏁 Getting Started

Follow these steps to get CodeScan 2.0 up and running on your local machine.

### Prerequisites

*   **Web Browser:** A modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, etc.)
*   **Google Gemini API Key:** You will need an API key from Google AI Studio to use the analysis features.
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate your API key.

### Installation

CodeScan 2.0 is a client-side application and does not require a complex installation process.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DragAditya/CodeScan.git
    cd CodeScan
    ```
2.  **Open in your browser:**
    Simply open the `index.html` file in your preferred web browser.
    ```bash
    # On macOS
    open index.html
    # On Windows
    start index.html
    # On Linux
    xdg-open index.html
    ```
    Alternatively, you can serve it with a simple local HTTP server (e.g., `npx serve` or Python's `http.server` module) if you encounter any browser security restrictions related to local file access, though it should generally work directly.

### Configuration

The only configuration required is your Google Gemini API key.

1.  **Enter API Key:**
    *   On the CodeScan interface, locate the "API Key" input field (usually at the top of the page).
    *   Paste your Google Gemini API key into this field.
    *   The key will be saved locally in your browser's `localStorage` for future sessions. You can toggle its visibility using the eye icon.

## 🚀 Usage

CodeScan offers two primary modes of operation: **Single File Analysis** and **Project Folder Analysis**, along with an interactive **Jarvis AI Chat**.

### 1. Single File Analysis (Default Tab)

This mode is ideal for quickly checking code snippets or individual files.

1.  **Paste Your Code:** Enter or paste your code into the large code editor area.
2.  **Select Language (Optional):**
    *   By default, "Auto-detect" is selected. CodeScan will attempt to identify the language.
    *   You can manually select a language from the dropdown if auto-detection is incorrect or for specific needs.
3.  **Provide Context (Optional):**
    *   Use the "Context" input field to give the AI more information about your code's purpose, environment, or specific areas you want it to focus on.
4.  **Analyze:** Click the **"Analyze Code"** button.
5.  **Review Results:**
    *   The right panel will display a summary of issues, categorized by severity (High, Medium, Low).
    *   An interactive doughnut chart visualizes the distribution of issues.
    *   Scroll down to see a detailed list of each issue, including its explanation, suggested fix, original snippet, and fixed snippet.
6.  **Copy Fixed Code:** Use the "Copy Fixed Code" button to copy the entire code with all suggested fixes applied.

### 2. Project Folder Analysis

This mode allows you to scan an entire directory of code files.

1.  **Switch to Project Tab:** Click on the **"Project Scan"** tab.
2.  **Upload Folder:**
    *   **Drag & Drop:** Drag your project folder directly into the designated "Drop Zone."
    *   **Browse:** Click the "Browse Folder" button to select your project directory.
3.  **Review Project Structure:**
    *   CodeScan will display a file tree of your uploaded project.
    *   It will attempt to detect the project type (e.g., Node.js, Python) and list any detected requirements/dependencies.
4.  **Scan All Files:** Click the **"Scan All Files"** button to initiate a comprehensive analysis of all supported files in your project.
    *   A progress bar will show the scanning status.
5.  **Navigate & Review:**
    *   Once scanned, you can click on individual files in the file tree to view their specific issues in the results panel.
    *   The results panel will show issues for the currently active file, similar to single-file analysis.
6.  **Download Fixed Project:** Click the **"Download Fixed Project"** button to get a ZIP archive of your entire project with all AI-suggested fixes applied to the respective files.

### 3. Jarvis AI Chat Assistant

The integrated chat allows for dynamic interaction with the AI.

1.  **Access Chat:** The chat panel is always visible on the right side of the interface.
2.  **Ask Questions:** Type your questions into the chat input field. You can ask about:
    *   Specific issues found in your code.
    *   Clarifications on fixes.
    *   General coding concepts related to your project.
    *   Alternative solutions or best practices.
3.  **Send Message:** Click the "Send" button or press Enter.
4.  **Clear Chat:** Use the "Clear Chat" button to reset the conversation history.

### Other UI Controls

*   **Theme Toggle:** Click the sun/moon icon in the header to switch between dark and light themes.
*   **Learning Mode:** Toggle the "Learning Mode" switch (if available) for potentially more verbose explanations from the AI.

## ⚙️ Development

CodeScan 2.0 is a straightforward web application. If you wish to contribute or modify it:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DragAditya/CodeScan.git
    cd CodeScan
    ```
2.  **Open in a Code Editor:**
    Open the `CodeScan` folder in your favorite code editor (e.g., VS Code).
3.  **Modify Files:**
    *   `index.html`: For structural changes or adding new UI elements.
    *   `style.css`: For styling adjustments or theme modifications.
    *   `script.js`: For all application logic, AI integration, and feature development.
4.  **Test Changes:**
    Simply refresh your browser tab where `index.html` is open to see your changes reflected. No build step is required.

### Code Structure Overview

*   **`state` object:** Centralized application state.
*   **`dom` object:** Caches DOM element references.
*   **`detectLangFromCode`, `detectLangFromExt`:** Language detection logic.
*   **`gemini` function:** Handles communication with the Google Gemini API.
*   **`analysisPrompt`:** Generates the structured prompt for code analysis.
*   **`renderChart`:** Manages the Chart.js instance for severity visualization.
*   **Event Listeners:** Most UI interactions are handled via event listeners attached to DOM elements.

## 🚀 Deployment

Since CodeScan 2.0 is a purely client-side application, deployment is incredibly simple:

1.  **Static Hosting:** Upload the entire `CodeScan` folder (containing `index.html`, `script.js`, `style.css`, and any other assets) to any static web hosting service.
    *   **GitHub Pages:** Push your code to a GitHub repository and enable GitHub Pages.
    *   **Netlify:** Drag and drop your folder or connect your GitHub repo.
    *   **Vercel:** Similar to Netlify, easy deployment from Git.
    *   **Amazon S3 + CloudFront:** For robust, scalable static hosting.
    *   **Any web server:** Simply place the files in a directory served by Apache, Nginx, etc.

No server-side configuration or database is required.

## 🤝 Contributing

We welcome contributions to CodeScan 2.0! If you have ideas for new features, bug fixes, or improvements, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch:** `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Make your changes:** Implement your feature or fix.
4.  **Commit your changes:** `git commit -m "feat: Add new feature"`.
5.  **Push to your fork:** `git push origin feature/your-feature-name`.
6.  **Open a Pull Request:** Submit a pull request to the `main` branch of the original repository, describing your changes in detail.

Please ensure your code adheres to the existing style and conventions.

## ⁉️ Troubleshooting

*   **"API Error" / "Invalid API Key":**
    *   Ensure your Google Gemini API key is correctly entered in the input field.
    *   Verify that your API key is active and has not exceeded its usage limits on the Google AI Studio dashboard.
    *   Check your browser's developer console for more specific error messages from the Gemini API.
*   **"No JSON array in response" / Analysis fails:**
    *   This usually means the AI response was malformed or didn't contain the expected JSON structure. Try re-running the analysis.
    *   Ensure your prompt (code + context) is clear and doesn't confuse the AI.
    *   If the issue persists, it might be a temporary API issue or a prompt engineering problem.
*   **File Upload Issues (Project Scan):**
    *   Ensure your browser supports the File System Access API (most modern browsers do).
    *   Try using the "Browse Folder" button instead of drag-and-drop if you encounter issues.
*   **UI Glitches:**
    *   Try clearing your browser cache and refreshing the page.
    *   Ensure your browser is up-to-date.

## 🗺️ Roadmap

CodeScan 2.0 is an ongoing project. Here are some potential future enhancements:

*   **More Advanced AI Models:** Integration with other or newer Gemini models for even deeper analysis.
*   **Customizable Rules:** Allow users to define custom code analysis rules.
*   **IDE Integrations:** Plugins or extensions for popular IDEs (VS Code, IntelliJ).
*   **Pre-commit Hooks:** Integrate with Git hooks for automated analysis before commits.
*   **More Project Types:** Enhanced detection and analysis for additional programming language ecosystems.
*   **Performance Benchmarking:** AI-driven suggestions for code performance improvements.
*   **Accessibility Improvements:** Further enhancements for users with disabilities.

## 📄 License & Credits

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.

**Credits:**

*   **DragAditya:** Original author and maintainer.
*   **Google Gemini:** For providing the powerful AI capabilities.
*   **Chart.js:** For the interactive data visualization.
*   **Heroicons:** For the beautiful SVG icons.