// Grab elements using their IDs
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

// State
let songs = 
[
  { src: "assets/F1.mp3", title: "F1", artist: "Hans Zimmer" }
];
let current = 0;
let isPlaying = false;

// Format time in mm:ss
function formatTime(sec) 
{
  if (!sec) return "0:00";
  let m = Math.floor(sec / 60);
  let s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Load song
function loadSong(i) 
{
  let s = songs[i];
  audio.src = s.src;
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist;
  progress.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlight(i);
}

// Highlight active song in playlist
function highlight(i) 
{
  [...playlistEl.children].forEach((li, j) =>
    li.classList.toggle("active", j === i)
  );
}

// Build playlist UI
function renderPlaylist() 
{
  playlistEl.innerHTML = "";
  songs.forEach((s, i) => 
  {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${s.title} — ${s.artist}</span>
      <button class="btn btn-sm btn-outline-danger">X</button>
    `;
    li.addEventListener("click", e => 
    {
      if (e.target.tagName === "BUTTON") return;
      current = i;
      loadSong(current);
      play();
    });
    li.querySelector("button").addEventListener("click", e => 
    {
      e.stopPropagation();
      songs.splice(i, 1);
      if (songs.length === 0) {
        audio.src = "";
        titleEl.textContent = "No Song";
        artistEl.textContent = "";
        isPlaying = false;
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      } 
      else 
      {
        current = 0;
        loadSong(current);
      }
      renderPlaylist();
    });
    playlistEl.appendChild(li);
  });
  highlight(current);
}

// Controls
function play() 
{
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
}
function pause() 
{
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
}

// Events
playBtn.onclick = () => (isPlaying ? pause() : play());
prevBtn.onclick = () => { current = (current - 1 + songs.length) % songs.length; loadSong(current); play(); };
nextBtn.onclick = () => { current = (current + 1) % songs.length; loadSong(current); play(); };
rewindBtn.onclick = () => { audio.currentTime = Math.max(0, audio.currentTime - 5); };
forwardBtn.onclick = () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); };
volume.oninput = () => { audio.volume = volume.value; };
progress.oninput = () => { audio.currentTime = (progress.value / 100) * audio.duration; };

audio.ontimeupdate = () => 
{
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
};
audio.onended = () => nextBtn.onclick();

// Add song
addSongBtn.onclick = () => 
{
  let f = fileInput.files[0];
  if (!f) return;
  let url = URL.createObjectURL(f);
  songs.push({ src: url, title: f.name, artist: "Local" });
  renderPlaylist();
  current = songs.length - 1;
  loadSong(current);
  play();
  fileInput.value = "";
};

// Init
renderPlaylist();
loadSong(current);
