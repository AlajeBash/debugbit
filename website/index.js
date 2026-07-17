document.addEventListener("DOMContentLoaded", () => {
    const simulateBtn = document.getElementById("simulateBtn");
    const logStream = document.getElementById("logStream");
    const scanOverlay = document.getElementById("scanOverlay");
    const scanText = document.getElementById("scanText");
    const reportContent = document.getElementById("reportContent");

    // Check if elements exist
    if (!simulateBtn || !logStream || !scanOverlay || !scanText || !reportContent) return;

    // Standard Mock Data for the Terminal Logs
    const mockLogs = [
        { level: "warn", text: "API endpoint latency exceeded 1500ms", time: "20:05:12", badge: "WARN" },
        { level: "error", text: "POST https://api.debugbit.com/v1/auth - 500 Internal Server Error", time: "20:05:13", badge: "FAIL" },
        { level: "critical", text: "TypeError: Cannot read properties of undefined (reading 'split')", time: "20:05:13", badge: "CRASH" }
    ];

    // Standard Mock AI Report Markdown Output
    const mockReportMarkdown = `
# 🔍 Root Cause Analysis

### 🚨 What Happened
A critical client-side unhandled exception occurred when attempting to read the property \`split\` from an \`undefined\` reference. This directly crashed the current session's rendering execution context.

### 💀 Why It Failed
The failure cascade was triggered by a **500 Internal Server Error** on the authentication endpoint (\`https://api.debugbit.com/v1/auth\`). 
The frontend login handler expected a JSON response containing an \`authorizedScopes\` string (to run a \`.split(",")\` parse on), but because the server crashed, the response payload was empty. The variables passed into the parser defaulted to \`undefined\`, crashing the thread.

---

# 🛠️ Actionable Code Fix

### 💡 Suggested Fix
Incorporate safe optional chaining and default fallback parameters inside your log parser to ensure that if variables are empty or missing, execution defaults gracefully instead of interrupting browser operations.

### 💻 Code Modification
\`\`\`javascript
// ❌ BEFORE
const scopes = response.scopes.split(",");

// 💎 AFTER (SAFE RESILIENT FIX)
const scopes = (response?.scopes || "").split(",");
\`\`\`

---

# 🛡️ Prevention Recommendations
*   **Response Schema Validation**: Run schema validity sweeps on incoming API data before compiling operations.
*   **Fail-Safe Interceptors**: Setup axios/fetch interceptors to catch 500 status codes globally and halt component rendering early.
`;

    simulateBtn.addEventListener("click", () => {
        // Step 1: Clear the terminal empty state
        logStream.innerHTML = "";
        simulateBtn.style.display = "none";

        // Step 2: Sequential log generation
        let currentLogIndex = 0;
        
        function appendNextLog() {
            if (currentLogIndex < mockLogs.length) {
                const log = mockLogs[currentLogIndex];
                const logRow = document.createElement("div");
                logRow.className = `terminal-log-row timeline-log ${log.level}`;
                
                logRow.innerHTML = `
                    <span class="log-time">[${log.time}]</span>
                    <span class="log-badge ${log.level}">${log.badge}</span>
                    <span class="log-text">${log.text}</span>
                `;
                
                logStream.appendChild(logRow);
                logStream.scrollTop = logStream.scrollHeight;
                currentLogIndex++;
                setTimeout(appendNextLog, 600);
            } else {
                // Step 3: Trigger the AI Scanner sweep
                triggerAIScan();
            }
        }

        appendNextLog();
    });

    function triggerAIScan() {
        // Unhide scanner items
        const scanLine = scanOverlay.querySelector(".scan-line");
        const scanSpinner = scanOverlay.querySelector(".scan-spinner");
        
        if (scanLine) scanLine.style.display = "block";
        if (scanSpinner) scanSpinner.classList.add("animating");

        const statusTexts = [
            "Parsing client-side exception trace...",
            "Correlating chronological timelines...",
            "Encrypting rest gateway payloads...",
            "Querying Gemini 2.5 Flash via serverless POST..."
        ];

        let statusIndex = 0;
        
        function updateStatus() {
            if (statusIndex < statusTexts.length) {
                scanText.textContent = statusTexts[statusIndex];
                statusIndex++;
                setTimeout(updateStatus, 800);
            } else {
                // Step 4: Display Markdown report with typing effect
                completeAIScan();
            }
        }

        updateStatus();
    }

    function completeAIScan() {
        // Fade out scan overlay
        scanOverlay.style.opacity = "0";
        setTimeout(() => {
            scanOverlay.style.display = "none";
            // Print typewriter markdown
            typewriterPrint(reportContent, mockReportMarkdown);
        }, 400);
    }

    function typewriterPrint(container, markdownText) {
        container.innerHTML = "";
        
        // Formats Markdown structure dynamically into basic HTML tags for display
        const htmlFormatted = markdownText
            .replace(/# 🔍 (.*)/g, "<h2>🔍 $1</h2>")
            .replace(/# 🛠️ (.*)/g, "<h2>🛠️ $1</h2>")
            .replace(/# 🛡️ (.*)/g, "<h2>🛡️ $1</h2>")
            .replace(/### 🚨 (.*)/g, "<h3>🚨 $1</h3>")
            .replace(/### 💀 (.*)/g, "<h3>💀 $1</h3>")
            .replace(/### 💡 (.*)/g, "<h3>💡 $1</h3>")
            .replace(/### 💻 (.*)/g, "<h3>💻 $1</h3>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/`(.*?)`/g, "<code>$1</code>")
            .replace(/\* (.*)/g, "<li>$1</li>")
            .replace(/(\/\/ ❌ BEFORE[\s\S]*?\/\/ 💎 AFTER[\s\S]*?split\([^)]*\);)/g, "<span class='diff-block'>$1</span>")
            .split("\n");

        let lineIndex = 0;
        
        function typeLine() {
            if (lineIndex < htmlFormatted.length) {
                const line = htmlFormatted[lineIndex].trim();
                
                if (line) {
                    if (line.startsWith("<h2>") || line.startsWith("<h3>")) {
                        container.innerHTML += line;
                    } else if (line.startsWith("<li>")) {
                        // Ensure lists are nested in ul
                        let ul = container.querySelector("ul:last-of-type");
                        if (!ul) {
                            ul = document.createElement("ul");
                            container.appendChild(ul);
                        }
                        ul.innerHTML += line;
                    } else if (line.startsWith("<code>") || line.startsWith("//") || line.startsWith("const")) {
                        let pre = container.querySelector("pre");
                        if (!pre) {
                            pre = document.createElement("pre");
                            container.appendChild(pre);
                        }
                        
                        // Add highlighting to before/after code lines
                        if (line.includes("❌ BEFORE")) {
                            pre.innerHTML += `<span class="diff-del">${line}</span>\n`;
                        } else if (line.includes("💎 AFTER") || line.includes("SAFE RESILIENT")) {
                            pre.innerHTML += `<span class="diff-add">${line}</span>\n`;
                        } else {
                            pre.innerHTML += `${line}\n`;
                        }
                    } else {
                        container.innerHTML += `<p>${line}</p>`;
                    }
                }
                
                lineIndex++;
                // Typewriter line scroll follow-along
                const reportBox = document.getElementById("aiReportBox");
                if (reportBox) {
                    reportBox.scrollTop = reportBox.scrollHeight;
                }
                
                setTimeout(typeLine, 80);
            }
        }

        typeLine();
    }
});
