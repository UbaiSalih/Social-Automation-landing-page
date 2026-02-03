import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  setupUpload();
  setupGenerate();
  setupReset();
});

let selectedFiles = [];

function setupUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('productImage'); // Changed ID
  const previewContainer = document.getElementById('imagePreviewContainer');
  const placeholders = document.querySelector('.upload-placeholder');

  if (!uploadArea || !fileInput) return;

  // Click to upload
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFiles(Array.from(e.target.files));
    }
  });

  // Drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('highlight'));
  uploadArea.addEventListener('dragover', () => uploadArea.classList.add('highlight'));
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('highlight'));
  uploadArea.addEventListener('drop', (e) => {
    uploadArea.classList.remove('highlight');
    const dt = e.dataTransfer;
    if (dt.files.length) {
      handleFiles(Array.from(dt.files));
    }
  });

  function handleFiles(files) {
    // Filter for accepted types
    const validFiles = files.filter(file =>
      ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
    );

    if (validFiles.length) {
      selectedFiles = [...selectedFiles, ...validFiles]; // Append or replace? User said "Multiple files: Yes". Usually append.
      // But clearing logic might be needed. For now, let's just append.
      // Actually, simple input replacement is easier for standard file inputs, but for "Builder" UI, appending is nice.
      // However, `fileInput.files` is hard to modify. Let's start fresh on new selection to match standard input behavior, or just track `selectedFiles`.
      // I'll filter unique files if I want, but for now let's just show them.

      // Let's reset selectedFiles on new drop/select to keep it simple and consistent with standard inputs unless we build a complex manager.
      // "Multiple files: Yes" just means the input accepts them.
      selectedFiles = validFiles;

      updatePreviews();
    }
  }

  function updatePreviews() {
    previewContainer.innerHTML = '';

    if (selectedFiles.length > 0) {
      placeholders.classList.add('hidden');
      previewContainer.classList.remove('hidden');

      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.className = 'image-preview-item';
          const img = document.createElement('img');
          img.src = e.target.result;
          div.appendChild(img);
          previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
    } else {
      placeholders.classList.remove('hidden');
      previewContainer.classList.add('hidden');
    }
  }
}

function setupGenerate() {
  const btn = document.getElementById('generateBtn');
  const builderContainer = document.querySelector('.builder-container');
  const successArea = document.getElementById('successArea');

  // Inputs
  const titleInput = document.getElementById('productTitle');
  const subtitleInput = document.getElementById('arabicSubtitle');
  const linkInput = document.getElementById('productLink');
  const descInput = document.getElementById('arabicLongDescription');
  const emailInput = document.getElementById('emailInput');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Validation
    if (selectedFiles.length === 0) {
      alert('Please upload at least one product image.');
      return;
    }
    if (!titleInput.value.trim()) { alert('Product title is required.'); return; }
    if (!subtitleInput.value.trim()) { alert('Arabic subtitle is required.'); return; }
    if (!linkInput.value.trim()) { alert('Product link is required.'); return; }
    if (!descInput.value.trim()) { alert('Arabic long description is required.'); return; }
    if (!emailInput.value.trim()) { alert('Email is required.'); return; }

    // Loading State
    btn.classList.add('btn-loading');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';

    // Prepare Data
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('productImage', file); // "productImage" as requested
      // Note: n8n usually handles array if multiple with same key, or we might need 'productImage[]'. 
      // I'll stick to 'productImage' key.
    });
    formData.append('productTitle', titleInput.value);
    formData.append('arabicSubtitle', subtitleInput.value);
    formData.append('ProductLink', linkInput.value);
    formData.append('Arabiclongdesciption', descInput.value);
    formData.append('email', emailInput.value);

    try {
      // Send to Webhook
      await fetch('https://n8n.thenextgen.ai/webhook/ugc', {
        method: 'POST',
        body: formData
      });

      // Success UI
      builderContainer.classList.add('hidden');
      successArea.classList.remove('hidden');
      successArea.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      // Reset Button State
      btn.classList.remove('btn-loading');
      btn.textContent = originalText;
    }
  });
}

function setupReset() {
  const resetBtn = document.getElementById('createAnotherBtn');
  const builderContainer = document.querySelector('.builder-container');
  const successArea = document.getElementById('successArea');

  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    // Reset Form
    document.getElementById('productImage').value = '';
    document.getElementById('productTitle').value = 'VEX';
    document.getElementById('arabicSubtitle').value = '';
    document.getElementById('productLink').value = '';
    document.getElementById('arabicLongDescription').value = '';
    document.getElementById('emailInput').value = '';

    // Reset Logic
    selectedFiles = [];
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.querySelector('.upload-placeholder').classList.remove('hidden');

    // Toggle Views
    successArea.classList.add('hidden');
    builderContainer.classList.remove('hidden');
    builderContainer.scrollIntoView({ behavior: 'smooth' });
  });
}
