// ===========================================
// SCRIPT PARA EL INGENIERO I-FIX
// ===========================================

// Manejar el envío del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            // Validar honeypot (campo anti-spam)
            const honeypot = document.getElementById('website').value;
            if (honeypot) {
                console.log('Spam detectado');
                event.preventDefault();
                return false;
            }
            
            // Validación básica del lado del cliente
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const asunto = document.getElementById('asunto').value;
            const mensaje = document.getElementById('mensaje').value.trim();
            const acepto = document.getElementById('acepto').checked;
            
            if (!nombre || !correo || !asunto || !mensaje || !acepto) {
                event.preventDefault();
                showNotification('Por favor, completa todos los campos obligatorios y acepta los términos.', 'error');
                return false;
            }
            
            // Validar formato de email (más estricto)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(correo)) {
                event.preventDefault();
                showNotification('Por favor, ingresa un correo electrónico válido (ejemplo: usuario@dominio.com).', 'error');
                return false;
            }
            
            // Validar que no tenga caracteres problemáticos
            if (correo.includes(',') || correo.includes(';') || correo.includes(' ')) {
                event.preventDefault();
                showNotification('El correo electrónico no puede contener comas, puntos y comas o espacios. Ejemplo válido: usuario@dominio.com', 'error');
                return false;
            }
            
            // Configurar campos dinámicos de Formspree (sin comas)
            const replytoField = document.getElementById('replyto-field');
            if (replytoField) {
                replytoField.value = correo.trim(); // Eliminar espacios y caracteres extra
            }
            
            // Actualizar el campo _replyto en el formulario
            const replytoInputs = contactForm.querySelectorAll('input[name="_replyto"]');
            replytoInputs.forEach(input => {
                input.value = correo.trim(); // Eliminar espacios y caracteres extra
            });
            
            // Asegurar que el campo de email principal esté limpio
            const emailField = document.getElementById('correo');
            if (emailField) {
                emailField.value = correo.trim(); // Limpiar el campo de email
            }
            
            // Mostrar estado de carga
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            if (btnText && btnLoading) {
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline';
            }
            
            // Intentar múltiples métodos de envío de email
            attemptEmailSending(nombre, correo, asunto, mensaje, telefono);
            
            // Restaurar estado del botón después de un tiempo
            setTimeout(() => {
                if (btnText && btnLoading) {
                    submitBtn.disabled = false;
                    btnText.style.display = 'inline';
                    btnLoading.style.display = 'none';
                }
            }, 5000);
        });
    }
});

// Función para probar la conectividad con Formspree
function testFormspreeConnection() {
    return fetch('https://formspree.io/f/mqagerbp', {
        method: 'HEAD',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Formspree connection test:', response.status);
        console.log('Formspree headers:', response.headers);
        return response.ok;
    })
    .catch(error => {
        console.error('Formspree connection failed:', error);
        return false;
    });
}

// Función para enviar un mensaje de prueba a Formspree
function testFormspreeSubmission() {
    const testData = new FormData();
    testData.append('nombre', 'Test Usuario');
    testData.append('correo', 'test@example.com');
    testData.append('asunto', 'Prueba de conexión');
    testData.append('mensaje', 'Este es un mensaje de prueba para verificar la conectividad con Formspree.');
    testData.append('_subject', '[El Ingeniero i-Fix] Mensaje de prueba');
    testData.append('_captcha', 'false');
    
    return fetch('https://formspree.io/f/mqagerbp', {
        method: 'POST',
        body: testData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Formspree test submission:', response.status);
        return response.ok;
    })
    .catch(error => {
        console.error('Formspree test submission failed:', error);
        return false;
    });
}

// Función principal para intentar múltiples métodos de envío
function attemptEmailSending(nombre, correo, asunto, mensaje, telefono) {
    console.log('Iniciando envío de email...');
    
    // Método 1: Intentar EmailJS primero (más confiable)
    sendViaEmailJS(nombre, correo, asunto, mensaje, telefono)
        .then(success => {
            if (success) {
                handleEmailSuccess(nombre, asunto);
            } else {
                console.log('EmailJS falló, intentando Web3Forms...');
                // Método 2: Intentar Web3Forms como respaldo
                return sendViaWeb3Forms(nombre, correo, asunto, mensaje, telefono);
            }
        })
        .then(success => {
            if (success) {
                handleEmailSuccess(nombre, asunto);
            } else {
                console.log('Web3Forms falló, intentando Formspree...');
                // Método 3: Intentar Formspree como último recurso
                return sendViaFormspree(nombre, correo, asunto, mensaje, telefono);
            }
        })
        .then(success => {
            if (success) {
                handleEmailSuccess(nombre, asunto);
            } else {
                console.log('Todos los métodos de email fallaron, mostrando alternativa de WhatsApp...');
                handleEmailFailure(nombre, correo, asunto, mensaje);
            }
        })
        .catch(error => {
            console.error('Error en el envío de email:', error);
            handleEmailFailure(nombre, correo, asunto, mensaje);
        });
}

// Función para enviar via Formspree (corregida)
function sendViaFormspree(nombre, correo, asunto, mensaje, telefono) {
    // Limpiar el email para evitar duplicados
    const emailLimpio = correo.trim().replace(/[,;]/g, '');
    
    const formData = new FormData();
    formData.append('name', nombre); // Cambiar a 'name' en lugar de 'nombre'
    formData.append('email', emailLimpio); // Cambiar a 'email' en lugar de 'correo'
    formData.append('subject', asunto); // Cambiar a 'subject' en lugar de 'asunto'
    formData.append('message', mensaje); // Cambiar a 'message' en lugar de 'mensaje'
    if (telefono) formData.append('phone', telefono); // Cambiar a 'phone' en lugar de 'telefono'
    
    // Campos especiales de Formspree
    formData.append('_subject', `[El Ingeniero i-Fix] ${asunto} - ${nombre}`);
    formData.append('_replyto', emailLimpio);
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');
    
    return fetch('https://formspree.io/f/mqagerbp', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        console.log('Formspree response:', response.status);
        if (response.ok) {
            return true;
        } else {
            return response.text().then(text => {
                console.error('Formspree error:', text);
                return false;
            });
        }
    })
    .catch(error => {
        console.error('Formspree network error:', error);
        return false;
    });
}

// Función para enviar via EmailJS
function sendViaEmailJS(nombre, correo, asunto, mensaje, telefono) {
    return new Promise((resolve) => {
        if (typeof emailjs === 'undefined') {
            console.log('EmailJS no está disponible');
            resolve(false);
            return;
        }
        
        const templateParams = {
            from_name: nombre,
            from_email: correo,
            subject: `[El Ingeniero i-Fix] ${asunto}`,
            message: `Nombre: ${nombre}\nEmail: ${correo}\nTeléfono: ${telefono || 'No proporcionado'}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`,
            to_email: 'tu-email@dominio.com' // Reemplaza con tu email
        };
        
        // Usar IDs de ejemplo - reemplaza con los tuyos
        emailjs.send('service_1234567', 'template_abcdefg', templateParams)
            .then(function(response) {
                console.log('EmailJS success:', response.status, response.text);
                resolve(true);
            })
            .catch(function(error) {
                console.error('EmailJS error:', error);
                resolve(false);
            });
    });
}

// Función alternativa usando Web3Forms (más simple)
function sendViaWeb3Forms(nombre, correo, asunto, mensaje, telefono) {
    const formData = new FormData();
    formData.append('access_key', 'YOUR_WEB3FORMS_KEY'); // Reemplaza con tu clave
    formData.append('name', nombre);
    formData.append('email', correo);
    formData.append('subject', `[El Ingeniero i-Fix] ${asunto}`);
    formData.append('message', `Nombre: ${nombre}\nEmail: ${correo}\nTeléfono: ${telefono || 'No proporcionado'}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`);
    if (telefono) formData.append('phone', telefono);
    
    return fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Web3Forms response:', response.status);
        return response.ok;
    })
    .catch(error => {
        console.error('Web3Forms error:', error);
        return false;
    });
}

// Función para manejar éxito del envío
function handleEmailSuccess(nombre, asunto) {
    showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
    
    // Limpiar formulario
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.reset();
    }
    
    // Mostrar alternativa de WhatsApp después de 3 segundos
    setTimeout(() => {
        const whatsappMessage = `Hola, envié un mensaje desde el sitio web sobre: ${asunto}`;
        const whatsappUrl = `https://wa.me/573022197276?text=${encodeURIComponent(whatsappMessage)}`;
        
        showNotification('¿Prefieres contactarnos por WhatsApp?', 'info');
        
        // Crear enlace de WhatsApp
        setTimeout(() => {
            const whatsappNotification = document.createElement('div');
            whatsappNotification.className = 'notification info whatsapp-alternative';
            whatsappNotification.innerHTML = `
                <div style="margin-bottom: 10px;">💬 Contacta por WhatsApp:</div>
                <a href="${whatsappUrl}" target="_blank" style="color: white; text-decoration: underline; font-weight: bold;">
                    Abrir WhatsApp
                </a>
            `;
            
            document.body.appendChild(whatsappNotification);
            
            setTimeout(() => {
                whatsappNotification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                whatsappNotification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(whatsappNotification)) {
                        document.body.removeChild(whatsappNotification);
                    }
                }, 300);
            }, 5000);
        }, 1000);
    }, 3000);
}

// Función para manejar fallo del envío
function handleEmailFailure(nombre, correo, asunto, mensaje) {
    showNotification('No pudimos enviar el email. Te redirigimos a WhatsApp.', 'error');
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola, soy ${nombre}.\n\nAsunto: ${asunto}\n\nMensaje: ${mensaje}\n\nEmail: ${correo}`;
    const whatsappUrl = `https://wa.me/573022197276?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Mostrar botón de WhatsApp inmediatamente
    setTimeout(() => {
        const whatsappBtn = document.createElement('div');
        whatsappBtn.className = 'notification info whatsapp-fallback';
        whatsappBtn.innerHTML = `
            <div style="margin-bottom: 10px;">💬 Contacta por WhatsApp:</div>
            <a href="${whatsappUrl}" target="_blank" style="color: white; text-decoration: underline; font-weight: bold;">
                Abrir WhatsApp ahora
            </a>
        `;
        
        document.body.appendChild(whatsappBtn);
        
        setTimeout(() => {
            whatsappBtn.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            whatsappBtn.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(whatsappBtn)) {
                    document.body.removeChild(whatsappBtn);
                }
            }, 300);
        }, 10000);
    }, 2000);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar y remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===========================================
// FUNCIONALIDAD DEL CARRITO DE COMPRAS
// ===========================================

let cart = [];
let cartModal = null;
let customerModal = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos
    cartModal = document.getElementById('cartModal');
    customerModal = document.getElementById('customerModal');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const closeCart = document.getElementById('closeCart');
    const closeCustomer = document.getElementById('closeCustomer');
    const clearCart = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const backToCart = document.getElementById('backToCart');
    const customerForm = document.getElementById('customerForm');
    
    // Abrir modal del carrito
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            updateCartDisplay();
            cartModal.classList.add('active');
        });
    }
    
    // Cerrar modal del carrito
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartModal.classList.remove('active');
        });
    }
    
    // Cerrar modal del cliente
    if (closeCustomer) {
        closeCustomer.addEventListener('click', function() {
            customerModal.classList.remove('active');
        });
    }
    
    // Volver al carrito
    if (backToCart) {
        backToCart.addEventListener('click', function() {
            customerModal.classList.remove('active');
            cartModal.classList.add('active');
        });
    }
    
    // Vaciar carrito
    if (clearCart) {
        clearCart.addEventListener('click', function() {
            cart = [];
            updateCartCount();
            updateCartDisplay();
            showNotification('Carrito vaciado', 'success');
        });
    }
    
    // Proceder al checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('El carrito está vacío', 'error');
                return;
            }
            cartModal.classList.remove('active');
            customerModal.classList.add('active');
        });
    }
    
    // Manejar envío del formulario del cliente
    if (customerForm) {
        customerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const name = document.getElementById('customerName').value;
            const phone = document.getElementById('customerPhone').value;
            const address = document.getElementById('customerAddress').value;
            
            if (!name || !phone) {
                showNotification('Por favor, completa todos los campos obligatorios', 'error');
                return;
            }
            
            // Generar mensaje de WhatsApp
            let message = `Hola, me gustaría hacer un pedido:\n\n`;
            
            cart.forEach(item => {
                message += `${item.quantity}x ${item.name} - $${item.price.toLocaleString()}\n`;
            });
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            message += `\nTotal: $${total.toLocaleString()}\n\n`;
            message += `Datos de contacto:\n`;
            message += `Nombre: ${name}\n`;
            message += `Teléfono: ${phone}\n`;
            if (address) {
                message += `Dirección: ${address}\n`;
            }
            
            // Número de WhatsApp de El Ingeniero i-Fix
            const whatsappNumber = '573022197276'; // Formato sin + y espacios
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            // Abrir WhatsApp en nueva ventana
            window.open(whatsappUrl, '_blank');
            
            // Limpiar formulario y carrito
            customerForm.reset();
            cart = [];
            updateCartCount();
            
            // Cerrar modales
            customerModal.classList.remove('active');
            
            // Mostrar notificación
            showNotification('¡Pedido enviado por WhatsApp!', 'success');
        });
    }
});

// Función para agregar producto al carrito
function addToCart(productId, productName, price) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification('Producto agregado al carrito', 'success');
}

// Actualizar el contador del carrito
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = total;
    }
}

// Actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #6C757D; padding: 2rem;">El carrito está vacío</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                
                const itemTotal = item.price * item.quantity;
                
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toLocaleString()} c/u</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">🗑️</button>
                    </div>
                    <div class="cart-item-total">$${itemTotal.toLocaleString()}</div>
                `;
                
                cartItems.appendChild(cartItem);
            });
        }
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toLocaleString();
    }
}

// Aumentar cantidad de un producto
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCartDisplay();
        updateCartCount();
    }
}

// Disminuir cantidad de un producto
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
        updateCartDisplay();
        updateCartCount();
    }
}

// Remover producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartCount();
    showNotification('Producto eliminado del carrito', 'success');
}

// ===========================================
// PESTAÑAS DEL CATÁLOGO
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remover clase active de todos los botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Mostrar/ocultar contenido según la categoría
            const catalogs = document.querySelectorAll('.catalog-content');
            catalogs.forEach(catalog => {
                if (catalog.id === category) {
                    catalog.style.display = 'block';
                } else {
                    catalog.style.display = 'none';
                }
            });
        });
    });
});

// ===========================================
// NAVEGACIÓN MÓVIL (HAMBURGUESA)
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Cerrar el menú cuando se hace clic en un enlace
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
});

// ===========================================
// INFORMACIÓN PARA EL CHATBOT
// ===========================================

// Función para proporcionar información de contacto al chatbot
function getContactInfo() {
    return {
        whatsapp: '+57 302 219 7276',
        whatsappLink: 'https://wa.me/573022197276',
        location: 'Calle 9 # 4-22, Centro Comercial El Palacio, Local 95, Cúcuta',
        schedule: 'Lun-Sáb: 8:00 AM - 6:00 PM | Dom: 9:00 AM - 1:00 PM',
        services: [
            'Reparación de pantallas',
            'Reparación de placas',
            'Especialización iPhone',
            'Servicio Express',
            'Venta de accesorios',
            'Diagnóstico técnico'
        ]
    };
}

// Hacer la información disponible globalmente para el chatbot
window.ElIngenieroIFixInfo = getContactInfo();

// Función de diagnóstico para el formulario
function diagnoseFormIssue() {
    console.log('=== DIAGNÓSTICO DEL FORMULARIO ===');
    
    // Verificar elementos del formulario
    const form = document.getElementById('contactForm');
    const nombre = document.getElementById('nombre');
    const correo = document.getElementById('correo');
    const asunto = document.getElementById('asunto');
    const mensaje = document.getElementById('mensaje');
    const acepto = document.getElementById('acepto');
    
    console.log('Formulario encontrado:', !!form);
    console.log('Campo nombre:', !!nombre);
    console.log('Campo correo:', !!correo);
    console.log('Campo asunto:', !!asunto);
    console.log('Campo mensaje:', !!mensaje);
    console.log('Checkbox acepto:', !!acepto);
    
    // Probar conectividad con Formspree
    testFormspreeConnection().then(isConnected => {
        console.log('Formspree conectado:', isConnected);
        
        if (!isConnected) {
            showNotification('⚠️ Problema de conectividad con Formspree detectado. Usa WhatsApp como alternativa.', 'error');
        } else {
            console.log('✅ Formspree está funcionando correctamente');
            
            // Probar envío de formulario (opcional)
            if (confirm('¿Quieres probar el envío de un mensaje de prueba a Formspree?')) {
                testFormspreeSubmission().then(success => {
                    if (success) {
                        showNotification('✅ Prueba de Formspree exitosa. El formulario está funcionando.', 'success');
                    } else {
                        showNotification('❌ Prueba de Formspree falló. Revisa la configuración.', 'error');
                    }
                });
            }
        }
    });
    
    // Verificar configuración de Formspree
    console.log('URL Formspree:', 'https://formspree.io/f/mqagerbp');
    console.log('Configuración del formulario:');
    console.log('- Action:', document.getElementById('contactForm')?.action);
    console.log('- Method:', document.getElementById('contactForm')?.method);
    console.log('- Enctype:', document.getElementById('contactForm')?.enctype);
    console.log('=== FIN DIAGNÓSTICO ===');
}

// Ejecutar diagnóstico al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(diagnoseFormIssue, 2000);
    
    // Verificar si hay parámetros de éxito en la URL (después del envío de Formspree)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' || window.location.hash === '#success') {
        showSuccessMessage();
    }
    
    // Limpiar automáticamente el campo de email
    const emailField = document.getElementById('correo');
    if (emailField) {
        emailField.addEventListener('input', function() {
            // Eliminar caracteres problemáticos mientras el usuario escribe
            let value = this.value;
            value = value.replace(/[,;]/g, ''); // Eliminar comas y puntos y comas
            value = value.trim(); // Eliminar espacios al inicio y final
            
            if (value !== this.value) {
                this.value = value;
                showNotification('Se eliminaron caracteres no válidos del email.', 'info');
            }
        });
        
        emailField.addEventListener('blur', function() {
            // Limpiar al salir del campo
            this.value = this.value.trim();
        });
    }
});

// Función para mostrar mensaje de éxito
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const contactForm = document.getElementById('contactForm');
    
    if (successMessage && contactForm) {
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll suave hacia el mensaje
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Mostrar notificación adicional
        showNotification('¡Mensaje enviado exitosamente!', 'success');
    }
}
