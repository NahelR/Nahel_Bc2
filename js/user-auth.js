// js/user-auth.js (CORREGIDO PARA GITHUB PAGES)

const userAuthForm = document.getElementById('user-auth-form');
const emailInput = document.getElementById('user-email');
const passwordInput = document.getElementById('user-password');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const googleButton = document.getElementById('google-signin-button');
const messageArea = document.getElementById('message');

function showMessage(text, isError = false) {
    if (messageArea) {
        messageArea.textContent = text;
        messageArea.className = isError ? 'message error' : 'message success';
    }
}

// Login con Email/Password
if (loginButton) {
    loginButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        showMessage('');
        if (!email || !password) { showMessage('Ingresa email y contraseña.', true); return; }
        if (typeof supabase === 'undefined') { console.error('Supabase no definido'); return; }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showMessage('Error al iniciar sesión: ' + error.message, true);
        } else {
            showMessage('Inicio de sesión exitoso. Redirigiendo...', false);
            // Redirige a la URL completa de GitHub Pages
            window.location.href = 'https://nahelr.github.io/Nahel_Bc2/asignatura.html';
        }
    });
}

// Signup con Email/Password
if (signupButton) {
    signupButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        showMessage('');
        if (!email || !password) { showMessage('Ingresa email y contraseña.', true); return; }
        if (password.length < 6) { showMessage('Contraseña mínima 6 caracteres.', true); return; }
        if (typeof supabase === 'undefined') { console.error('Supabase no definido'); return; }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showMessage('Error al registrarse: ' + error.message, true);
        } else {
            showMessage('Registro exitoso. Iniciando sesión...', false);
            // Intenta login automático
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (!signInError) {
                // Usa la URL relativa aquí, ya que no es un redirect OAuth
                window.location.href = 'asignatura.html';
            } else {
                showMessage('Registro exitoso. Revisa tu email para confirmar si es necesario.', false);
            }
        }
    });
}

// Login/Signup con Google
if (googleButton) {
    googleButton.addEventListener('click', async () => {
        showMessage('');
        if (typeof supabase === 'undefined') { console.error('Supabase no definido'); return; }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // *** ¡LA CORRECCIÓN MÁS IMPORTANTE ESTÁ AQUÍ! ***
                redirectTo: 'https://nahelr.github.io/Nahel_Bc2/asignatura.html'
            }
        });
        if (error) { showMessage('Error con Google: ' + error.message, true); }
        // Si no hay error, Supabase/Google manejan la redirección
    });
}


// No se necesita checkUserSession aquí
