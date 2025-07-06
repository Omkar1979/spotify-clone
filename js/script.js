


let currentSong = new Audio();
let songs;
let currfolder;

async function getsongs(folder) {
    currfolder = folder;
    let baseURL = `./songs/${folder}/`;
    let a = await fetch(baseURL);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = element.getAttribute("href");
        if (href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
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
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });

    return songs;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `./songs/${currfolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "img/Pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let baseURL = "./songs/";
    let a = await fetch(baseURL);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        const parts = e.href.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];

        if (secondLast === "songs" && last !== "songs") {
            folder = last;

            let baseURL = `./songs/${folder}/info.json`;
            let a = await fetch(baseURL);
            let response = await a.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="30" fill="#1DB954" />
                            <polygon points="26,20 26,44 46,32" fill="black" />
                        </svg>
                    </div>
                    <img aria-hidden="false" draggable="false" loading="lazy" src="songs/${folder}/cover.jpg">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getsongs(items.currentTarget.dataset.folder);
        });
    });
}

async function Main() {
    await getsongs("cs");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/Pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
}

Main();
