const imageInput = document.getElementById('imageInput');
const audioInput = document.getElementById('audioInput');
const coverPreview = document.getElementById('cover-preview');
const fileList = document.getElementById('file-list');
const label = document.getElementById('label');

// Preview Cover Art
imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        coverPreview.src = URL.createObjectURL(file);
        coverPreview.style.display = 'block';
        label.style.display = 'none';
    }
};

// Preview Tracklist bila file lagu dipilih
audioInput.onchange = (e) => {
    fileList.innerHTML = "";
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        fileList.appendChild(li);
    });
};

async function processAlbum() {
    const audioFiles = Array.from(audioInput.files);
    const imageFile = imageInput.files[0];
    const albumName = document.getElementById('albumTitle').value || "Untitled Album";
    const artist = document.getElementById('songArtist').value || "Kirin";

    if (audioFiles.length === 0 || !imageFile) {
        alert("Sila lengkapkan Cover Art dan pilih lagu-lagu!");
        return;
    }

    const imageBuffer = await imageFile.arrayBuffer();

    // Loop proses setiap lagu
    for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const trackNo = (i + 1).toString();
        
        const audioBuffer = await file.arrayBuffer();
        const writer = new ID3Writer(audioBuffer);

        writer.setFrame('TIT2', file.name.replace('.mp3', '')) // Tajuk lagu
              .setFrame('TPE1', [artist])                      // Artis
              .setFrame('TALB', albumName)                     // Album
              .setFrame('TRCK', trackNo)                       // NOMBOR TRACK
              .setFrame('APIC', {
                  type: 3,
                  data: imageBuffer,
                  description: 'Cover Art'
              });

        writer.addTag();
        const taggedBlob = writer.getBlob();
        
        // Trigger download
        const url = URL.createObjectURL(taggedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trackNo.padStart(2, '0')}. ${file.name}`;
        a.click();

        // Delay 500ms supaya browser tak block multiple downloads
        await new Promise(r => setTimeout(r, 500));
    }
    
    alert("Semua lagu dalam album telah siap diproses!");
}
