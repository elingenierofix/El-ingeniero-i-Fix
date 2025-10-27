/* ===========================================
   EL INGENIERO I-FIX - JAVASCRIPT
   Funcionalidades interactivas para la página web
   =========================================== */

// Esperamos a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // NAVEGACIÓN MÓVIL (MENÚ HAMBURGUESA)
    // ===========================================
    
    // Obtenemos referencias a los elementos del menú móvil
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Función para alternar el menú móvil
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
    // Event listener para el botón hamburguesa
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Cerrar el menú móvil cuando se hace clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Cerrar el menú móvil cuando se hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // ===========================================
    // NAVEGACIÓN SUAVE ENTRE SECCIONES
    // ===========================================
    
    // Función para hacer scroll suave a una sección específica
    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Calculamos la posición considerando el header fijo
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            // Hacemos scroll suave hasta la posición calculada
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Agregamos event listeners a todos los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenimos el comportamiento por defecto del enlace
            
            const targetId = link.getAttribute('href');
            smoothScrollTo(targetId);
        });
    });
    
    // ===========================================
    // FORMULARIO DE CONTACTO
    // ===========================================
    
    // Obtenemos referencia al formulario de contacto
    const contactForm = document.getElementById('contactForm');
    
    // Función para validar el formulario
    function validateForm(formData) {
        const errors = [];
        
        // Validar nombre (debe tener al menos 2 caracteres)
        if (!formData.nombre || formData.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }
        
        // Validar email (formato básico de email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.correo || !emailRegex.test(formData.correo)) {
            errors.push('Por favor ingresa un email válido');
        }
        
        // Validar mensaje (debe tener al menos 10 caracteres)
        if (!formData.mensaje || formData.mensaje.trim().length < 10) {
            errors.push('El mensaje debe tener al menos 10 caracteres');
        }
        
        return errors;
    }
    
    // Función para mostrar mensajes de error o éxito
    function showMessage(message, isError = false) {
        // Removemos cualquier mensaje anterior
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Creamos el nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${isError ? 'error' : 'success'}`;
        messageDiv.textContent = message;
        
        // Estilos para el mensaje
        messageDiv.style.cssText = `
            padding: 12px;
            margin: 10px 0;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            ${isError ? 
                'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : 
                'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
            }
        `;
        
        // Insertamos el mensaje después del formulario
        contactForm.parentNode.insertBefore(messageDiv, contactForm.nextSibling);
        
        // Removemos el mensaje después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Función para limpiar el formulario
    function clearForm() {
        contactForm.reset();
        
        // Removemos cualquier clase de error de los campos
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#E9ECEF';
        });
    }
    
    // Función para resaltar campos con error
    function highlightErrors(errors, formData) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        
        // Primero limpiamos todos los estilos de error
        inputs.forEach(input => {
            input.style.borderColor = '#E9ECEF';
        });
        
        // Luego resaltamos los campos con error
        if (errors.includes('El nombre debe tener al menos 2 caracteres')) {
            document.getElementById('nombre').style.borderColor = '#dc3545';
        }
        if (errors.includes('Por favor ingresa un email válido')) {
            document.getElementById('correo').style.borderColor = '#dc3545';
        }
        if (errors.includes('El mensaje debe tener al menos 10 caracteres')) {
            document.getElementById('mensaje').style.borderColor = '#dc3545';
        }
    }
    
    // Event listener para el envío del formulario
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenimos el envío por defecto del formulario
        
        // Obtenemos los datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        // Validamos el formulario
        const errors = validateForm(formData);
        
        if (errors.length > 0) {
            // Si hay errores, los mostramos y resaltamos los campos
            showMessage(errors.join('. '), true);
            highlightErrors(errors, formData);
        } else {
            // Si no hay errores, simulamos el envío exitoso
            console.log('Formulario enviado correctamente');
            console.log('Datos del formulario:', formData);
            
            // Mostramos mensaje de éxito
            showMessage('¡Mensaje enviado correctamente! Te contactaremos pronto.', false);
            
            // Limpiamos el formulario
            clearForm();
        }
    });
    
    // ===========================================
    // EFECTOS DE SCROLL Y ANIMACIONES
    // ===========================================
    
    // Función para agregar efecto de aparición gradual a los elementos
    function addScrollAnimations() {
        // Obtenemos todos los elementos que queremos animar
        const animatedElements = document.querySelectorAll('.service-card, .project-card, .stat-item');
        
        // Creamos un observer para detectar cuando los elementos entran en el viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Agregamos la clase de animación cuando el elemento es visible
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1, // El elemento debe estar al menos 10% visible
            rootMargin: '0px 0px -50px 0px' // Margen adicional para activar la animación
        });
        
        // Observamos cada elemento animado
        animatedElements.forEach(element => {
            // Establecemos el estado inicial (invisible y desplazado hacia abajo)
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            
            observer.observe(element);
        });
    }
    
    // Ejecutamos las animaciones de scroll
    addScrollAnimations();
    
    // ===========================================
    // EFECTO DE HEADER AL HACER SCROLL
    // ===========================================
    
    // Función para cambiar el estilo del header al hacer scroll
    function handleScrollHeader() {
        const header = document.querySelector('.header');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            // Agregamos una clase cuando el usuario ha hecho scroll
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            // Removemos la clase cuando está en la parte superior
            header.style.backgroundColor = '#FFFFFF';
            header.style.backdropFilter = 'none';
        }
    }
    
    // Event listener para el scroll
    window.addEventListener('scroll', handleScrollHeader);
    
    // ===========================================
    // EFECTOS HOVER EN BOTONES DE PROYECTOS
    // ===========================================
    
    // Agregamos efectos especiales a los botones "Ver más" de los proyectos
    const projectButtons = document.querySelectorAll('.project-card .btn-secondary');
    
    projectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Verificamos si es el botón del iPhone 15 Pro Max (que ya tiene onclick)
            const projectTitle = this.closest('.project-card').querySelector('h3').textContent;
            
            if (projectTitle.includes('iPhone 15 Pro Max')) {
                // Este botón ya tiene onclick para abrir YouTube, no necesitamos prevenir el comportamiento
                return;
            }
            
            e.preventDefault();
            
            // Para otros proyectos, mostramos un mensaje informativo
            showMessage(`Próximamente: Más detalles sobre "${projectTitle}"`, false);
        });
    });
    
    // ===========================================
    // FUNCIONALIDAD ADICIONAL: CONTADOR ANIMADO
    // ===========================================
    
    // Función para animar los números en las estadísticas
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-item h3');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/\D/g, '')); // Extraemos solo números
            const suffix = counter.textContent.replace(/\d/g, ''); // Extraemos solo texto
            
            if (target > 0) {
                let current = 0;
                const increment = target / 50; // Animación en 50 pasos
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current) + suffix;
                }, 30); // Actualizamos cada 30ms
            }
        });
    }
    
    // Ejecutamos la animación de contadores cuando la sección de misión es visible
    const missionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                missionObserver.unobserve(entry.target); // Solo ejecutamos una vez
            }
        });
    });
    
    const missionSection = document.querySelector('.mission');
    if (missionSection) {
        missionObserver.observe(missionSection);
    }
    
    // ===========================================
    // MEJORAS DE ACCESIBILIDAD
    // ===========================================
    
    // Agregamos soporte para navegación con teclado
    document.addEventListener('keydown', function(e) {
        // ESC para cerrar el menú móvil
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Mejoramos el foco para usuarios que navegan con teclado
    const focusableElements = document.querySelectorAll('a, button, input, textarea');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #4A90E2';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // ===========================================
    // FUNCIONALIDAD DEL CATÁLOGO Y CARRITO
    // ===========================================
    
    // Variables globales para el carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const numeroWhatsApp = "+57 3022197276";
    
    // Función para formatear números con separadores de miles
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Función para actualizar el contador del carrito
    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    
    // Función para mostrar notificación
    function showNotification(message, type = 'success') {
        // Remover notificación anterior si existe
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ocultar notificación después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Función para agregar producto al carrito
    window.addToCart = function(productId, productName, price) {
        console.log('Agregando producto:', productId, productName, price);
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1
            });
        }
        
        // Guardar en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Actualizar contador
        updateCartCount();
        
        // Mostrar notificación
        showNotification(`✅ ${productName} agregado al carrito`);
        
        console.log('Carrito actualizado:', cart);
    };
    
    // Función para renderizar el carrito
    function renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) {
            console.error('Elementos del carrito no encontrados');
            return;
        }
        
        console.log('Renderizando carrito con', cart.length, 'productos');
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">Tu carrito está vacío</p>';
            cartTotal.textContent = '0';
            return;
        }
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${formatNumber(item.price)} c/u</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')" title="Eliminar">🗑️</button>
                </div>
                <div class="cart-item-total">$${formatNumber(item.price * item.quantity)}</div>
            </div>
        `).join('');
        
        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatNumber(total);
    }
    
    // Función para actualizar cantidad de producto
    window.updateQuantity = function(productId, change) {
        console.log('Actualizando cantidad:', productId, change);
        
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
                return;
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCart();
        }
    };
    
    // Función para eliminar producto del carrito
    window.removeFromCart = function(productId) {
        console.log('Eliminando producto:', productId);
        
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        
        showNotification('Producto eliminado del carrito', 'success');
    };
    
    // Función para vaciar carrito
    function clearCart() {
        console.log('Vaciando carrito');
        
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
        
        // Cerrar modal del carrito si está abierto
        const cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.classList.contains('active')) {
            cartModal.classList.remove('active');
        }
        
        showNotification('Carrito vaciado', 'success');
    }
    
    // Función para generar mensaje de WhatsApp
    function generateWhatsAppMessage(customerData) {
        let message = `Hola 👋, quiero confirmar mi pedido desde la página web de El Ingeniero i-Fix.\n\n`;
        message += `📋 *Datos del Cliente:*\n`;
        message += `👤 Nombre: ${customerData.name}\n`;
        message += `📞 Teléfono: ${customerData.phone}\n`;
        if (customerData.address) {
            message += `📍 Dirección: ${customerData.address}\n`;
        }
        
        message += `\n🛒 *Productos Solicitados:*\n`;
        cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} - $${formatNumber(item.price * item.quantity)}\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n💰 *Total: $${formatNumber(total)}*\n\n`;
        message += `¡Espero tu confirmación! 😊`;
        
        return message;
    }
    
    // Función para limpiar formulario de datos del cliente
    function clearCustomerForm() {
        const customerForm = document.getElementById('customerForm');
        if (customerForm) {
            customerForm.reset();
        }
    }
    
    // Función para enviar pedido por WhatsApp
    function sendToWhatsApp(customerData) {
        const message = generateWhatsAppMessage(customerData);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${numeroWhatsApp.replace(/\D/g, '')}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Limpiar carrito y formulario después del envío
        clearCart();
        clearCustomerForm();
        
        // Cerrar modal de datos del cliente
        const customerModal = document.getElementById('customerModal');
        if (customerModal) {
            customerModal.classList.remove('active');
        }
        
        showNotification('¡Pedido enviado por WhatsApp! 📱', 'success');
    }
    
    // Event listeners para el catálogo
    function initializeCatalog() {
        // Pestañas del catálogo
        const tabButtons = document.querySelectorAll('.tab-btn');
        const catalogContents = document.querySelectorAll('.catalog-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Actualizar botones activos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar contenido correspondiente
                catalogContents.forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(category).style.display = 'block';
            });
        });
        
        // Modal del carrito
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');
        const clearCartBtn = document.getElementById('clearCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartIcon) {
            cartIcon.addEventListener('click', function() {
                renderCart();
                cartModal.classList.add('active');
            });
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', function() {
                cartModal.classList.remove('active');
            });
        }
        
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    showNotification('Tu carrito está vacío', 'error');
                    return;
                }
                
                cartModal.classList.remove('active');
                document.getElementById('customerModal').classList.add('active');
            });
        }
        
        // Modal de datos del cliente
        const customerModal = document.getElementById('customerModal');
        const closeCustomer = document.getElementById('closeCustomer');
        const backToCart = document.getElementById('backToCart');
        const customerForm = document.getElementById('customerForm');
        
        if (closeCustomer) {
            closeCustomer.addEventListener('click', function() {
                customerModal.classList.remove('active');
            });
        }
        
        if (backToCart) {
            backToCart.addEventListener('click', function() {
                customerModal.classList.remove('active');
                cartModal.classList.add('active');
            });
        }
        
        if (customerForm) {
            customerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const customerData = {
                    name: document.getElementById('customerName').value,
                    phone: document.getElementById('customerPhone').value,
                    address: document.getElementById('customerAddress').value
                };
                
                // Validar campos obligatorios
                if (!customerData.name.trim() || !customerData.phone.trim()) {
                    showNotification('Por favor completa todos los campos obligatorios', 'error');
                    return;
                }
                
                sendToWhatsApp(customerData);
            });
        }
        
        // Cerrar modales al hacer clic fuera
        if (cartModal) {
            cartModal.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                }
            });
        }
        
        if (customerModal) {
            customerModal.addEventListener('click', function(e) {
                if (e.target === customerModal) {
                    customerModal.classList.remove('active');
                }
            });
        }
        
        // Inicializar contador del carrito
        updateCartCount();
    }
    
    // Inicializar catálogo cuando el DOM esté listo
    initializeCatalog();
    
    // ===========================================
    // INICIALIZACIÓN COMPLETA
    // ===========================================
    
    console.log('🚀 El Ingeniero i-Fix - Página web cargada correctamente');
    console.log('📱 Especialistas en reparación de celulares desde Cúcuta, Colombia');
    console.log('🛒 Sistema de catálogo y carrito implementado');
    
});

// ===========================================
// FUNCIONES UTILITARIAS GLOBALES
// ===========================================

// Función para mostrar información de contacto en consola (para desarrolladores)
function showContactInfo() {
    console.log('📞 El Ingeniero i-Fix');
    console.log('📍 Calle 9 # 4-22, Centro Comercial El Palacio, Local 95, Cúcuta');
    console.log('🕒 Lun-Sáb: 8:00 AM - 6:00 PM | Dom: 9:00 AM - 1:00 PM');
    console.log('💬 WhatsApp: Disponible en horario de atención');
}

// Función para validar si un email es válido (función auxiliar)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para formatear texto (función auxiliar)
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
