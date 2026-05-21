import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (folderName: string, skillMdContent: string) => void;
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

export default ImportModal;
