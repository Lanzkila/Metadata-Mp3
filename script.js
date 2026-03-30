const imageInput = document.getElementById('imageInput');
const audioInput = document.getElementById('audioInput');
const coverPreview = document.getElementById('cover-preview');
const fileList = document.getElementById('file-list');
const label = document.getElementById('label');

// Preview Cover Art
imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        coverPreview.src = url;
        coverPreview.style.display = 'block';
        label.style.display = 'none';
    }
};

// Preview Tracklist
audioInput.onchange = (e) => {
    fileList.innerHTML = "";
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name.toLowerCase();
        fileList.appendChild(li);
    });
};

async function processAlbum() {
    const audioFiles = Array.from(audioInput.files);
    const imageFile = imageInput.files[0];
    const albumName = document.getElementById('albumTitle').value || "UNTITLED ARCHIVE";
    const artist = document.getElementById('songArtist').value || "KIRIN";

    if (audioFiles.length === 0 || !imageFile) {
        alert("REQUIRED: COVER ART & AUDIO FILES.");
        return;
    }

    const processBtn = document.getElementById('processBtn');
    processBtn.innerText = "PROCESSING...";
    processBtn.disabled = true;

    try {
        const imageBuffer = await imageFile.arrayBuffer();

        for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            const trackNo = (i + 1).toString();
            
            const audioBuffer = await file.buffer ? await file.buffer() : await file.arrayBuffer();
            const writer = new ID3Writer(audioBuffer);

            writer.setFrame('TIT2', file.name.replace(/\.[^/.]+$/, "")) // Remove extension
                  .setFrame('TPE1', [artist])
                  .setFrame('TALB', albumName)
                  .setFrame('TRCK', trackNo)
                  .setFrame('APIC', {
                      type: 3,
                      data: imageBuffer,
                      description: 'Cover'
                  });

            writer.addTag();
            const taggedBlob = writer.getBlob();
            const downloadUrl = URL.createObjectURL(taggedBlob);
            
            // Helper function to trigger download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${trackNo.padStart(2, '0')}. ${file.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Delay 800ms supaya browser tak block download beruntun
            await new Promise(r => setTimeout(r, 800));
            URL.revokeObjectURL(downloadUrl);
        }
        alert("ALBUM SUCCESSFULLY GENERATED.");
    } catch (error) {
        console.error(error);
        alert("ERROR: " + error.message);
    } finally {
        processBtn.innerText = "GENERATE FULL ALBUM";
        processBtn.disabled = false;
    }
                }
