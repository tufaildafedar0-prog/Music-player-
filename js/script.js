// Grab elements
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const rewindBtn = document.getElementById("rewind");
const forwardBtn = document.getElementById("forward");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const playlistEl = document.getElementById("playlist");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const fileInput = document.getElementById("fileInput");
const addSongBtn = document.getElementById("addSongBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const themeBtn = document.getElementById("themeBtn");
const dropZone = document.getElementById("dropZone");

// State
let songs = [
  { src: "assets/F1.mp3", title: "F1", artist: "Hans Zimmer", persistent: false }
];
let current = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Utils
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function randomIndexExcept(except, length) {
  if (length <= 1) return except;
  let idx = except;
  while (idx === except) idx = Math.floor(Math.random() * length);
  return idx;
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Core
function loadSong(i) {
  const s = songs[i];
  audio.src = s.src;
  titleEl.textContent = s.title || "Unknown Title";
  artistEl.textContent = s.artist || "Unknown Artist";
  const artEl = document.getElementById("art");
  if (s.art) {
    artEl.style.background = `url(${s.art}) center/cover no-repeat`;
    artEl.textContent = "";
  } else {
    artEl.style.background = "";
    artEl.textContent = "♪";
  }
  progress.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlight(i);
}
function play() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
}
function pause() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
}

// Playlist UI
function highlight(i) {
  [...playlistEl.children].forEach((li, j) => li.classList.toggle("active", j === i));
}
function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${s.title} — ${s.artist}</span>
      <button class="btn btn-sm btn-outline-danger">X</button>
    `;
    li.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      current = i;
      loadSong(current);
      play();
    });
    li.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      songs.splice(i, 1);
      if (songs.length === 0) {
        audio.src = "";
        titleEl.textContent = "No Song";
        artistEl.textContent = "";
        isPlaying = false;
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      } else {
        current = Math.min(current, songs.length - 1);
        loadSong(current);
      }
      renderPlaylist();
      savePlaylist();
    });
    playlistEl.appendChild(li);
  });
  highlight(current);
}

// Controls
playBtn.onclick = () => (isPlaying ? pause() : play());
prevBtn.onclick = () => {
  if (songs.length === 0) return;
  current = isShuffle ? randomIndexExcept(current, songs.length) : (current - 1 + songs.length) % songs.length;
  loadSong(current);
  play();
};
nextBtn.onclick = () => {
  if (songs.length === 0) return;
  current = isShuffle ? randomIndexExcept(current, songs.length) : (current + 1) % songs.length;
  loadSong(current);
  play();
};
rewindBtn.onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 5); };
forwardBtn.onclick = () => { if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); };
volume.oninput = () => { audio.volume = Number(volume.value); };
progress.oninput = () => { if (audio.duration) audio.currentTime = (progress.value / 100) * audio.duration; };

// Time updates
audio.ontimeupdate = () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
};
audio.onended = () => {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else {
    nextBtn.onclick();
  }
};

// Shuffle / Repeat
shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("btn-success", isShuffle);
  shuffleBtn.classList.toggle("btn-outline-secondary", !isShuffle);
};
repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("btn-success", isRepeat);
  repeatBtn.classList.toggle("btn-outline-secondary", !isRepeat);
};

// Theme toggle
themeBtn.onclick = () => {
  const toDark = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", toDark);
  localStorage.setItem("theme", toDark ? "dark" : "light");
};
function initTheme() {
  const pref = localStorage.getItem("theme");
  if (pref === "dark") document.body.classList.add("dark-mode");
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); isPlaying ? pause() : play(); }
  if (e.code === "ArrowRight") forwardBtn.onclick();
  if (e.code === "ArrowLeft") rewindBtn.onclick();
  if (e.code === "ArrowUp") { audio.volume = Math.min(1, audio.volume + 0.1); volume.value = audio.volume.toFixed(2); }
  if (e.code === "ArrowDown") { audio.volume = Math.max(0, audio.volume - 0.1); volume.value = audio.volume.toFixed(2); }
});

// Add song with metadata
addSongBtn.onclick = async () => {
  const f = fileInput.files[0];
  if (!f) return;
  const dataUrl = await readFileAsDataURL(f);
  let newSong = { src: dataUrl, title: f.name, artist: "Local", persistent: true };
  jsmediatags.read(f, {
    onSuccess: tag => {
      if (tag.tags.title) newSong.title = tag.tags.title;
      if (tag.tags.artist) newSong.artist = tag.tags.artist;
      if (tag.tags.picture) {
        const { data, format } = tag.tags.picture;
        let base64String = "";
        for (let i = 0; i < data.length; i++) base64String += String.fromCharCode(data[i]);
        newSong.art = `data:${format};base64,${btoa(base64String)}`;
      }
      songs.push(newSong);
      renderPlaylist(); current = songs.length - 1; loadSong(current); play(); savePlaylist();
    },
    onError: () => {
      songs.push(newSong);
      renderPlaylist(); current = songs.length - 1; loadSong(current); play(); savePlaylist();
    }
  });
  fileInput.value = "";
};

// Drag and drop
dropZone.ondragover = (e) => { e.preventDefault(); };
dropZone.ondrop = async (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const dataUrl = await readFileAsDataURL(f);
    let newSong = { src: dataUrl, title: f.name, artist: "Local", persistent: true };
    jsmediatags.read(f, {
      onSuccess: tag => {
        if (tag.tags.title) newSong.title = tag.tags.title; 
        if (tag.tags.artist) newSong.artist = tag.tags.artist;
        if (tag.tags.picture) {
          const { data, format } = tag.tags.picture;
          let base64String = "";
          for (let j = 0; j < data.length; j++) base64String += String.fromCharCode(data[j]);
          newSong.art = `data:${format};base64,${btoa(base64String)}`;
        }
        songs.push(newSong);
        renderPlaylist(); savePlaylist();
      },
      onError: () => {
        songs.push(newSong);
        renderPlaylist(); savePlaylist();
      }
    });
  }
};
// Persistent playlist
function savePlaylist() {
  const persistentSongs = songs.filter(s => s.persistent);
  localStorage.setItem("playlist", JSON.stringify(persistentSongs));
}
function loadPlaylist() {
  const data = localStorage.getItem("playlist");
  if (data) {
    const persistentSongs = JSON.parse(data);
    songs = songs.concat(persistentSongs);
  }
} 
// Init
function init() {
  initTheme();  
  loadPlaylist();
  renderPlaylist();
  loadSong(current);
  audio.volume = 0.5;
  volume.value = "0.5";
}
init();