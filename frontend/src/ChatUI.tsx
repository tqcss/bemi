import type { Component } from 'solid-js';
import { createSignal, For, Show, onMount, createEffect } from 'solid-js';
import Sidebar from './Sidebar';

interface Message {
  type: 'user' | 'assistant';
  text: string;
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

const ChatUI: Component = () => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal('');
  const [skillFolders, setSkillFolders] = createSignal<SkillFolder[]>([]);
  const [loadingSkills, setLoadingSkills] = createSignal(false);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  let messagesEndRef: HTMLDivElement | undefined;
  let inputRef: HTMLTextAreaElement | undefined;

  const loadSkills = async () => {
    setLoadingSkills(true);
    try {
      const response = await fetch(`${API_BASE}/api/skills`);
      if (!response.ok) {
        throw new Error(`Failed to load skills: ${response.statusText}`);
      }
      const data = await response.json();
      setSkillFolders(data.skills || []);
    } catch (error) {
      console.error('Error loading skills from backend:', error);
      setSkillFolders([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  onMount(() => {
    loadSkills();
  });

  createEffect(() => {
    messages();
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const sendMessage = () => {
    if (!input().trim() || isGenerating()) return;

    const userMessage: Message = { type: 'user', text: input() };
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = input();
    setInput('');
    setIsGenerating(true);

    // Add loading message
    setMessages(prev => [...prev, { type: 'assistant', text: '', isLoading: true }]);

    // Find the most relevant skill based on the prompt
    const relevantSkill = findRelevantSkill(userPrompt);

    // Simulate assistant response with skill context
    setTimeout(() => {
      const skillInfo = relevantSkill 
        ? ` (using ${relevantSkill.folderName} skill with ${relevantSkill.scripts.length} helper script${relevantSkill.scripts.length !== 1 ? 's' : ''})`
        : ' (no matching skills found)';

      const assistantMessage: Message = {
        type: 'assistant',
        text: `This is a simulated response to your query${skillInfo}.\n\n${relevantSkill ? `Based on your prompt, I found the most relevant skill: **${relevantSkill.folderName}**\n\nSkill content preview: ${relevantSkill.skillMd.content.substring(0, 200)}...` : 'No specific skills matched your query.'}`,
        sources: relevantSkill ? [`Skill: ${relevantSkill.folderName}`, ...relevantSkill.scripts.map(s => `Script: ${s.name}`)] : []
      };

      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [...filtered, assistantMessage];
      });
      setIsGenerating(false);
    }, 1500);
  };

  const findRelevantSkill = (prompt: string): SkillFolder | null => {
    const folders = skillFolders();
    if (folders.length === 0) return null;

    const promptLower = prompt.toLowerCase();
    const promptWords = promptLower.split(/\s+/).filter(word => word.length > 2);

    let bestMatch: SkillFolder | null = null;
    let bestScore = 0;

    for (const folder of folders) {
      const skillContent = folder.skillMd.content.toLowerCase();
      const folderName = folder.folderName.toLowerCase();

      let score = 0;

      if (promptLower.includes(folderName)) {
        score += 10;
      }

      const folderWords = folderName.split('-');
      for (const word of folderWords) {
        if (word.length > 2 && promptLower.includes(word)) {
          score += 5;
        }
      }

      for (const word of promptWords) {
        if (skillContent.includes(word)) {
          score += 1;
        }
      }

      const techTerms = ['function', 'class', 'method', 'variable', 'algorithm', 'data', 'structure', 'api', 'database', 'query', 'model', 'framework'];
      for (const term of techTerms) {
        if (promptLower.includes(term) && skillContent.includes(term)) {
          score += 2;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = folder;
      }
    }

    return bestMatch;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setInput(target.value);
    // Auto-resize
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
  };

  const handleImportFolder = async (folderName: string, skillMdContent: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/skills/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderName, skillMdContent })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Could not import skill');
      }
      await loadSkills();
    } catch (error) {
      console.error('Error importing skill folder:', error);
      alert(`Import failed: ${(error as Error).message}`);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;
    try {
      const response = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Could not delete skill');
      }
      await loadSkills();
    } catch (error) {
      console.error('Error deleting skill folder:', error);
      alert(`Delete failed: ${(error as Error).message}`);
    }
  };

  const handleAddScript = async (folderId: string, script: Script) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;

    const formData = new FormData();
    const blob = new Blob([script.content], { type: 'text/plain' });
    formData.append('file', blob, script.name);

    try {
      const response = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}/scripts`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Could not upload script');
      }
      await loadSkills();
    } catch (error) {
      console.error('Error adding script:', error);
      alert(`Add script failed: ${(error as Error).message}`);
    }
  };

  const handleRemoveScript = async (folderId: string, scriptId: string) => {
    const folder = skillFolders().find(f => f.id === folderId);
    if (!folder) return;
    const script = folder.scripts.find(s => s.id === scriptId);
    if (!script) return;

    try {
      const response = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(folder.folderName)}/scripts/${encodeURIComponent(script.name)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Could not delete script');
      }
      await loadSkills();
    } catch (error) {
      console.error('Error removing script:', error);
      alert(`Remove script failed: ${(error as Error).message}`);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const LoadingDots = () => (
    <div class="flex space-x-1 items-center h-6">
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0s"></div>
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0.2s"></div>
      <div class="w-2 h-2 bg-text-secondary rounded-full animate-pulse-dot" style="animation-delay: 0.4s"></div>
    </div>
  );

  return (
    <div class="flex h-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar */}
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

      {/* Main Chat Area */}
      <div class="flex-1 flex flex-col relative">
        {/* Top Navigation */}
        <header class="h-14 flex items-center justify-between px-4 border-b border-border/30 bg-bg-primary/95 backdrop-blur z-10">
          <div class="flex items-center gap-3">
            <Show when={!sidebarOpen()}>
              <button
                onClick={() => setSidebarOpen(true)}
                class="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
                title="Open sidebar"
              >
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
            <button
              onClick={clearChat}
              class="p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-secondary"
              title="New chat"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages Area */}
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
                  <p class="text-text-secondary text-sm">
                    Ask me anything. I'll use your imported skills and knowledge to provide the best possible response.
                  </p>
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
              {(msg, index) => (
                <div class={`py-6 px-4 ${msg.type === 'assistant' ? 'bg-bg-secondary' : 'bg-bg-primary'}`}>
                  <div class="max-w-3xl mx-auto flex gap-4">
                    {/* Avatar */}
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
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

                    {/* Message Content */}
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium mb-1 text-text-primary">
                        {msg.type === 'user' ? 'You' : 'Assistant'}
                      </div>

                      <Show when={msg.isLoading} fallback={
                        <div class="prose prose-invert max-w-none">
                          <div class="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </div>
                        </div>
                      }>
                        <LoadingDots />
                      </Show>

                      {/* Sources */}
                      <Show when={msg.sources && msg.sources.length > 0 && !msg.isLoading}>
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
                    </div>
                  </div>
                </div>
              )}
            </For>
            <div ref={messagesEndRef} class="h-4" />
          </Show>
        </div>

        {/* Input Area */}
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
                onClick={sendMessage}
                disabled={!input().trim() || isGenerating()}
                class={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                  input().trim() && !isGenerating()
                    ? 'bg-accent text-white hover:bg-accent-hover cursor-pointer'
                    : 'bg-transparent text-text-secondary/50 cursor-not-allowed'
                }`}
              >
                <Show when={isGenerating()} fallback={
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                }>
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
