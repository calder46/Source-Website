(function () {
  if (window.__fasttrakAssistant) return;
  window.__fasttrakAssistant = true;

  const css = `
  .assistant-btn{margin-left:auto;margin-right:12px}
  .assistant-dialog{border:1px solid var(--plan-line,#c6cbd4);border-radius:14px;padding:0;width:min(440px,94vw);max-height:80vh;background:var(--plan-surface,#fff);color:var(--plan-text,#23262d);box-shadow:0 20px 50px #0004}
  .assistant-dialog::backdrop{background:var(--plan-overlay,#0009)}
  .assistant-inner{display:flex;flex-direction:column;height:min(560px,78vh)}
  .assistant-head{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--plan-line,#c6cbd4);font-weight:700}
  .assistant-close{background:none;border:none;font-size:20px;cursor:pointer;color:inherit}
  .assistant-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.45}
  .assistant-msg{padding:9px 12px;border-radius:10px;max-width:88%;white-space:pre-wrap;word-wrap:break-word}
  .assistant-msg.user{align-self:flex-end;background:var(--plan-blue,#096bdc);color:var(--plan-on-accent,#fff)}
  .assistant-msg.assistant{align-self:flex-start;background:var(--plan-band,#e9edf3)}
  .assistant-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--plan-line,#c6cbd4)}
  .assistant-form textarea{flex:1;resize:none;padding:9px;border-radius:8px;border:1px solid var(--plan-line,#c6cbd4);background:var(--plan-bg,#f3f5f8);color:inherit;font:inherit}
  .assistant-form button{padding:9px 16px}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const topbar = document.querySelector(".plan-topbar");
  if (!topbar) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-subtle assistant-btn";
  btn.textContent = "✦ Ask AI";
  btn.setAttribute("aria-haspopup", "dialog");
  const actions = topbar.querySelector(".account-actions");
  actions ? topbar.insertBefore(btn, actions) : topbar.appendChild(btn);

  const dlg = document.createElement("dialog");
  dlg.className = "assistant-dialog";
  dlg.setAttribute("aria-label", "FastTrak AI assistant");
  dlg.innerHTML = `<div class="assistant-inner">
    <div class="assistant-head"><span>FastTrak Assistant</span><button class="assistant-close" aria-label="Close">×</button></div>
    <div class="assistant-log" aria-live="polite"></div>
    <form class="assistant-form"><textarea rows="2" placeholder="Ask about courses, prerequisites, your plan…" aria-label="Message"></textarea><button class="btn btn-primary" type="submit">Send</button></form>
  </div>`;
  document.body.appendChild(dlg);

  const log = dlg.querySelector(".assistant-log");
  const form = dlg.querySelector("form");
  const input = dlg.querySelector("textarea");
  const sendBtn = form.querySelector("button");
  const history = [];

  function esc(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function md(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^#{1,6}\s*(.+)$/gm, "<strong>$1</strong>")
      .replace(/^\s*[-*]\s+/gm, "• ");
  }
  function add(role, text) {
    const d = document.createElement("div");
    d.className = "assistant-msg " + role;
    d.innerHTML = role === "assistant" ? md(text) : esc(text);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  add("assistant", "Hi! I can help with course search, prerequisites, scheduling and your degree plan. What do you need?");

  btn.addEventListener("click", () => { dlg.showModal(); input.focus(); });
  dlg.querySelector(".assistant-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = "";
    add("user", text);
    history.push({ role: "user", content: text });
    sendBtn.disabled = true;
    const pending = add("assistant", "Thinking…");
    try {
      const r = await fetch("/api/public/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Something went wrong.");
      pending.innerHTML = md(data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      pending.textContent = err.message || "Something went wrong.";
      history.pop();
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });
})();
