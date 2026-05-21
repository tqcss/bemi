import type { Component } from 'solid-js';
import { createSignal, For, Show, onMount, createEffect } from 'solid-js';
import Sidebar from './components/Sidebar';

interface Stats {
  totalDurationMs: number;
  loadDurationMs: number;
  promptEvalCount: number;
  promptEvalDurationMs: number;
  promptTokensPerSec: number;
  evalCount: number;
  evalDurationMs: number;
  tokensPerSec: number;
}

interface Message {
  type: 'user' | 'assistant';
  text: string;
  thinking?: string;
  stats?: Stats;
  sources?: string[];
  isLoading?: boolean;
}

interface Script {
  id: string;
  name: string;
  content: string;
  extension: string;
}

interface SkillFolder {
  id: string;
  folderName: string;
  skillMd: {
    content: string;
    name: string;
  };
  scripts: Script[];
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:5000';
const OLLAMA_BASE = import.meta.env.VITE_OLLAMA_BASE ?? 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? 'gemma4:e2b';

// ── Collapsible Thinking Block ────────────────────────────────────────────────
const ThinkingBlock: Component<{ thinking: string }> = (props) => {
  const [open, setOpen] = createSignal(false);
  return (
    <div class="mb-3">
      <button
        onClick={() => setOpen(v => !v)}
        class="flex items-center gap-1.5 text-xs text-text-secondary/70 hover:text-text-secondary transition-colors group"
      >
        <svg
          class={`w-3.5 h-3.5 transition-transform duration-200 ${open() ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-medium italic">
          {open() ? 'Hide' : 'Show'} thinking
        </span>
        <span class="text-text-secondary/40">
          ({props.thinking.trim().split(/\s+/).length} words)
        </span>
      </button>
      <Show when={open()}>
        <div class="mt-2 pl-3 border-l-2 border-accent/30 text-xs text-text-secondary/70 leading-relaxed whitespace-pre-wrap italic max-h-64 overflow-y-auto">
          {props.thinking.trim()}
        </div>
      </Show>
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar: Component<{ stats: Stats }> = (props) => {
  const [open, setOpen] = createSignal(false);
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const s = props.stats;
  return (
    <div class="mt-3 pt-3 border-t border-border/20">
      <button
        onClick={() => setOpen(v => !v)}
        class="flex items-center gap-1.5 text-xs text-text-secondary/50 hover:text-text-secondary/80 transition-colors"
      >
        <svg
          class={`w-3 h-3 transition-transform duration-200 ${open() ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span>
          {fmt(s.tokensPerSec)} tok/s · {fmt(s.totalDurationMs / 1000)}s
        </span>
      </button>
      <Show when={open()}>
        <div class="mt-2 space-y-2">
          {/* Timing row */}
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'Total time',   value: `${fmt(s.totalDurationMs / 1000)}s` },
              { label: 'Load time',    value: `${fmt(s.loadDurationMs / 1000)}s` },
              { label: 'Eval time',    value: `${fmt(s.evalDurationMs / 1000)}s` },
            ].map(item => (
              <div class="bg-bg-primary/60 rounded-lg px-3 py-2 border border-border/30">
                <p class="text-xs text-text-secondary/50 mb-0.5">{item.label}</p>
                <p class="text-sm font-medium text-text-secondary">{item.value}</p>
              </div>
            ))}
          </div>
          {/* Token row */}
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Output tokens',  value: String(s.evalCount) },
              { label: 'Output tok/s',   value: fmt(s.tokensPerSec) },
              { label: 'Prompt tokens',  value: String(s.promptEvalCount) },
              { label: 'Prompt tok/s',   value: fmt(s.promptTokensPerSec) },
            ].map(item => (
              <div class="bg-bg-primary/60 rounded-lg px-3 py-2 border border-border/30">
                <p class="text-xs text-text-secondary/50 mb-0.5">{item.label}</p>
                <p class="text-sm font-medium text-text-secondary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ChatUI: Component = () => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal('');
  const [skillFolders, setSkillFolders] = createSignal<SkillFolder[]>([]);
  const [loadingSkills, setLoadingSkills] = createSignal(false);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  let messagesEndRef: HTMLDivElement | undefined;
  let inputRef: HTMLTextAreaElement | undefined;
  let abortControllerRef: AbortController | null = null;

  const loadSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await fetch(`${API_BASE}/api/skills`);
      if (!response.ok) throw new Error(`Failed to load skills: ${response.statusText}`);
      const data = await response.json();
      setSkillFolders(data.skills || []);
    } catch (error) {
      console.error('Error loading skills from backend:', error);
      setSkillFolders([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  onMount(() => { loadSkills(); });

  createEffect(() => {
    messages();
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  });

  const findRelevantSkill = (prompt: string): SkillFolder | null => {
    const folders = skillFolders();
    if (folders.length === 0) return null;
    const promptLower = prompt.toLowerCase();
    const promptWords = promptLower.split(/\s+/).filter(w => w.length > 2);
    let bestMatch: SkillFolder | null = null;
    let bestScore = 0;
    for (const folder of folders) {
      const skillContent = folder.skillMd.content.toLowerCase();
      const folderName = folder.folderName.toLowerCase();
      let score = 0;
      if (promptLower.includes(folderName)) score += 10;
      for (const word of folderName.split('-')) {
        if (word.length > 2 && promptLower.includes(word)) score += 5;
      }
      for (const word of promptWords) {
        if (skillContent.includes(word)) score += 1;
      }
      const techTerms = ['function','class','method','variable','algorithm','data',
        'structure','api','database','query','model','framework'];
      for (const term of techTerms) {
        if (promptLower.includes(term) && skillContent.includes(term)) score += 2;
      }
      if (score > bestScore) { bestScore = score; bestMatch = folder; }
    }
    return bestMatch;
  };

  const buildSystemPrompt = (skill: SkillFolder | null): string => {
    if (!skill) return 'You are Bemi, a helpful AI assistant. Answer clearly and concisely.';
    const scriptContext = skill.scripts.length > 0
      ? `\n\nAvailable helper scripts:\n${skill.scripts.map(s =>
          `- ${s.name}:\n\`\`\`\n${s.content}\n\`\`\``).join('\n')}`
      : '';
    return `You are Bemi, a helpful AI assistant. Use the following skill to guide your response.\n\n--- SKILL: ${skill.folderName} ---\n${skill.skillMd.content}${scriptContext}\n--- END SKILL ---\n\nFollow the skill's instructions and response guidance. Be helpful and concise.`;
  };

  const updateLastAssistant = (updater: (msg: Message) => Message) => {
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.type === 'assistant') {
        updated[lastIdx] = updater(updated[lastIdx]);
      }
      return updated;
    });
  };

  const sendMessage = async () => {
    if (!input().trim() || isGenerating()) return;
    const userText = input().trim();
    setInput('');
    setIsGenerating(true);

    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setMessages(prev => [...prev, { type: 'assistant', text: '', isLoading: true }]);

    const relevantSkill = findRelevantSkill(userText);
    const systemPrompt = buildSystemPrompt(relevantSkill);

    const history = messages()
      .filter(m => !m.isLoading && m.text)
      .map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }));

    abortControllerRef = new AbortController();

    try {
      const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: true,
          think: true,
          messages: [{ role: 'system', content: systemPrompt }, ...history],
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.status} ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';
      let fullThinking = '';

      // Replace the loading placeholder with an actual streaming message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, {
          type: 'assistant',
          text: '',
          thinking: '',
          sources: relevantSkill
            ? [`Skill: ${relevantSkill.folderName}`, ...relevantSkill.scripts.map(s => `Script: ${s.name}`)]
            : [],
        }];
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n').filter(l => l.trim())) {
          try {
            const json = JSON.parse(line);
            const msg = json.message ?? {};

            // Accumulate thinking tokens (reasoning models stream these separately)
            if (msg.thinking) {
              fullThinking += msg.thinking;
              updateLastAssistant(m => ({ ...m, thinking: fullThinking }));
            }

            // Accumulate response tokens
            if (msg.content) {
              fullText += msg.content;
              updateLastAssistant(m => ({ ...m, text: fullText }));
            }

            // Final chunk — attach stats
            if (json.done && json.eval_count != null) {
              const totalMs      = (json.total_duration       ?? 0) / 1e6;
              const loadMs       = (json.load_duration        ?? 0) / 1e6;
              const evalMs       = (json.eval_duration        ?? 0) / 1e6;
              const promptEvalMs = (json.prompt_eval_duration ?? 0) / 1e6;
              const stats: Stats = {
                totalDurationMs:      totalMs,
                loadDurationMs:       loadMs,
                promptEvalCount:      json.prompt_eval_count ?? 0,
                promptEvalDurationMs: promptEvalMs,
                promptTokensPerSec:   promptEvalMs > 0 ? ((json.prompt_eval_count ?? 0) / promptEvalMs) * 1000 : 0,
                evalCount:            json.eval_count,
                evalDurationMs:       evalMs,
                tokensPerSec:         evalMs > 0 ? (json.eval_count / evalMs) * 1000 : 0,
              };
              updateLastAssistant(m => ({ ...m, stats }));
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        // user cancelled — text stays as-is
      } else {
        console.error('Ollama request failed:', error);
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isLoading);
          return [...filtered, {
            type: 'assistant',
            text: `⚠️ Could not reach Ollama at \`${OLLAMA_BASE}\`. Make sure Ollama is running and the model **${OLLAMA_MODEL}** is pulled.\n\nError: ${(error as Error).message}`,
          }];
        });
      }
    } finally {
      abortControllerRef = null;
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => abortControllerRef?.abort();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: Event) => {
    const t = e.target as HTMLTextAreaElement;
    setInput(t.value);
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 200) + 'px';
  };

  const handleImportFolder = async (folderName: string, skillMdContent: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/skills/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName, skillMdContent }),
      });
      if (!response.ok) throw new Error((await response.text()) || 'Could not import skill');
      await loadSkills();
    } catch (error) {
      alert(`Import failed: ${(error as Error).message}`);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;
    try {
      const response = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.text()) || 'Could not delete skill');
      await loadSkills();
    } catch (error) {
      alert(`Delete failed: ${(error as Error).message}`);
    }
  };

  const handleAddScript = async (folderId: string, script: Script) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;
    const formData = new FormData();
    formData.append('file', new Blob([script.content], { type: 'text/plain' }), script.name);
    try {
      const response = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}/scripts`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error((await response.text()) || 'Could not upload script');
      await loadSkills();
    } catch (error) {
      alert(`Add script failed: ${(error as Error).message}`);
    }
  };

  const handleRemoveScript = async (folderId: string, scriptId: string) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;
    const script = folder.scripts.find(s => s.id === scriptId);
    if (!script) return;
    try {
      const response = await fetch(
        `${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}/scripts/${encodeURIComponent(script.name)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error((await response.text()) || 'Could not delete script');
      await loadSkills();
    } catch (error) {
      alert(`Remove script failed: ${(error as Error).message}`);
    }
  };

  const clearChat = () => { stopGeneration(); setMessages([]); };

  const LoadingDots = () => (
    <div class="flex space-x-1 items-center h-6">
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0s"></div>
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0.2s"></div>
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0.4s"></div>
    </div>
  );

  return (
    <div class="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      <Show when={sidebarOpen()}>
        <div class="w-[260px] flex-shrink-0">
          <Sidebar
            folders={skillFolders()}
            onDeleteFolder={handleDeleteFolder}
            onImportFolder={handleImportFolder}
            onAddScript={handleAddScript}
            onRemoveScript={handleRemoveScript}
            onNewChat={clearChat}
            onToggleSidebar={() => setSidebarOpen(false)}
          />
        </div>
      </Show>

      <div class="flex-1 flex flex-col relative">
        {/* Header */}
        <header class="h-14 flex items-center justify-between px-4 border-b border-border/30 bg-bg-primary/95 backdrop-blur z-10">
          <div class="flex items-center gap-3">
            <Show when={!sidebarOpen()}>
              <button onClick={() => setSidebarOpen(true)} class="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary" title="Open sidebar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </Show>
            <h1 class="text-sm font-medium text-text-primary">Bemi Chat</h1>
            <Show when={skillFolders().length > 0}>
              <span class="text-xs px-2 py-0.5 bg-bg-secondary rounded-full text-text-secondary">
                {skillFolders().length} skill{skillFolders().length !== 1 ? 's' : ''}
              </span>
            </Show>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 bg-bg-secondary rounded-full text-text-secondary hidden sm:block">
              {OLLAMA_MODEL}
            </span>
            <button onClick={clearChat} class="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary" title="New chat">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div class="flex-1 overflow-y-auto">
          <Show
            when={messages().length > 0}
            fallback={
              <div class="flex-1 flex items-center justify-center h-full">
                <div class="text-center space-y-4 max-w-md px-4">
                  <div class="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center">
                    <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 class="text-2xl font-semibold text-text-primary">How can I help you today?</h2>
                  <p class="text-text-secondary text-sm">Ask me anything. I'll use your imported skills and knowledge to provide the best possible response.</p>
                  <Show when={skillFolders().length === 0}>
                    <div class="mt-4 p-3 bg-bg-secondary rounded-lg border border-border/50">
                      <p class="text-xs text-text-secondary">
                        💡 <strong class="text-text-primary">Tip:</strong> Import skill folders from the sidebar to enhance responses with specialized knowledge.
                      </p>
                    </div>
                  </Show>
                </div>
              </div>
            }
          >
            <For each={messages()}>
              {(msg) => (
                <div class={`py-6 px-4 ${msg.type === 'assistant' ? 'bg-bg-secondary' : 'bg-bg-primary'}`}>
                  <div class="max-w-3xl mx-auto flex gap-4">
                    {/* Avatar */}
                    <div class="flex-shrink-0">
                      {msg.type === 'user' ? (
                        <div class="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      ) : (
                        <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium mb-1 text-text-primary">
                        {msg.type === 'user' ? 'You' : 'Bemi'}
                      </div>

                      <Show when={msg.isLoading} fallback={
                        <div>
                          {/* Thinking block — only shown when there's thinking content */}
                          <Show when={msg.thinking && msg.thinking.trim().length > 0}>
                            <ThinkingBlock thinking={msg.thinking!} />
                          </Show>

                          {/* Response text */}
                          <div class="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>

                          {/* Sources */}
                          <Show when={msg.sources && msg.sources.length > 0}>
                            <div class="mt-3 pt-3 border-t border-border/30">
                              <p class="text-xs text-text-secondary mb-2 font-medium">Sources used:</p>
                              <div class="flex flex-wrap gap-2">
                                <For each={msg.sources}>
                                  {(source) => (
                                    <span class="inline-flex items-center px-2 py-1 rounded-md bg-bg-primary border border-border/50 text-xs text-text-secondary">
                                      <svg class="w-3 h-3 mr-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      {source}
                                    </span>
                                  )}
                                </For>
                              </div>
                            </div>
                          </Show>

                          {/* Stats — only shown when generation is done and stats exist */}
                          <Show when={msg.stats}>
                            <StatsBar stats={msg.stats!} />
                          </Show>
                        </div>
                      }>
                        {/* Still loading — show dots and live thinking if already streaming */}
                        <div>
                          <Show when={msg.thinking && msg.thinking.trim().length > 0}>
                            <ThinkingBlock thinking={msg.thinking!} />
                          </Show>
                          <LoadingDots />
                        </div>
                      </Show>
                    </div>
                  </div>
                </div>
              )}
            </For>
            <div ref={messagesEndRef} class="h-4" />
          </Show>
        </div>

        {/* Input */}
        <div class="border-t border-border/30 bg-bg-primary p-4">
          <div class="max-w-3xl mx-auto">
            <div class="relative bg-bg-input rounded-xl border border-border/50 shadow-lg">
              <textarea
                ref={inputRef}
                value={input()}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message Bemi..."
                rows={1}
                class="w-full bg-transparent text-text-primary placeholder-text-secondary px-4 py-3 pr-12 resize-none focus:outline-none text-sm max-h-[200px]"
                disabled={isGenerating()}
              />
              <button
                onClick={isGenerating() ? stopGeneration : sendMessage}
                disabled={!isGenerating() && !input().trim()}
                class={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                  isGenerating()
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer'
                    : input().trim()
                    ? 'bg-accent text-white hover:bg-accent-hover cursor-pointer'
                    : 'bg-transparent text-text-secondary/50 cursor-not-allowed'
                }`}
                title={isGenerating() ? 'Stop generation' : 'Send message'}
              >
                <Show when={isGenerating()} fallback={
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                }>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </Show>
              </button>
            </div>
            <p class="text-center text-xs text-text-secondary/60 mt-2">
              Bemi can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
