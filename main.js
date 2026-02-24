// DOM elements
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const previewDiv = document.getElementById('preview');
const imageContainer = document.getElementById('imageContainer');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyzeBtn');

// ensure preview is hidden at start
previewDiv.classList.add('hidden');
// set a neutral result message
resultDiv.innerHTML = `<div class="small-note" style="text-align: center; opacity:0.7;">⏳ No analysis yet. Upload and click Analyze.</div>`;

// update filename and show preview immediately when user selects a file
fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;

        // show preview box
        previewDiv.classList.remove('hidden');

        // display image using FileReader
        const reader = new FileReader();
        reader.onload = function (ev) {
            // build image preview block: image + filename + metadata
            imageContainer.innerHTML = `
                <div class="image-box">
                    <img src="${ev.target.result}" alt="MRI preview">
                    <p><strong>${file.name}</strong></p>
                </div>
                <div class="meta-panel">
                    <div class="meta-item"><span style="font-weight:600;">📋 info</span></div>
                    <div class="meta-item">type: ${file.type || 'image/jpeg'}</div>
                    <div class="meta-item">size: ${(file.size / 1024).toFixed(1)} KB</div>
                    <div class="meta-item">loaded: just now</div>
                    <div class="meta-item" style="border-bottom: none;">✅ ready for AI</div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        // reset to empty state
        fileNameDisplay.textContent = 'No file selected';
        previewDiv.classList.add('hidden');
        imageContainer.innerHTML = ''; // clear any previous image
        // keep result as is (last analysis remains)
    }
});

// analyze button click handler
analyzeBtn.addEventListener('click', async function () {
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an MRI image first.');
        return;
    }

    // Show immediate feedback in result area: analyzing
    resultDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <span style="font-size:1.8rem;">⏳</span>
            <div>
                <h3 style="font-weight:500;">Analyzing MRI ...</h3>
                <p style="color:#1e4971;">calling stroke-predict API</p>
            </div>
        </div>
    `;

    // prepare form data
    const formData = new FormData();
    formData.append('file', file);

    try {
        // backend endpoint
        const response = await fetch('https://jagadeesh72-stroke-predict.hf.space/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        // build prediction string
        let predictionRaw = data.prediction || 'unknown';
        let confidenceVal = data.confidence || '0.00';
        // remove underscore and uppercase
        let displayPred = predictionRaw.replace(/_/g, ' ').toUpperCase();

        // format confidence as number with 2 decimals
        let confNum = parseFloat(confidenceVal);
        if (isNaN(confNum)) confNum = 0;
        let confPercent = confNum.toFixed(2);

        // update result div with nice card
        resultDiv.innerHTML = `
            <div>
                <div class="prediction-badge">
                    <span class="prediction-text">🧠 ${displayPred}</span>
                    <span class="confidence">${confPercent}% confidence</span>
                </div>
                <div class="confidence-bar">
                    <div class="bar-fill" style="width: ${Math.min(confNum, 100)}%;"></div>
                </div>
                <div style="margin-top: 1.2rem; color:#1b3a58; display:flex; gap:1rem; flex-wrap:wrap;">
                    <span>🩺 AI model: DWI-3T</span>
                    <span>📅 analysis ${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `
            <div class="error-message">
                ⚠️ Error connecting to backend.<br>
                <span style="font-size:0.9rem;">${error.message || 'network issue'}</span>
            </div>
        `;
    }
});

// optional: handle file input cancel/clear
fileInput.addEventListener('click', function () {
    // this helps detect dialog interaction but actual clear is handled by change event
});
