document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files.length) {
        alert("Please select an MRI image");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        const response = await fetch(
            "https://jagadeesh72-brain-stroke-detection-system.hf.space/predict",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        document.getElementById("result").innerHTML = `
            <h2>${data.prediction}</h2>
            <p>Confidence: ${data.confidence}%</p>
        `;
    } catch (error) {
        document.getElementById("result").innerHTML =
            "<p style='color:red;'>Error connecting to backend</p>";
        console.error(error);
    }
});
