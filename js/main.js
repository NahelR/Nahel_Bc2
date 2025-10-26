// js/main.js (Corregido y Final)

document.addEventListener('DOMContentLoaded', () => {

    // --- CÓDIGO DE PROTECCIÓN ---
    async function protegerRutaAsignatura() {
        // CORRECCIÓN: Usar la variable 'supabase' consistente con supabaseClient.js
        if (typeof supabase === 'undefined') { console.error('Supabase client no definido'); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'user-login.html';
        } else {
            // Solo cargar datos si la sesión es válida
            cargarDatosIniciales();
        }
    }
    // --- FIN CÓDIGO DE PROTECCIÓN ---

    const navSemanas = document.getElementById('nav-semanas');
    const contenedorTrabajos = document.getElementById('contenedor-trabajos');
    const modal = document.getElementById('file-viewer-modal');
    const modalBody = document.getElementById('modal-body-container');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.querySelector('.modal-header span');
    let allTrabajos = [];

    function mostrarTrabajos(semana) {
        // ... (el resto de la función mostrarTrabajos se mantiene igual)
        contenedorTrabajos.innerHTML = '';
        document.querySelectorAll('#nav-semanas a').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`#nav-semanas a[data-semana="${semana}"]`);
        if (activeLink) activeLink.classList.add('active');
        const trabajosDeLaSemana = allTrabajos.filter(trabajo => trabajo.semana == semana);
        if (trabajosDeLaSemana.length === 0) {
            contenedorTrabajos.innerHTML = '<p>No hay trabajos para esta semana.</p>'; return;
        }
        trabajosDeLaSemana.forEach(trabajo => {
            const card = document.createElement('div');
            card.className = 'trabajo-card-v2';
            card.innerHTML = `<div class="card-content"><h4>${trabajo.titulo}</h4><p>${trabajo.descripcion}</p><div class="card-actions"><a href="${trabajo.url_descarga}" class="btn btn-descargar" target="_blank">Descargar</a><button class="btn btn-ver" data-url="${trabajo.url_descarga}" data-titulo="${trabajo.titulo}">Ver</button></div></div>`;
            contenedorTrabajos.appendChild(card);
        });
    }

    async function cargarDatosIniciales() {
        // CORRECCIÓN: Usar la variable 'supabase'
        if (typeof supabase === 'undefined') { console.error('Supabase client no definido'); return; }
        const { data, error } = await supabase.from('trabajos').select('*').order('semana', { ascending: true });
        // ... (el resto de la función cargarDatosIniciales se mantiene igual)
        if (error) { console.error('Error al cargar trabajos:', error); return; }
        allTrabajos = data;
        const semanasConTrabajos = [...new Set(allTrabajos.map(t => t.semana))].sort((a,b) => a - b);
        navSemanas.innerHTML = '';
        if (semanasConTrabajos.length > 0) {
            semanasConTrabajos.forEach(semanaNum => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = `Semana ${semanaNum}`;
                link.dataset.semana = semanaNum;
                navSemanas.appendChild(link);
            });
            mostrarTrabajos(semanasConTrabajos[0]);
        } else {
            navSemanas.innerHTML = '<p>No hay semanas con trabajos.</p>';
            contenedorTrabajos.innerHTML = '<p>Aún no hay trabajos para mostrar.</p>';
        }
    }
    
    if (navSemanas) {
        navSemanas.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'A' && e.target.dataset.semana) {
                mostrarTrabajos(e.target.dataset.semana);
            }
        });
    }

    if (contenedorTrabajos) {
        contenedorTrabajos.addEventListener('click', async (e) => {
            // ... (la lógica de 'Ver' y 'Descargar' se mantiene igual)
             if (e.target.classList.contains('btn-ver')) {
                const fileUrl = e.target.dataset.url;
                const fileTitle = e.target.dataset.titulo;
                if (!fileUrl) { alert('No hay un archivo para visualizar.'); return; }
                modalTitle.textContent = `Vista Previa: ${fileTitle}`;
                modalBody.innerHTML = '';
                const isImage = fileUrl.toLowerCase().endsWith('.png') || fileUrl.toLowerCase().endsWith('.jpg') || fileUrl.toLowerCase().endsWith('.jpeg');
                if (isImage) {
                    const img = document.createElement('img');
                    img.src = fileUrl;
                    modalBody.appendChild(img);
                } else {
                    const iframe = document.createElement('iframe');
                    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
                    if (isPdf) {
                        iframe.src = fileUrl;
                    } else {
                        const encodedUrl = encodeURIComponent(fileUrl);
                        iframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
                    }
                    modalBody.appendChild(iframe);
                }
                modal.classList.add('visible');
            }
            if (e.target.classList.contains('btn-descargar')) {
                e.preventDefault();
                const url = e.target.href;
                const originalText = e.target.textContent;
                try {
                    e.target.textContent = 'Descargando...';
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const tempLink = document.createElement('a');
                    tempLink.style.display = 'none';
                    tempLink.href = blobUrl;
                    const filename = url.substring(url.lastIndexOf('/') + 1);
                    tempLink.setAttribute('download', filename);
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                    window.URL.revokeObjectURL(blobUrl);
                    e.target.textContent = originalText;
                } catch (error) {
                    console.error('Error al descargar:', error);
                    alert('No se pudo descargar el archivo.');
                    e.target.textContent = originalText;
                }
            }
        });
    }

    if (modal) {
        const closeModal = () => { modal.classList.remove('visible'); modalBody.innerHTML = ''; };
        closeButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    // LLAMADA A LA PROTECCIÓN (que llamará a cargarDatosIniciales si hay sesión)
    protegerRutaAsignatura();
    
    // BORRAR ESTA LÍNEA (ya no es necesaria aquí)
    // cargarDatosIniciales(); 
});