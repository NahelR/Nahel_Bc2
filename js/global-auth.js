// js/global-auth.js (VERSIÓN FINAL CON ENLACE ADMIN - LIMPIA)

document.addEventListener('DOMContentLoaded', () => {
    console.log("[GlobalAuth] Iniciado V_Enlace_Limpio.");

    const userStatusContainer = document.getElementById('user-status-container');
    // *** CAMBIO: Buscar SOLO el ID del enlace <a> ***
    const userDisplayLink = document.getElementById('user-display-link');
    const globalLogoutButton = document.getElementById('global-logout-button');
    const loginMenu = document.getElementById('login-menu');

    if (typeof supabase === 'undefined' || !supabase.auth) {
        console.error('[GlobalAuth] Supabase no definido o sin auth.');
        return;
    }

    const adminEmail = 'nahel@gmail.com'.toLowerCase();

    const updateNavbar = (session) => {
        console.log("[GlobalAuth] updateNavbar llamado. Sesión:", session ? 'Sí' : 'No');
        try {
            if (session) {
                // --- Usuario Logueado ---
                const user = session.user;
                const userEmail = (user.email || '').toLowerCase();

                if (userDisplayLink) { // Verifica si el enlace <a> existe
                    console.log("[GlobalAuth] userDisplayLink encontrado.");
                    if (userEmail === adminEmail) {
                        // Es Admin
                        console.log("[GlobalAuth] Usuario es ADMIN.");
                        userDisplayLink.textContent = 'Admin Panel';
                        userDisplayLink.href = 'admin.html'; // Pone el enlace
                        userDisplayLink.style.cursor = 'pointer';
                        userDisplayLink.style.textDecoration = 'underline';
                        userDisplayLink.onclick = null; // Permite el clic
                    } else {
                        // Es Usuario normal
                        console.log("[GlobalAuth] Usuario es NORMAL.");
                        userDisplayLink.textContent = user.email || 'Usuario';
                        userDisplayLink.href = '#'; // Sin enlace funcional
                        userDisplayLink.style.cursor = 'default';
                        userDisplayLink.style.textDecoration = 'none';
                        userDisplayLink.onclick = (e) => e.preventDefault(); // Previene clic
                    }
                    userDisplayLink.style.fontWeight = 'bold';
                    userDisplayLink.style.color = 'var(--text-primary)';
                } else {
                    console.warn("[GlobalAuth] Elemento #user-display-link NO encontrado.");
                }

                // Mostrar/ocultar contenedores
                if (userStatusContainer) { userStatusContainer.style.display = 'flex'; }
                else { console.warn("[GlobalAuth] #user-status-container NO encontrado."); }
                if (loginMenu) { loginMenu.style.display = 'none'; }
                else { console.warn("[GlobalAuth] #login-menu NO encontrado."); }

                // Asignar evento al botón logout
                if (globalLogoutButton) {
                    globalLogoutButton.onclick = async () => { /* ... código logout ... */
                        console.log("[GlobalAuth] Clic Cerrar Sesión...");
                        const { error } = await supabase.auth.signOut();
                        if (error) { console.error('[GlobalAuth] Error signOut:', error); }
                        else { window.location.href = 'index.html'; }
                    };
                } else {
                    console.warn("[GlobalAuth] #global-logout-button NO encontrado."); // ¿Por qué no lo encontraría?
                }

            } else {
                // --- Usuario Deslogueado ---
                console.log("[GlobalAuth] Usuario DESLOGUEADO.");
                if (userStatusContainer) userStatusContainer.style.display = 'none';
                if (loginMenu) loginMenu.style.display = 'inline-block';
            }
        } catch (error) {
             console.error("[GlobalAuth] Error dentro de updateNavbar:", error);
        }
    };

    // Listener para cambios de estado
    supabase.auth.onAuthStateChange((event, session) => {
        console.log("[GlobalAuth] onAuthStateChange:", event);
        updateNavbar(session);
    });

    // Verificación inicial
    console.log("[GlobalAuth] Obteniendo sesión inicial...");
    supabase.auth.getSession()
        .then(({ data: { session } }) => {
            console.log("[GlobalAuth] Sesión inicial recibida:", session ? 'Sí' : 'No');
            updateNavbar(session);
        })
        .catch(error => {
             console.error('[GlobalAuth] Error getSession inicial:', error);
             updateNavbar(null); // Actualizar UI para estado deslogueado
        });

}); // Fin DOMContentLoaded