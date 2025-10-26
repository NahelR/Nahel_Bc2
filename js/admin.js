// js/admin.js (VERSIÓN LIMPIA Y SIMPLIFICADA - SOLO PARA DIAGNÓSTICO)
document.addEventListener('DOMContentLoaded', () => {
    console.log("admin.js cargado v_diagnostico_limpio");

    const loginForm = document.getElementById('login-form');
    // --- Necesitamos definir las otras variables si protegerRutaAdmin las usa ---
    const adminEmail = 'nahel@gmail.com'.toLowerCase();
    const adminTrabajosLista = document.getElementById('admin-trabajos-lista');
    const uploadForm = document.getElementById('upload-form');
    const archivoInput = document.getElementById('archivo');
    const fileNameDisplay = document.getElementById('file-name-display');
    const logoutButton = document.getElementById('logout-button'); // Para admin.html

    // --- MANEJO DEL FORMULARIO DE LOGIN (SIMPLIFICADO) ---
    if (loginForm) {
        console.log("[Login Handler] Formulario encontrado.");
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("[Login Handler] Submit detectado.");

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const email = emailInput.value;
            const password = passwordInput.value;
            const errorMessageElement = document.getElementById('error-message');
            if (errorMessageElement) errorMessageElement.textContent = '';

            if (typeof supabase === 'undefined') {
                console.error('[Login Handler] ERROR: Supabase no definido.');
                if (errorMessageElement) errorMessageElement.textContent = 'Error: Conexión.';
                return;
            }

            try {
                console.log("[Login Handler] Intentando signInWithPassword...");
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                console.log("[Login Handler] Resultado recibido.");

                if (error) {
                    console.error('[Login Handler] Error de Supabase en signIn:', error);
                    if (errorMessageElement) errorMessageElement.textContent = `Error: ${error.message || 'Credenciales inválidas'}`;
                } else {
                    // *** SIMPLIFICACIÓN: Redirigir SIEMPRE si no hay error ***
                    console.log('[Login Handler] signIn exitoso. Intentando redirección INMEDIATA a admin.html...');
                    // Intenta la redirección
                    window.location.assign('admin.html'); // Usamos assign() como alternativa
                    console.log('[Login Handler] Redirección con assign() iniciada.');
                }
            } catch (catchError) {
                // Captura cualquier otro error en el proceso
                console.error('[Login Handler] ERROR INESPERADO (catch principal):', catchError);
                if (errorMessageElement) errorMessageElement.textContent = 'Error inesperado (catch). Revisa consola.';
            }
        });
    }

    // --- FUNCIONES Y LÓGICA PARA LA PÁGINA admin.html ---
    // (Asegúrate de que el resto del código: protegerRutaAdmin, cargarTrabajosAdmin, etc., esté aquí)
     async function protegerRutaAdmin() {
        console.log("[Admin Page] Verificando acceso...");
        if (typeof supabase === 'undefined') { console.error('[Admin Page] Supabase no definido'); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.log("[Admin Page] No hay sesión, redirigiendo a login.html");
            window.location.assign('login.html'); // Usar assign() aquí también
            return;
        }
        console.log("[Admin Page] Sesión encontrada:", session.user.email);
        if (session.user.email.toLowerCase() !== adminEmail) {
           console.warn("[Admin Page] Usuario NO es admin. Cerrando sesión...");
           alert('Acceso denegado. Solo administradores.');
           await supabase.auth.signOut();
           window.location.assign('index.html'); // Usar assign()
        } else {
             console.log("[Admin Page] Usuario es admin. Cargando trabajos...");
             cargarTrabajosAdmin();
        }
    }

     async function cargarTrabajosAdmin() {
        if (!adminTrabajosLista) { console.log("[Admin Page] #admin-trabajos-lista no existe."); return; }
        console.log("[Admin Page] Cargando trabajos...");
        if (typeof supabase === 'undefined') { console.error('[Admin Page] Supabase no definido'); return; }
        const { data, error } = await supabase.from('trabajos').select('*').order('semana', { ascending: true });
        if (error) { console.error('[Admin Page] Error cargando trabajos:', error); return; }
        adminTrabajosLista.innerHTML = '';
        data.forEach(trabajo => {
            const card = document.createElement('div');
            card.className = 'admin-trabajo-card';
            card.innerHTML = `<div class="trabajo-info"><strong>${trabajo.titulo}</strong> (Semana ${trabajo.semana})</div><button class="btn-danger" data-id="${trabajo.id}" data-file="${trabajo.nombre_archivo}">Eliminar</button>`;
            adminTrabajosLista.appendChild(card);
        });
        console.log("[Admin Page] Trabajos cargados.");
    }

     if (uploadForm) { /* ... lógica de subida ... */
        console.log("[Admin Page] Formulario de subida encontrado.");
        const semanaSelect = document.getElementById('semana');
        if (semanaSelect && semanaSelect.options.length <= 1) {
            for (let i = 1; i <= 16; i++) { semanaSelect.innerHTML += `<option value="${i}">Semana ${i}</option>`; }
        }
        uploadForm.addEventListener('submit', async (e) => {
             e.preventDefault();
            console.log("[Admin Page] Intentando subir...");
            if (typeof supabase === 'undefined') { console.error('[Admin Page] Supabase no definido'); return; }
            const titulo = document.getElementById('titulo').value;
            const descripcion = document.getElementById('descripcion').value;
            const semana = document.getElementById('semana').value;
            const archivo = document.getElementById('archivo').files[0];
            if (!archivo || !semana) { alert('Por favor, completa todos los campos.'); return; }
            const nombreArchivo = `semana-${semana}/${Date.now()}-${archivo.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('archivos-trabajos').upload(nombreArchivo, archivo);
            if (uploadError) { console.error('[Admin Page] Error subiendo archivo:', uploadError); alert('Error al subir el archivo.'); return; }
            const { data: urlData } = supabase.storage.from('archivos-trabajos').getPublicUrl(uploadData.path);
            const { error: dbError } = await supabase.from('trabajos').insert({ titulo, descripcion, semana, url_descarga: urlData.publicUrl, nombre_archivo: nombreArchivo });
            if (dbError) { console.error('[Admin Page] Error guardando en DB:', dbError); alert('Error al guardar la información.'); } else {
                alert('Trabajo agregado con éxito!');
                uploadForm.reset();
                if (fileNameDisplay) { fileNameDisplay.textContent = 'Seleccionar archivo...'; }
                cargarTrabajosAdmin();
                console.log("[Admin Page] Subida completa.");
            }
         });
      }
     if (archivoInput && fileNameDisplay) { /* ... código change listener ... */
         archivoInput.addEventListener('change', () => { fileNameDisplay.textContent = archivoInput.files.length > 0 ? archivoInput.files[0].name : 'Seleccionar archivo...'; });
     }
     if (adminTrabajosLista) { /* ... código delete listener ... */
        adminTrabajosLista.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-danger')) {
                 console.log("[Admin Page] Botón eliminar...");
                if (typeof supabase === 'undefined') { console.error('[Admin Page] Supabase no definido'); return; }
                const id = e.target.dataset.id;
                const nombreArchivo = e.target.dataset.file;
                if (!confirm('¿Estás seguro?')) return;
                const { error: dbError } = await supabase.from('trabajos').delete().eq('id', id);
                if (dbError) { alert('Error al eliminar DB.'); return; }
                const { error: storageError } = await supabase.storage.from('archivos-trabajos').remove([nombreArchivo]);
                if (storageError && storageError.statusCode !== '404') { alert('Error al eliminar archivo.'); }
                cargarTrabajosAdmin();
                 console.log("[Admin Page] Eliminado.");
            }
        });
      }
     if (logoutButton) { /* ... código logout listener ... */
          console.log("[Admin Page] Botón logout encontrado.");
         logoutButton.addEventListener('click', async () => {
             console.log("[Admin Page] Cerrando sesión...");
             if (typeof supabase === 'undefined') { console.error('[Admin Page] Supabase no definido'); return; }
             await supabase.auth.signOut();
             window.location.assign('index.html'); // Usar assign()
         });
      }

    // --- EJECUCIÓN INICIAL ---
    if (loginForm) {
        console.log("Detectado: login.html (admin)");
    } else if (document.querySelector('.admin-container')) {
        console.log("Detectado: admin.html -> Ejecutando protección...");
        protegerRutaAdmin();
    } else {
        console.log("admin.js cargado en página no esperada.");
    }

}); // Fin del DOMContentLoaded