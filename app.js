import * as ImageMagick from 'https://esm.run/@imagemagick/magick-wasm@0.0.34';

// DOM Elements
const elements = {
  fileInput: document.getElementById('file-input'),
  uploadZone: document.getElementById('upload-zone'),
  processBtn: document.getElementById('process-btn'),
  inputPreview: document.getElementById('input-preview'),
  outputPreview: document.getElementById('output-preview'),
  inputPlaceholder: document.getElementById('input-placeholder'),
  outputPlaceholder: document.getElementById('output-placeholder'),
  downloadBtn: document.getElementById('download-btn')
};

// App state
const state = {
  magickReady: false,
  saneProfileData: null,
  selectedFile: null,
  isMobile: window.innerWidth <= 768
};

// UI elements
const UI = {
  spinner: '<div class="spinner"></div>',

  showSpinner() {
    elements.processBtn.innerHTML = this.spinner + '<span style="vertical-align: middle">Processing</span>';
  },

  hideSpinner() {
    elements.processBtn.innerHTML = 'Process Image';
  },

  updateProcessButtonState() {
    elements.processBtn.disabled = !(
      state.magickReady &&
      state.saneProfileData &&
      elements.fileInput.files.length > 0
    );
  },

  displayInputImage(dataUrl) {
    elements.inputPreview.src = dataUrl;
    elements.inputPreview.style.display = 'block';
    elements.inputPlaceholder.style.display = 'none';
    
    if (state.isMobile) {
      // Scroll to processing button on mobile after image selection
      setTimeout(() => {
        elements.processBtn.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  },

  displayOutputImage(url, filename) {
    elements.outputPreview.src = url;
    elements.outputPreview.style.display = 'block';
    elements.outputPlaceholder.style.display = 'none';
    elements.downloadBtn.href = url;
    elements.downloadBtn.style.display = 'inline-flex';
    elements.downloadBtn.download = `hdrified_${filename.split('.')[0]}.png`;
    
    if (state.isMobile) {
      // Scroll to the output image on mobile
      setTimeout(() => {
        elements.outputPreview.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  },

  updateUploadZoneBorder(color) {
    elements.uploadZone.style.borderColor = color;
  }
};

// Core functionality
const ImageProcessor = {
  async initialize() {
    try {
      await ImageMagick.initializeImageMagick();
      state.magickReady = true;

      await this.loadIccProfile('./sane.icc');

      UI.updateProcessButtonState();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  },

  async loadIccProfile(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const profileData = new Uint8Array(arrayBuffer);
      state.saneProfileData = profileData;

      return true;
    } catch (error) {
      throw new Error(`ICC profile error: ${error.message}`);
    }
  },

  async processImage() {
    if (!elements.fileInput.files.length) return;

    try {
      // Update UI
      elements.processBtn.disabled = true;
      UI.showSpinner();

      // Prepare image data
      const file = elements.fileInput.files[0];
      const arrayBuffer = await file.arrayBuffer();
      const inputImageData = new Uint8Array(arrayBuffer);

      // Process image with ImageMagick
      ImageMagick.ImageMagick.read(inputImageData, (image) => {
        // Apply processing
        image.setProfile("icc", state.saneProfileData);
        image.evaluate(ImageMagick.Channels.RGB, ImageMagick.EvaluateOperator.Log, 30);

        // Set output format and generate result
        image.format = ImageMagick.MagickFormat.Png;

        image.write((outputData) => {
          const blob = new Blob([outputData], { type: 'image/png' });
          const url = URL.createObjectURL(blob);

          // Update UI with result
          UI.displayOutputImage(url, file.name);
          elements.processBtn.disabled = false;
          UI.hideSpinner();
        });
      });
    } catch (error) {
      elements.processBtn.disabled = false;
      UI.hideSpinner();
      console.error('Processing error:', error);
    }
  }
};

// Event handlers
function handleFileSelect(file) {
  if (!file) return;

  state.selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    UI.displayInputImage(e.target.result);
    UI.updateProcessButtonState();
  };
  reader.readAsDataURL(file);
}

// Handle resize events for responsive behavior
function handleResize() {
  state.isMobile = window.innerWidth <= 768;
}

// Event listeners
function setupEventListeners() {
  // Click events
  elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
  
  // Touch events for better mobile experience
  elements.uploadZone.addEventListener('touchstart', () => {
    UI.updateUploadZoneBorder('#666');
  }, { passive: true });
  
  elements.uploadZone.addEventListener('touchend', () => {
    UI.updateUploadZoneBorder('#ccc');
  }, { passive: true });

  // Drag and drop events
  elements.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    UI.updateUploadZoneBorder('#666');
  });

  elements.uploadZone.addEventListener('dragleave', () => {
    UI.updateUploadZoneBorder('#ccc');
  });

  elements.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    UI.updateUploadZoneBorder('#ccc');

    if (e.dataTransfer.files.length) {
      elements.fileInput.files = e.dataTransfer.files;
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  elements.fileInput.addEventListener('change', () => {
    handleFileSelect(elements.fileInput.files[0]);
  });

  elements.processBtn.addEventListener('click', () => ImageProcessor.processImage());
  
  // Handle window resize for responsive behavior
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Prevent double-tap zoom on mobile
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    const DOUBLE_TAP_THRESHOLD = 300;
    if (now - (window.lastTouchEnd || 0) < DOUBLE_TAP_THRESHOLD) {
      e.preventDefault();
    }
    window.lastTouchEnd = now;
  }, { passive: false });
}

// Initialize the application
async function init() {
  await ImageProcessor.initialize();
  setupEventListeners();
  
  // Automatically load and process bufo.png
  try {
    const response = await fetch('./bufo.png');
    const blob = await response.blob();
    const file = new File([blob], 'bufo.png', { type: 'image/png' });
    
    // Update file input with the loaded file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    elements.fileInput.files = dataTransfer.files;
    
    // Display the input image
    handleFileSelect(file);
    
    // Process the image automatically
    setTimeout(() => {
      ImageProcessor.processImage();
    }, 500); // Small delay to ensure everything is loaded
  } catch (error) {
    console.error('Error auto-loading image:', error);
  }
}

init();
