//Menú dropdown de los filtros
document.getElementById('filter-drop').addEventListener('click', () => {
    let icon = document.getElementById('filter-arrow');
    let all = document.getElementById('filter-all');
    let fav = document.getElementById('filter-fav');
    if (icon.classList.contains("bxs-right-arrow")) {
        icon.classList.remove("bxs-right-arrow");
        icon.classList.add("bxs-down-arrow");
        all.classList.remove("display-none");
        fav.classList.remove("display-none");
    } else {
        icon.classList.remove("bxs-down-arrow");
        icon.classList.add("bxs-right-arrow");
        all.classList.add("display-none");
        fav.classList.add("display-none");
    }
});

//Obtener todas las canciones
async function getCanciones() {
    const apiUrl = "http://informatica.iesalbarregas.com:7008/songs/";

    const myHeaders = {
        "Content-Type": "application/json",
    };

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: myHeaders,
        });
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error al obtener las canciones:', error);
    }
}

/*
Formato JSON del get
artist: "artista 01"
cover: "http://informatica.iesalbarregas.com:7008/uploads/1732813324085.jpeg"
filename: "1732813323005.mp3"
filepath: "http://informatica.iesalbarregas.com:7008/uploads/1732813323005.mp3"
id: 4
title: "prueba"
*/

async function generarTablaCanciones() {
    let cont = document.getElementById('filas-canciones');
    let canciones = await getCanciones();
    //Generamos una fila dentro de la tabla con cada canción que hay
    canciones.forEach(cancion => {
        let fila = document.createElement('tr');
        fila.id='fila-'+cancion.id;
        fila.setAttribute('tabindex', '-1'); 

        let celdaPlay = document.createElement('td');
        let botonPlay = document.createElement('div');
        botonPlay.classList.add('btn');
        let iconoPlay = document.createElement('i');
        iconoPlay.classList.add('bx', 'bx-play');
        iconoPlay.id = "pause-" + cancion.id;
        botonPlay.appendChild(iconoPlay);
        celdaPlay.appendChild(botonPlay);


        let celdaTitle = document.createElement('td');
        celdaTitle.textContent = cancion.title;
        celdaTitle.classList.add('song-left');

        let celdaArtist = document.createElement('td');
        celdaArtist.textContent = cancion.artist;
        celdaArtist.classList.add('song-left');

        let celdaDuracion = document.createElement('td');
        let duracion = new Audio(cancion.filepath);
        duracion.addEventListener('loadedmetadata', () => {
            let minutos = Math.floor(duracion.duration / 60);
            let segundos = Math.floor(duracion.duration % 60).toString().padStart(2, '0');
            celdaDuracion.textContent = `${minutos}:${segundos}`;
        });

        let celdaFav = document.createElement('td');
        let iconFav = document.createElement('i');
        iconFav.classList.add('bx', 'bx-heart');
        iconFav.id = "no-fav";

        celdaFav.appendChild(iconFav);


        fila.appendChild(celdaPlay);
        fila.appendChild(celdaTitle);
        fila.appendChild(celdaArtist);
        fila.appendChild(celdaDuracion);
        fila.appendChild(celdaFav);
        //Funciones de la fila
        fila.addEventListener('click', (event) => {
            //Comprobamos que se haya clickado en el corazon, si se ha clicado ahí, cambiamos de fav a no fav, en caso contrario llamamos a la función que pone la canción y todo lo que este afecta.
            if (event.target.classList.contains('bx-heart') || event.target.classList.contains('bxs-heart')) {
                let icon = event.target;

                if (icon.id === "no-fav") {
                    // Cambiar a FAV
                    icon.id = "fav";
                    icon.classList.replace('bx-heart', 'bxs-heart');
                } else if (icon.id === "fav") {
                    // Cambiar a NO-FAV
                    icon.id = "no-fav";
                    icon.classList.replace('bxs-heart', 'bx-heart');
                }
            } else {
                playCancion(cancion);
            }
        });

        cont.appendChild(fila);
    });

}

//Función que recibe un id y devuelve la canción que tiene ese ID
async function getCancionByID(cancionID) {
    let canciones = await getCanciones();
    let cancionByID;
    canciones.forEach(cancion => {
        if (cancion.id === cancionID) {
            //Si el ID de la canción coincide con el que le hemos pasado, nos devulve la canción.
            cancionByID = cancion;
        }
    });
    return cancionByID;
}

async function playCancion(cancion) {
    //Antes de cambiar el botón de play, recorremos todos los botones de play y si hay alguno activo lo cambiamos
    let botonesPlayPause = document.querySelectorAll('.bx-pause');
    botonesPlayPause.forEach(boton => {
        if (boton.id !== 'play-' + cancion.id) {
            boton.classList.replace('bx-pause', 'bx-play');
            boton.id = boton.id.replace('play-', 'pause-');
        }
    });

    //Cuando se haga click en la fila, hacemos que el icono del botón pase de play a pause y se pone la canción
    let icono = document.getElementById('pause-' + cancion.id) || document.getElementById('play-' + cancion.id);
    if (icono.classList.contains('bx-play') || document.getElementById('btn-play')) {
        //Ponemos la canción
        icono.classList.replace('bx-play', 'bx-pause');
        icono.id = 'play-' + cancion.id;
        document.getElementById('fila-' + cancion.id).focus();
        document.getElementById('audio').src= cancion.filepath;
        //Cambiamos el texto del botón del botón de arriba
        document.getElementById('btn-play').textContent='Pausar';
        document.getElementById('audio').play();
    } else {
        //Pausamos la canción
        icono.classList.replace('bx-pause', 'bx-play');
        icono.id = 'pause-' + cancion.id;
        document.getElementById('btn-pause').textContent='Reproducir';
        document.getElementById('audio').pause();
    }

    document.getElementById('audio').onended = async () => {
        // Obtenemos la siguiente canción
        let siguienteCancion = await getCancionByID(cancion.id + 1);
    
        if (siguienteCancion) {
            playCancion(siguienteCancion);
        } else {
            document.getElementById('audio').src = "";
        }
    };
    
    document.getElementById('cancion-img').src=cancion.cover;
    document.getElementById('foot-artist').textContent=cancion.artist;
    document.getElementById('foot-song').textContent=cancion.title;

}

document.getElementById('volume-control').addEventListener('input',()=>{
    let volumen = event.target.value;
    //Cambiamos el icono de volumen en función del volumen que se quiera
    if (volumen >0.99) {
        document.getElementById('volumen-i').classList.remove('bxs-volume-low');
        document.getElementById('volumen-i').classList.add('bxs-volume-full');
    }else if(volumen<0.01){
        document.getElementById('volumen-i').classList.remove('bxs-volume-low');
        document.getElementById('volumen-i').classList.add('bxs-volume-mute');
    }else{
        document.getElementById('volumen-i').classList.remove('bxs-volume-mute');
        document.getElementById('volumen-i').classList.remove('bxs-volume-full');
        document.getElementById('volumen-i').classList.add('bxs-volume-low');
    }
    //Cambiamos el volumen de la canción
    document.getElementById('audio').volume= volumen;
});

//Según avanza la canción, avanza la canción , cambia la barra de progreso
document.getElementById('audio').ontimeupdate = ()=>{
    let barraProgreso = document.getElementById('song-length');
    let cancion = document.getElementById('audio');
    barraProgreso.max= Math.floor(cancion.duration);
    barraProgreso.value=cancion.currentTime;
};

//Cuando se mueva la barra de la canción, cambiaremos el punto en el que nos encontramos de la canción
document.getElementById('song-length').addEventListener('input',(event)=>{
    let segundo = event.target.value;
    let cancion = document.getElementById('audio');
    //Hago esto para que cuando se cambie el segundo de la canción en la barra la canción no se acelere y se disimule
    cancion.pause();
    cancion.currentTime = segundo;
    setTimeout(() => {
        cancion.play()
    }, 500);
});

document.addEventListener('DOMContentLoaded', () => {
    generarTablaCanciones();
});

document.getElementById('btn-play').addEventListener('click', async () => {
    let audio = document.getElementById('audio');
    let btnPlayPause = document.getElementById('btn-play') || document.getElementById('btn-pause');
    console.log(cancionSonado());
    // Si no hay una canción sonando, ponemos la primera canción
    if (audio.src === currentUrl) {
        let canciones = await getCanciones();
        console.log(canciones);
        playCancion(canciones[0]);
    } else if (audio.paused) {
        // Reproducir la canción 
        //audio.play();
        btnPlayPause.textContent = 'Pausar';
    } else {
        // Pausar la canción 
        //audio.pause();
        btnPlayPause.textContent = 'Reproducir';
    }
});


function cancionSonado() {
    let sonando=false;
    let botonesPlayPause = document.querySelectorAll('.bx-pause');
if (botonesPlayPause.length > 0) {
    sonando=true;
} 
return sonando;
}