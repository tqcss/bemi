import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';

interface Script {
  id: string;
  name: string;
  content: string;
  extension: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (folderName: string, skillMdContent: string) => Promise<void>;
}

const ImportModal: Component<ImportModalProps> = (props) => {
  const [folderName, setFolderName] = createSignal('');
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file.name !== 'SKILL.md') {
        setError('Please select a file named SKILL.md');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!folderName().trim()) {
      setError('Please enter a folder name');
      return;
    }

    const file = selectedFile();
    if (!file) {
      setError('Please select SKILL.md file');
      return;
    }

    try {
      setIsLoading(true);
      const content = await file.text();
      await props.onImport(folderName(), content);
      setFolderName('');
      setSelectedFile(null);
      setError('');
    } catch (err) {
      setError('Error reading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-bg-secondary rounded-xl p-6 w-[420px] shadow-2xl border border-border">
          <h2 class="text-lg font-semibold mb-4 text-text-primary">Import Skill Folder</h2>
          <Show when={error()}>
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error()}
            </div>
          </Show>

          <div class="mb-4">
            <label class="block text-sm font-medium text-text-secondary mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName()}
              onInput={(e) => setFolderName(e.currentTarget.value)}
              placeholder="e.g., math-utilities, nlp-tools"
              class="w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-text-primary text-sm placeholder-text-secondary/50"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-text-secondary mb-2">
              Select SKILL.md File
            </label>
            <label class="block border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-bg-hover hover:border-accent/50 transition-colors text-center">
              <input
                type="file"
                accept=".md"
                onChange={handleFileSelect}
                class="hidden"
              />
              <svg class="w-8 h-8 mx-auto mb-2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm text-text-secondary">Click to upload SKILL.md</span>
            </label>
            <Show when={selectedFile()}>
              <div class="mt-2 flex items-center gap-2 text-sm text-accent">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {selectedFile()?.name}
              </div>
            </Show>
          </div>

          <div class="flex gap-3 justify-end">
            <button
              onClick={() => props.onClose()}
              disabled={isLoading()}
              class="px-4 py-2 bg-bg-primary border border-border text-text-secondary rounded-lg hover:bg-bg-hover transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading()}
              class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isLoading() ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

interface SkillFolder {
  id: string;
  folderName: string;
  skillMd: {
    content: string;
    name: string;
  };
  scripts: Script[];
}

interface SidebarProps {
  folders: SkillFolder[];
  onDeleteFolder: (id: string) => void;
  onImportFolder: (folderName: string, skillMdContent: string) => Promise<void>;
  onAddScript: (folderId: string, script: Script) => void;
  onRemoveScript: (folderId: string, scriptId: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const Sidebar: Component<SidebarProps> = (props) => {
  const [showImportModal, setShowImportModal] = createSignal(false);
  const [expandedFolders, setExpandedFolders] = createSignal<Set<string>>(new Set());
  const [hoveredFolder, setHoveredFolder] = createSignal<string | null>(null);

  const toggleFolder = (folderId: string) => {
    const expanded = new Set(expandedFolders());
    if (expanded.has(folderId)) {
      expanded.delete(folderId);
    } else {
      expanded.add(folderId);
    }
    setExpandedFolders(expanded);
  };

  const handleImport = async (folderName: string, skillMdContent: string) => {
    try {
      if (!skillMdContent) {
        console.error('SKILL.md content is empty');
        return;
      }
      await props.onImportFolder(folderName, skillMdContent);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing folder:', error);
      alert('Error importing folder: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAddScript = async (folderId: string, e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const content = await file.text();
    const extension = file.name.split('.').pop() || 'txt';

    props.onAddScript(folderId, {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      content: content,
      extension: extension
    });

    target.value = '';
  };

  return (
    <>
      <div class="w-[260px] bg-bg-sidebar text-text-primary h-screen flex flex-col border-r border-border/30">
        {/* New Chat Button */}
        <div class="p-3">
          <button
            onClick={props.onNewChat}
            class="w-full flex items-center gap-3 px-3 py-3 border border-border/50 rounded-lg hover:bg-bg-hover transition-colors text-sm font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        {/* Close Sidebar Button (mobile) */}
        <div class="px-3 pb-2">
          <button
            onClick={props.onToggleSidebar}
            class="w-full flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Close sidebar
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-2">
          {/* Section Header */}
          <div class="flex items-center justify-between mb-2 px-2">
            <h3 class="text-xs font-semibold text-text-secondary uppercase tracking-wider">Skills & Knowledge</h3>
            <span class="text-xs text-text-secondary/60">{props.folders.length}</span>
          </div>

          <Show
            when={props.folders.length > 0}
            fallback={
              <div class="px-2 py-4 text-center">
                <svg class="w-8 h-8 mx-auto mb-2 text-text-secondary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-xs text-text-secondary/60 leading-relaxed">
                  No skills imported yet.<br/>Import a folder to get started.
                </p>
              </div>
            }
          >
            <div class="space-y-1">
              <For each={props.folders}>
                {(folder) => {
                  const isExpanded = () => expandedFolders().has(folder.id);

                  return (
                    <div 
                      class="rounded-lg overflow-hidden border border-transparent hover:border-border/50 transition-colors"
                      onMouseEnter={() => setHoveredFolder(folder.id)}
                      onMouseLeave={() => setHoveredFolder(null)}
                    >
                      {/* Folder Header */}
                      <div class="flex items-center gap-2 px-2 py-2 hover:bg-bg-hover transition-colors cursor-pointer">
                        <button
                          onClick={() => toggleFolder(folder.id)}
                          class="text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <svg 
                            class={`w-4 h-4 transition-transform ${isExpanded() ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-text-primary truncate">{folder.folderName}</p>
                          <p class="text-xs text-text-secondary/60">
                            {folder.scripts.length} script{folder.scripts.length !== 1 ? 's' : ''}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${folder.folderName}"?`)) {
                              props.onDeleteFolder(folder.id);
                            }
                          }}
                          class={`p-1 rounded transition-all ${
                            hoveredFolder() === folder.id 
                              ? 'opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                              : 'opacity-0'
                          }`}
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Folder Contents */}
                      <Show when={isExpanded()}>
                        <div class="bg-bg-primary/50 px-2 py-2 space-y-1">
                          {/* SKILL.md */}
                          <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-bg-secondary/50">
                            <svg class="w-4 h-4 text-yellow-500/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span class="text-xs text-text-secondary truncate">SKILL.md</span>
                            <span class="text-xs text-text-secondary/40 ml-auto">{folder.skillMd.content.split('\n').length} lines</span>
                          </div>

                          {/* Scripts */}
                          <Show when={folder.scripts.length > 0}>
                            <div class="space-y-0.5">
                              <For each={folder.scripts}>
                                {(script) => (
                                  <div class="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-hover transition-colors">
                                    <svg class="w-4 h-4 text-blue-400/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span class="text-xs text-text-secondary/80 truncate flex-1">{script.name}</span>
                                    <button
                                      onClick={() => props.onRemoveScript(folder.id, script.id)}
                                      class="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all"
                                    >
                                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </For>
                            </div>
                          </Show>

                          {/* Add Script */}
                          <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-hover transition-colors cursor-pointer text-text-secondary/60 hover:text-text-secondary">
                            <input
                              type="file"
                              onChange={(e) => handleAddScript(folder.id, e)}
                              class="hidden"
                            />
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="text-xs">Add script</span>
                          </label>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>

        {/* Bottom Actions */}
        <div class="p-3 border-t border-border/30 space-y-1">
          <button
            onClick={() => setShowImportModal(true)}
            class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-hover rounded-lg transition-colors text-sm text-text-secondary hover:text-text-primary"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Skill Folder
          </button>
        </div>
      </div>

      <ImportModal
        isOpen={showImportModal()}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </>
  );
};

export default Sidebar;
