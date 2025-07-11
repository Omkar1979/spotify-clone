


let currentSong = new Audio();
let songs = [];
let currfolder = "";

// Format seconds to mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Play the selected song
function playMusic(track, pause = false) {
    const fullPath = `./songs/${currfolder}/${track}`;
    currentSong.src = fullPath;

    if (!pause) {
        currentSong.play().catch(console.error);
        play.src = "img/Pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";

    console.log("Now playing:", fullPath);
}

// Load songs from a given folder (album)
async function getsongs(folder) {
    currfolder = folder;
    const baseURL = `./songs/${folder}/songs.json`;
    const res = await fetch(baseURL);
    songs = await res.json();

    // Display song list
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        songUL.innerHTML += `
        <li> 
            <img class="invert" src="https://cdn.hugeicons.com/icons/music-note-01-solid-sharp.svg" alt="music-note-01" width="32" height="32">
            <div class="info">
                <div class="songname">${song.replaceAll("%20", " ")}</div>
                <div class="artist">artist</div>
            </div>
            <div class="playnow">
                <span>play now</span>
                <img src="img/play.svg">
            </div>
        </li>`;
    });

    // Fix: Add click listener for each <li> to play that song
    Array.from(songUL.getElementsByTagName("li")).forEach((li) => {
        li.addEventListener("click", () => {
            const nameDiv = li.querySelector(".songname");
            if (nameDiv) {
                const trackName = nameDiv.textContent.trim();
                playMusic(trackName);
            }
        });
    });

    return songs;
}

// Load album cards dynamically from albums.json
async function displayAlbums() {
    const res = await fetch("./songs/albums.json");
    const albums = await res.json(); // e.g., ["cs", "album2"]
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    for (const folder of albums) {
        try {
            const infoRes = await fetch(`./songs/${folder}/info.json`);
            const info = await infoRes.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="30" fill="#1DB954" />
                            <polygon points="26,20 26,44 46,32" fill="black" />
                        </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="${info.title}">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        } catch (err) {
            console.warn(`Failed to load info.json for album: ${folder}`);
        }
    }

    // Click on album -> load its songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getsongs(card.dataset.folder);
            playMusic(songs[0]); // Autoplay first song
        });
    });
}

// Initialize everything
async function Main() {
    await getsongs("cs"); // Load default album
    playMusic(songs[0], true); // Don't autoplay initially
    await displayAlbums();

    // Play/Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/Pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        document.querySelector(".circle").style.left = (percent * 100) + "%";
        currentSong.currentTime = currentSong.duration * percent;
    });

    // Sidebar open/close
    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous button
    previous.addEventListener("click", () => {
        const currentIndex = songs.indexOf(currentSong.src.split("/").pop());
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    // Next button
    next.addEventListener("click", () => {
        const currentIndex = songs.indexOf(currentSong.src.split("/").pop());
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

Main();

