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
//Recibe una lista de canciones y genera una tabla con las canciones que se le pasan
async function generarTablaCanciones(canciones) {
    let cont = document.getElementById('filas-canciones');
    cont.innerHTML=' ';
    //Generamos una fila dentro de la tabla con cada canción que hay
    canciones.forEach(async (cancion) => {
        let fila = document.createElement('tr');
        fila.id = 'fila-' + cancion.id;
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

        if (await isCancionFavorita(cancion.id)) {
            iconFav.classList.replace('bx-heart', 'bxs-heart');  // Cambiar el ícono a favorito
            iconFav.id = "fav";
        }

        celdaFav.appendChild(iconFav);


        fila.appendChild(celdaPlay);
        fila.appendChild(celdaTitle);
        fila.appendChild(celdaArtist);
        fila.appendChild(celdaDuracion);
        fila.appendChild(celdaFav);
        //Funciones de la fila
        fila.addEventListener('click', async (event) => {
            //Comprobamos que se haya clickado en el corazon, si se ha clicado ahí, cambiamos de fav a no fav, en caso contrario llamamos a la función que pone la canción y todo lo que este afecta.
            if (event.target.classList.contains('bx-heart') || event.target.classList.contains('bxs-heart')) {
                let icon = event.target;
                if (icon.id === "no-fav") {
                    // Cambiar a FAV
                    icon.id = "fav";
                    try {
                        await addCancion(cancion.id);
                        console.log(`Canción con ID ${cancion.id} añadida a favoritos.`);
                    } catch (error) {
                        console.error("Error al añadir a favoritos:", error);
                    }
                    icon.classList.replace('bx-heart', 'bxs-heart');
                } else if (icon.id === "fav") {
                    // Cambiar a NO-FAV
                    icon.id = "no-fav";
                    icon.classList.replace('bxs-heart', 'bx-heart');
                    try {
                        await deleteCancion(cancion.id);
                        console.log(`Canción con ID ${cancion.id} eliminada de favoritos.`);
                    } catch (error) {
                        console.error("Error al eliminar de favoritos:", error);
                    }
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
//Devuelve la primera cancion
async function getCancionPrimera() {
    let canciones = await getCanciones();
    return canciones[0];
}
//Devuelve la ultima cancion
async function getCancionUltima() {
    let canciones = await getCanciones();
    return canciones[canciones.length - 1];
}
//Devuelve una cancion random
async function getCancionRandom() {
    let canciones = await getCanciones();
    let ran = Math.floor(Math.random() * canciones.length);
    return canciones[ran];
}
//Devuelve la cancion actual
async function getCancionActual() {
    let botonesPlayPause = document.querySelectorAll('.bx-pause');
    let cancionActual = null;

    botonesPlayPause.forEach(boton => {
        let idCancion = parseInt(boton.id.replace('play-', ''));
        if (!isNaN(idCancion)) {
            cancionActual = idCancion;
        }
    });

    if (cancionActual !== null) {
        let cancion = await getCancionByID(cancionActual);
        return cancion;
    }
}
//Funcion que hace que la cancion que se indique empieze a sonar
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
    if (icono.classList.contains('bx-play')) {
        //Si es la misma cancion no volvemos a asignar el src, ni cambiamos la duracion total
        //Si es la misma pero ha terminado, hacemos todo
        if (document.getElementById('repeat').classList.contains('icons-verdes')) {
            // Si está en modo repetición, reiniciamos el audio
            audio.src = cancion.filepath;
            audio.play();
        } else if (audio.src !== cancion.filepath) {
            // Si no está en modo repetición, o la cancion es distinta, hacemos todo
            audio.src = cancion.filepath;
            let duracion = new Audio(cancion.filepath);
            duracion.addEventListener('loadedmetadata', () => {
                let minutos = Math.floor(duracion.duration / 60);
                let segundos = Math.floor(duracion.duration % 60).toString().padStart(2, '0');
                document.getElementById('duracion-total').textContent = `${minutos}:${segundos}`;
            });
            audio.play();
        }
        //Ponemos la canción
        icono.classList.replace('bx-play', 'bx-pause');
        icono.id = 'play-' + cancion.id;
        document.getElementById('fila-' + cancion.id).focus();
        //Cambiamos el texto del botón del botón de arriba
        document.getElementById('btn-play').textContent = 'Pausar';
        document.getElementById('btn-play').disabled = false;
        document.getElementById('song-play').classList.replace('bx-play-circle', 'bx-pause-circle');
        document.getElementById('audio').play();
    } else {
        //Pausamos la canción
        icono.classList.replace('bx-pause', 'bx-play');
        icono.id = 'pause-' + cancion.id;
        document.getElementById('btn-play').textContent = 'Reproducir';
        document.getElementById('song-play').classList.replace('bx-pause-circle', 'bx-play-circle');
        document.getElementById('audio').pause();
    }

    document.getElementById('audio').onended = async () => {
        let siguienteCancion;
        // Comprobamos qué modo está activo
        if (document.getElementById('song-rand').classList.contains('icons-verdes')) {
            siguienteCancion = await getCancionRandom(); // Esperar correctamente
        } else if (document.getElementById('repeat').classList.contains('icons-verdes')) {
            audio.currentTime = 0;
            audio.play();
            siguienteCancion = cancion;
        } else {
            // Obtener la siguiente canción por ID
            siguienteCancion = await getCancionByID(cancion.id + 1);
            // Si no hay siguiente canción, volvemos a la primera
            if (!siguienteCancion) {
                siguienteCancion = await getCancionPrimera();
            }
        }

        if (siguienteCancion && siguienteCancion !== cancion) {
            playCancion(siguienteCancion);
        }
    };


    document.getElementById('cancion-img').src = cancion.cover;
    document.getElementById('foot-artist').textContent = cancion.artist;
    document.getElementById('foot-song').textContent = cancion.title;

}
//Funcion que controlar el volumen de la cancion
document.getElementById('volume-control').addEventListener('input', () => {
    let volumen = event.target.value;
    //Cambiamos el icono de volumen en función del volumen que se quiera
    if (volumen > 0.99) {
        document.getElementById('volumen-i').classList.remove('bxs-volume-low');
        document.getElementById('volumen-i').classList.add('bxs-volume-full');
    } else if (volumen < 0.01) {
        document.getElementById('volumen-i').classList.remove('bxs-volume-low');
        document.getElementById('volumen-i').classList.add('bxs-volume-mute');
    } else {
        document.getElementById('volumen-i').classList.remove('bxs-volume-mute');
        document.getElementById('volumen-i').classList.remove('bxs-volume-full');
        document.getElementById('volumen-i').classList.add('bxs-volume-low');
    }
    //Cambiamos el volumen de la canción
    document.getElementById('audio').volume = volumen;
    document.getElementById('volume-control').style.background = `linear-gradient(90deg, var(--bg-main) ${volumen * 100}%, #dddddd ${volumen * 100}%)`;
});
//Según avanza la canción, avanza la canción , cambia la barra de progreso
//Tambien cambiamos el segundo y el minuto actual de la cancion
document.getElementById('audio').ontimeupdate = () => {
    let barraProgreso = document.getElementById('song-length');
    let cancion = document.getElementById('audio');
    barraProgreso.max = Math.floor(cancion.duration);
    barraProgreso.value = cancion.currentTime;
    let porcentaje = (cancion.currentTime / cancion.duration) * 100;
    barraProgreso.style.background = `linear-gradient(90deg, var(--bg-main) ${porcentaje}%, #dddddd ${porcentaje}%)`;
    let minutos = Math.floor(cancion.currentTime / 60);
    let segundos = Math.floor(cancion.currentTime % 60).toString().padStart(2, '0');
    document.getElementById('duracion-act').textContent = `${minutos}:${segundos}`;
};
//Cuando se mueva la barra de la canción, cambiaremos el punto en el que nos encontramos de la canción
document.getElementById('song-length').addEventListener('input', (event) => {
    let segundo = event.target.value;
    let cancion = document.getElementById('audio');
    //Hago esto para que cuando se cambie el segundo de la canción en la barra la canción no se acelere y se disimule
    cancion.pause();
    cancion.currentTime = segundo;
    setTimeout(() => {
        cancion.play()
    }, 500);
});
//Se genera la tabla de canciones una se ha cargado la pagina
document.addEventListener('DOMContentLoaded', async() => {
    let canciones = await getCanciones();
    generarTablaCanciones(canciones);
});
//Funcion para que el boton de arriba a la derecha pueda pausar o no la cancion
document.getElementById('btn-play').addEventListener('click', async () => {
    let audio = document.getElementById('audio');
    let cancion = await getCancionActual();
    let iconPlayPause = document.getElementById('song-play');
    let btnPlayPause = document.getElementById('btn-play');
    let botonesPlayPause = document.querySelectorAll('.bx-pause');
    if (audio.paused) {
        // Reproducir la canción 
        audio.play();
        botonesPlayPause.forEach(boton => {
            if (boton.id === 'play-' + cancion.id) {
                boton.classList.replace('bx-play', 'bx-pause');
                boton.id = 'pause-' + cancion.id;
            }
        });
        btnPlayPause.textContent = 'Pausar';
        iconPlayPause.classList.replace('bx-play-circle', 'bx-pause-circle');
    } else {
        // Pausar la canción 
        audio.pause();
        botonesPlayPause.forEach(boton => {
                boton.classList.replace('bx-pause', 'bx-play');
                boton.id = 'play-' + cancion.id;
        });
        iconPlayPause.classList.replace('bx-pause-circle', 'bx-play-circle');
        btnPlayPause.textContent = 'Reproducir';
    }
});
//Funcion para que el boton de la barra de abajo pueda o no pausar la cancion
document.getElementById('song-play').addEventListener('click', async () => {
    let audio = document.getElementById('audio');
    let cancion = await getCancionActual();
    let iconPlayPause = document.getElementById('song-play');
    let btnPlayPause = document.getElementById('btn-play');
    let botonesPlayPause = document.querySelectorAll('.bx-pause');
    let audioSRC=audio.src.split('index.html');
    //Si la cancion tiene una ruta, es que hay una cancion sonado, por lo tanto este boton puede funcionar
    if (audioSRC[1]!=='#') {
        if (audio.paused) {
            // Reproducir la canción 
            audio.play();
            botonesPlayPause.forEach(boton => {
                if (boton.id === 'play-' + cancion.id) {
                    boton.classList.replace('bx-play', 'bx-pause');
                    boton.id = 'pause-' + cancion.id;
                }
            });
            iconPlayPause.classList.replace('bx-play-circle', 'bx-pause-circle');
            btnPlayPause.textContent = 'Pausar';
        } else {
            // Pausar la canción 
            audio.pause();
            botonesPlayPause.forEach(boton => {
                    boton.classList.replace('bx-pause', 'bx-play');
                    boton.id = 'play-' + cancion.id; 
            });
            iconPlayPause.classList.replace('bx-pause-circle', 'bx-play-circle');
            btnPlayPause.textContent = 'Reproducir';
        }
    }
});
//Eventos que controlar que iconos de la barra de acciones esta activo, esto se comprueba con la clase icons-verdes
//Si esa clase esta activa, significa que se quiere que se repita la cancion o que esten en random
//No se pueden tener activos los 2 a la vez, por eso si se quiere intentar, se quita uno y se pone el otro
document.getElementById('repeat').addEventListener('click', (event) => {
    if (document.getElementById('song-rand').classList.contains('icons-verdes')) {
        document.getElementById('song-rand').classList.remove('icons-verdes');
    }
    event.target.classList.toggle('icons-verdes');
});

document.getElementById('song-rand').addEventListener('click', (event) => {
    if (document.getElementById('repeat').classList.contains('icons-verdes')) {
        document.getElementById('repeat').classList.remove('icons-verdes');
    }
    event.target.classList.toggle('icons-verdes');
});
//Evento para ir a la cancion anterior
document.getElementById('song-prev').addEventListener('click', async () => {
    let actu = await getCancionActual();
    // Si no hay canción actual, no hacer nada
    if (actu) {
        let last = await getCancionUltima();
        let primera = await getCancionPrimera();
        if (actu.id === primera.id) {
            playCancion(last);
        } else {
            let prev = await getCancionByID(actu.id - 1);
            playCancion(prev);
        }
    }
});
//Evento para ir a la cancion siguiente
document.getElementById('song-next').addEventListener('click', async () => {
    let actu = await getCancionActual();
    if (actu) {
        let last = await getCancionUltima();
        let primera = await getCancionPrimera();
        if (actu.id === last.id) {
            playCancion(primera);
        } else {
            let next = await getCancionByID(actu.id + 1);
            playCancion(next);
        }
    }
});
//Muestra todas las canciones que hay
document.getElementById('filter-all').addEventListener('click', async() => {
    let canciones = await getCanciones();
    generarTablaCanciones(canciones);
});
//Filtro de las canciones en favorito, usando indexdb
document.getElementById('filter-fav').addEventListener('click', async () => {
    let cancionesID = await obtenerCancionesDeIndexDB();
    let cancionesPromises = cancionesID.map(async (cancionID) => {
        return await getCancionByID(cancionID.id);
    });
    let canciones = await Promise.all(cancionesPromises);
    
    generarTablaCanciones(canciones);
});
let db;
//Creacion de la base de datos
function crearBD() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("cancionesFAV", 1);

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains("canciones")) {
                //La unica clave va a ser el ID de las canciones
                db.createObjectStore("canciones", { keyPath: "id" });
            }
        };
    });
}
crearBD();
//Anadimos cancion con su ID
async function addCancion(id) {
    if (!db) {
        throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction('canciones', "readwrite");
        let objectStore = transaction.objectStore('canciones');
        //Anadimos directamente el ID de la cancion cuando se ponga en favoritos
        let request = objectStore.add({ id });

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
//Eliminamos una cancion por su ID
async function deleteCancion(id) {
    if (!db) {
        throw new Error("La base de datos no está abierta. Llama a crearBD primero.");
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction("canciones", "readwrite");
        let objectStore = transaction.objectStore("canciones");

        // Intentar borrar el ID proporcionado
        let request = objectStore.delete(id);

        request.onsuccess = () => {
            resolve(`La canción con ID ${id} fue eliminada con éxito.`);
        };

        request.onerror = (event) => {
            reject(`No se pudo eliminar la canción con ID ${id}. Error: ${event.target.error}`);
        };
    });
}
//Devuelve si una cancion esta en favoritos o no
async function isCancionFavorita(cancionID) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction("canciones", "readonly");
        let objectStore = transaction.objectStore("canciones");
        let request = objectStore.get(cancionID);

        request.onsuccess = (event) => {
            if (event.target.result) {
                resolve(true);  // La canción está en favoritos
            } else {
                resolve(false); // La canción no está en favoritos
            }
        };

        request.onerror = (event) => {
            reject("Error al comprobar si la canción es favorita");
        };
    });
}
//Funcion para abrir la indexdb o sino no me deja obtener todas las canciones que estan en indexDB
function abrirBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("cancionesFAV", 1);

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            // Aquí defines las versiones y estructuras de la base de datos
            const db = event.target.result;
            if (!db.objectStoreNames.contains("canciones")) {
                db.createObjectStore("canciones", { keyPath: "id" });
            }
        };
    });
}
//Obtenemos todas las canciones del indexdb, es decir todas las favoritas
async function obtenerCancionesDeIndexDB() {
    if (!db) {
        await abrirBaseDeDatos(); // Asegúrate de que la base de datos esté abierta
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction("canciones", "readwrite");
        let objectStore = transaction.objectStore("canciones");
        let request = objectStore.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
//Funcion para mostrar la modal en pantalla
document.getElementById('show-modal').addEventListener('click', (event) => {
    event.stopPropagation(); // Evitar que el clic en el botón se propague al contenedor
    document.getElementById('modal').classList.add('show');
    document.getElementById('container').classList.add('blur-background');
    document.getElementById('footer').classList.add('blur-background');
});
//Funcion para cerrar el modal con el icono de cerrar
document.getElementById('close-modal').addEventListener('click', (event) => {
    event.stopPropagation(); // Evitar que el clic se propague
    setTimeout(() =>{
        document.getElementById('modal').classList.remove('show');
        document.getElementById('container').classList.remove('blur-background');
        document.getElementById('footer').classList.remove('blur-background');
    } , 100);
});
//Funcion para cerrar el modal al hacer click fuera
document.getElementById('container').addEventListener('click',()=>{
    //Comprobamos que el modal se este viendo con la clase de .show
    if (document.getElementById('modal').classList.contains('show')) {
        setTimeout(() =>{
            document.getElementById('modal').classList.remove('show');
            document.getElementById('container').classList.remove('blur-background');
            document.getElementById('footer').classList.remove('blur-background');
        } , 100);
    }
});
// Evitar que el clic dentro del modal cierre el modal
document.getElementById('modal').addEventListener('click', (event) => {
    event.stopPropagation();
});
//Funcion para comprobar que se ha subido un archivo .mp3
function checkCancionAudio(element) {
    let re = /\.mp3$/i;
    if (element.value.trim() !== "") {
        if (re.test(element.value)) {
            cambiarColor(element, true);
        } else {
            cambiarColor(element, false);
        }
    }
}
//Funcion para comprobar que se ha introducido un artista cumpliendo los requisitos
function checkCancionTitulo(element) {
    let re = /^[A-Za-z\s]{1,20}$/;
    if (element.value.trim() !== "") {
        if (re.test(element.value)) {
            cambiarColor(element, true);
        } else {
            cambiarColor(element, false);
        }
    }
}
//Funcion para comprobar que se ha introducido el nombre de una cancion cumpliendo los requisitos
function checkCancionArtista(element) {
    let re = /^[A-Za-z\s]{1,20}$/;
    if (element.value.trim() !== "") {
        if (re.test(element.value)) {
            cambiarColor(element, true);
        } else {
            cambiarColor(element, false);
        }
    }
}
//Funcion para comprobar que se ha subido un archivo .png o .jpg
function checkCancionCover(element) {
    let re = /\.(png|jpg)$/i;
    if (element.value.trim() !== "") {
        if (re.test(element.value)) {
            cambiarColor(element, true);
        } else {
            cambiarColor(element, false);
        }
    }
}
//Funcion para cambiar el color de los campos dependiendo si estan correctos o no
function cambiarColor(elemento,tipo) {
    if (tipo) {
        elemento.setAttribute('class','bien');
    }else{
        elemento.setAttribute('class','mal');
    }
}
//Evento para que cuando se haga click en subir, que se compruebe si todo esta correcto y luego subir la cancion
document.getElementById('user-song-upload').addEventListener('click',()=>{
    checkAllFields();
});
//Comprobamos todos los campos del modal y subir la cancion si todo esta correcto
function checkAllFields() {
    checkCancionAudio(document.getElementById('user-song-link'));
    checkCancionTitulo(document.getElementById('user-song-title'));
    checkCancionArtista(document.getElementById('user-song-artist'));
    checkCancionCover(document.getElementById('user-song-cover'));

    let allFieldsValid = true;
    
    // Verifica si todos los campos tienen la clase "bien"
    let fields = ['user-song-link', 'user-song-title', 'user-song-artist','user-song-cover'];
    fields.forEach((fieldId) => {
        let field = document.getElementById(fieldId);
        if (!field.classList.contains('bien')) {
            allFieldsValid = false;
        }
    });
    if (allFieldsValid) {
        //Todos los campos son correctos
        //Si todos son correctos, lo subimos al servidor
        uploadSong();
    } else {
        //Si todos los campos no son validos se manda un alert de que algun campo es incorrecto
        alert("Algun campo introducido no es valido");
    }
}
//Funcion para subir la cancion al servidor
async function uploadSong() {
    const apiUrl = "http://informatica.iesalbarregas.com:7008/upload/";

    let formData = new FormData();

    formData.append("music", document.getElementById('user-song-link').files[0]);
    formData.append("title", document.getElementById('user-song-title').value);
    formData.append("artist", document.getElementById('user-song-artist').value);
    formData.append("cover", document.getElementById('user-song-cover').files[0]);

    try {    
        const response = await fetch(apiUrl,{
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const data = await response.json();
        // Recargar la página después de una subida exitosa
        window.location.reload();
        
    } catch (error) {
        console.error('Error al obtener al subir la cancion:', error);
    }
}