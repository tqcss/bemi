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
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto">
        <div class="bg-white rounded-lg p-6 w-96 shadow-lg pointer-events-auto">
          <h2 class="text-xl font-bold mb-4 text-gray-800">Import Skill Folder</h2>
          <Show when={error()}>
            <div class="mb-4 p-3 bg-red-100 text-red-800 rounded">
              {error()}
            </div>
          </Show>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName()}
              onInput={(e) => setFolderName(e.currentTarget.value)}
              placeholder="e.g., math-utilities, nlp-tools"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Select SKILL.md File
            </label>
            <label class="block border border-gray-300 rounded-lg p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept=".md"
                onChange={handleFileSelect}
                class="hidden"
              />
              <span class="text-gray-600">Click to select SKILL.md file</span>
            </label>
            <Show when={selectedFile()}>
              <div class="mt-2">
                <p class="text-sm text-green-600 font-semibold">✓ Selected: {selectedFile()?.name}</p>
              </div>
            </Show>
          </div>

          <div class="flex gap-2 justify-end">
            <button
              onClick={() => props.onClose()}
              disabled={isLoading()}
              class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isLoading()}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
}

const Sidebar: Component<SidebarProps> = (props) => {
  const [showImportModal, setShowImportModal] = createSignal(false);
  const [expandedFolders, setExpandedFolders] = createSignal<Set<string>>(new Set());

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
      <div class="w-72 bg-gray-800 text-white h-screen flex flex-col">
        {/* Header */}
        <div class="p-4 border-b border-gray-700">
          <h2 class="text-lg font-bold">Skills & Knowledge</h2>
        </div>

        {/* Import Button */}
        <div class="p-4 border-b border-gray-700">
          <button
            onClick={() => setShowImportModal(true)}
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Import Skill Folder
          </button>
        </div>

        {/* Skill Folders List */}
        <div class="flex-1 overflow-y-auto p-4">
          <Show
            when={props.folders.length > 0}
            fallback={
              <p class="text-gray-400 text-sm">
                No skill folders imported yet. Click "Import Skill Folder" to get started.
              </p>
            }
          >
            <div class="space-y-2">
              <For each={props.folders}>
                {(folder) => {
                  const isExpanded = () => expandedFolders().has(folder.id);

                  return (
                    <div class="border border-gray-700 rounded-lg overflow-hidden">
                      {/* Folder Header */}
                      <div class="p-3 bg-gray-700 hover:bg-gray-600 transition">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => toggleFolder(folder.id)}
                              class="text-gray-400 hover:text-white"
                            >
                              {isExpanded() ? '▼' : '▶'}
                            </button>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-semibold truncate">{folder.folderName}</p>
                              <p class="text-xs text-gray-300">SKILL.md ({folder.skillMd.content.split('\n').length} lines)</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              props.onDeleteFolder(folder.id);
                            }}
                            class="ml-2 px-2 py-1 bg-red-600 rounded text-xs opacity-0 hover:opacity-100 hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Folder Contents */}
                      <Show when={isExpanded()}>
                        <div class="bg-gray-900 p-3 space-y-2 border-t border-gray-700">
                          {/* SKILL.md File */}
                          <div class="bg-gray-800 p-2 rounded">
                            <p class="text-xs text-yellow-400 font-semibold">📄 SKILL.md</p>
                            <p class="text-xs text-gray-500 pl-4">
                              {folder.skillMd.content.split('\n').length} lines
                            </p>
                          </div>

                          {/* Scripts Folder */}
                          <div class="border border-gray-700 rounded">
                            <div class="bg-gray-800 p-2">
                              <p class="text-xs text-blue-400 font-semibold">📁 scripts/</p>
                            </div>
                            <Show
                              when={folder.scripts.length > 0}
                              fallback={
                                <p class="text-gray-500 text-xs italic p-2">No scripts added</p>
                              }
                            >
                              <div class="space-y-1 p-2 bg-gray-900 border-t border-gray-700">
                                <For each={folder.scripts}>
                                  {(script) => (
                                    <div class="flex items-center justify-between bg-gray-800 p-2 rounded group">
                                      <div class="flex-1 min-w-0">
                                        <p class="text-xs truncate text-gray-300">📜 {script.name}</p>
                                        <p class="text-xs text-gray-500 pl-4">.{script.extension}</p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          props.onRemoveScript(folder.id, script.id)
                                        }
                                        class="ml-2 px-1.5 py-0.5 bg-red-600 rounded text-xs opacity-0 group-hover:opacity-100 hover:bg-red-700 transition"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </For>
                              </div>
                            </Show>

                            {/* Add Script Button */}
                            <div class="p-2 border-t border-gray-700">
                              <label class="block">
                                <input
                                  type="file"
                                  onChange={(e) => handleAddScript(folder.id, e)}
                                  class="hidden"
                                />
                                <span class="block text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded cursor-pointer text-center">
                                  + Add Script
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
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