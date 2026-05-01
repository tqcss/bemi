import type { Component } from 'solid-js';
import { createSignal, For, Show, onMount } from 'solid-js';
import Sidebar from './Sidebar';

interface Message {
  type: 'user' | 'assistant';
  text: string;
  sources?: string[];
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

  const sendMessage = () => {
    if (!input().trim()) return;
    const userMessage: Message = { type: 'user', text: input() };
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = input();
    setInput('');

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
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  // Function to find the most relevant skill based on user prompt
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
      
      // Exact folder name match gets high score
      if (promptLower.includes(folderName)) {
        score += 10;
      }
      
      // Folder name keywords match
      const folderWords = folderName.split('-');
      for (const word of folderWords) {
        if (word.length > 2 && promptLower.includes(word)) {
          score += 5;
        }
      }
      
      // Content keyword matches
      for (const word of promptWords) {
        if (skillContent.includes(word)) {
          score += 1;
        }
      }
      
      // Check for common programming/technical terms
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

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
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

  return (
    <div class="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        folders={skillFolders()}
        onDeleteFolder={handleDeleteFolder}
        onImportFolder={handleImportFolder}
        onAddScript={handleAddScript}
        onRemoveScript={handleRemoveScript}
      />

      {/* Main Chat Area */}
      <div class="flex-1 flex flex-col">
        {/* Header */}
        <header class="bg-blue-600 text-white p-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">Bemi Chat UI</h1>
            <div class="text-sm">
              {skillFolders().length} skill{skillFolders().length !== 1 ? 's' : ''} loaded
            </div>
          </div>
        </header>

        {/* Response Thread */}
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <For each={messages()}>
            {(msg) => (
              <div class={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div class={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border'
                }`}>
                  <p>{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div class="mt-2 text-sm text-gray-600">
                      <strong>Sources:</strong>
                      <ul class="list-disc list-inside">
                        <For each={msg.sources}>
                          {(source) => <li>{source}</li>}
                        </For>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Query Input */}
        <div class="p-4 bg-white border-t">
          <div class="flex space-x-2">
            <input
              type="text"
              value={input()}
              onInput={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your query here..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;