const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000'; // Base URL cho ảnh
let cart = [];
let cartItems, cartTotal, cartCount, cartBtn, cartModal, closeCart, payBtn, checkoutModal, closeCheckout, checkoutForm, qrModal, closeQr, thankyouModal, closeThankyou;

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js loaded');

    // Khởi tạo các phần tử DOM
    cartBtn = document.getElementById('cart-btn');
    cartModal = document.getElementById('cart-modal');
    closeCart = document.getElementById('close-cart');
    cartCount = document.getElementById('cart-count');
    cartItems = document.getElementById('cart-items');
    cartTotal = document.getElementById('cart-total');
    payBtn = document.getElementById('pay-btn');
    checkoutModal = document.getElementById('checkout-modal');
    closeCheckout = document.getElementById('close-checkout');
    checkoutForm = document.getElementById('checkout-form');
    qrModal = document.getElementById('qr-modal');
    closeQr = document.getElementById('close-qr');
    thankyouModal = document.getElementById('thankyou-modal');
    closeThankyou = document.getElementById('close-thankyou');

    // Toggle Menu
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const hamburger = document.getElementById("hamburger");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("left-0");
            navMenu.classList.toggle("left-[-100%]");
            hamburger.classList.toggle("ri-close-large-line");
            hamburger.classList.toggle("ri-menu-4-line");
        });
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu && hamburger) {
                navMenu.classList.remove("left-0");
                navMenu.classList.add("left-[-100%]");
                hamburger.classList.remove("ri-close-large-line");
                hamburger.classList.add("ri-menu-4-line");
            }
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Swiper
    if (document.querySelector('.swiper')) {
        console.log('Khởi tạo Swiper');
        new Swiper('.swiper', {
            speed: 400,
            spaceBetween: 30,
            autoplay: { delay: 2500, disableOnInteraction: false },
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            grabCursor: true,
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    } else {
        console.log('Swiper không được sử dụng trên trang này');
    }

    // Scroll Sections Active Link
    const activeLink = () => {
        const sections = document.querySelectorAll("section");
        const navLinks = document.querySelectorAll(".nav-link");
        let current = "home";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 60) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.href.includes(current)) {
                link.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", activeLink);

    // ScrollReveal Animation
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2500,
        delay: 300,
        reset: true
    });
    sr.reveal(`.home_data, .about_top, .popular_top, .review_top, .reveiw_swiper, .footer_icon, .footer_content, .copy_right`);
    sr.reveal(`.home_image`, { delay: 500, scale: 0.5 });
    sr.reveal(`.service_card, .popular_card`, { interval: 100 });
    sr.reveal(`.about_leaf`, { delay: 1000, origin: "right" });
    sr.reveal(`.about_item_1_content, .about_item_2_img`, { origin: "right" });
    sr.reveal(`.about_item_2_content, .about_item_1_img`, { origin: "left" });
    sr.reveal(`.reveiw_leaf, .footer_floral`, { delay: 100, origin: "left" });

    // Loại trừ ScrollReveal cho các modal
    ScrollReveal().reveal('.no-scrollreveal', { reset: false, opacity: 1, scale: 1, duration: 0, distance: '0px', beforeReveal: el => { el.style.opacity = 1; el.style.transform = 'none'; } });

    // Cart Logic
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', e => {
            e.preventDefault();
            console.log('Cart button clicked');
            cartModal.classList.remove('hidden');
            document.body.appendChild(cartModal); // Đảm bảo modal là phần tử cuối cùng trong body
            cartModal.style.display = 'flex';
            cartModal.offsetHeight; // ép browser reflow để modal hiện đúng
            cartModal.style.display = '';
            updateCart(); // Cập nhật giỏ hàng khi mở modal
        });
    }

    if (closeCart && cartModal) {
        closeCart.addEventListener('click', () => {
            console.log('Close cart clicked');
            cartModal.classList.add('hidden');
        });
    }

    if (payBtn && checkoutModal) {
        payBtn.addEventListener('click', e => {
            e.preventDefault();
            console.log('Pay button clicked, cart:', cart);
            if (cart.length === 0) {
                alert('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vui lòng đăng nhập để thanh toán!');
                window.location.href = 'login.html';
                return;
            }
            cartModal.classList.add('hidden');
            checkoutModal.classList.remove('hidden');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async e => {
            e.preventDefault();
            console.log('Checkout form submitted');
            const formData = new FormData(checkoutForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const phoneNumber = formData.get('phoneNumber');
            const address = formData.get('address');
            const note = formData.get('note');
            const paymentMethod = formData.get('payment');
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Vui lòng đăng nhập để đặt hàng!');
                window.location.href = 'login.html';
                return;
            }

            try {
                await axios.post(`${API_URL}/orders`, {
                    fullName,
                    email,
                    phoneNumber,
                    address,
                    note,
                    paymentMethod
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (checkoutModal) checkoutModal.classList.add('hidden');
                if (paymentMethod === 'qr' && qrModal) {
                    qrModal.classList.remove('hidden');
                } else if (thankyouModal) {
                    thankyouModal.classList.remove('hidden');
                    cart = [];
                    updateCart();
                    await axios.delete(`${API_URL}/carts`, { headers: { Authorization: `Bearer ${token}` } });
                }
            } catch (error) {
                console.error('Lỗi khi đặt hàng:', error.message, error.response);
                alert('Có lỗi xảy ra khi đặt hàng!');
            }
        });
    }

    if (closeCheckout && checkoutModal) {
        closeCheckout.addEventListener('click', () => {
            console.log('Close checkout clicked');
            checkoutModal.classList.add('hidden');
        });
    }

    if (closeQr && qrModal && thankyouModal) {
        closeQr.addEventListener('click', async () => {
            console.log('Close QR clicked');
            const token = localStorage.getItem('token');
            qrModal.classList.add('hidden');
            thankyouModal.classList.remove('hidden');
            cart = [];
            updateCart();
            if (token) {
                await axios.delete(`${API_URL}/carts`, { headers: { Authorization: `Bearer ${token}` } });
            }
        });
    }

    if (closeThankyou && thankyouModal) {
        closeThankyou.addEventListener('click', () => {
            console.log('Close thankyou clicked');
            thankyouModal.classList.add('hidden');
        });
    }

    // Show Scroll Up
    const scrollUp = () => {
        const scrollUpBtn = document.getElementById("scroll-up");
        if (window.scrollY >= 250) {
            scrollUpBtn.classList.remove("-bottom-1/2");
            scrollUpBtn.classList.add("bottom-4");
        } else {
            scrollUpBtn.classList.add("-bottom-1/2");
            scrollUpBtn.classList.remove("bottom-4");
        }
    };
    window.addEventListener("scroll", scrollUp);

    // Change Background Header
    const scrollHeader = () => {
        const header = document.getElementById("navbar");
        if (window.scrollY >= 50) {
            header.classList.add("border-b", "border-yellow-500");
        } else {
            header.classList.remove("border-b", "border-yellow-500");
        }
    };
    window.addEventListener("scroll", scrollHeader);

    // Fetch Products
    if (document.getElementById('latest-products-container')) {
        console.log('Fetching popular products for index.html');
        fetchPopularProducts();
    }
    if (document.getElementById('products-container')) {
        console.log('Fetching all products for products.html');
        fetchAllProducts();
    }

    // Fetch Cart
    fetchCart();

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Newsletter form submitted');
            const email = this.querySelector('input[name="email"]').value;
            const formDataToSend = {
                access_key: "5e211e15-6ae3-4648-8115-5eff57d5b26b",
                email: email,
                subject: "Đăng ký nhận thông báo từ GreenEco Heaven",
                message: `Cảm ơn bạn đã đăng ký nhận thông báo từ GreenEco Heaven!\n\nChúng tôi sẽ gửi cho bạn những thông tin mới nhất về:\n- Sản phẩm mới\n- Chương trình khuyến mãi\n- Các sự kiện đặc biệt\n\nTrân trọng,\nGreenEco Heaven Team`
            };
            try {
                console.log('Gửi form Web3Forms:', formDataToSend);
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify(formDataToSend)
                });
                const result = await response.json();
                if (result.success) {
                    alert("Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin mới nhất đến email của bạn.");
                    this.reset();
                } else {
                    throw new Error("Form submission failed: " + JSON.stringify(result));
                }
            } catch (error) {
                console.error("Lỗi khi gửi form:", error);
                alert("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
            }
        });
    }

    // Ẩn/hiện nút Đăng nhập và Hồ sơ
    const loginLink = document.querySelector('a.nav-link[href="login.html"]');
    const token = localStorage.getItem('token');
    if (token) {
        if (loginLink) loginLink.style.display = 'none';

        // Kiểm tra vai trò admin
        fetch(`${API_URL}/auth/check-role`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.role === 'admin') {
                // Ẩn nút Hồ sơ nếu là admin
                let profileBtn = document.getElementById('profile-btn');
                if (profileBtn) profileBtn.style.display = 'none';
                // Hiện nút Quản lý
                let adminLink = document.getElementById('admin-link');
                if (!adminLink) {
                    const navList = document.querySelector('#nav-menu ul');
                    if (navList) {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = '#';
                        a.id = 'admin-link';
                        a.className = 'nav-link';
                        a.textContent = 'Quản lý';
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.location.href = 'admin.html';
                        });
                        li.appendChild(a);
                        navList.appendChild(li);
                        adminLink = a;
                    }
                } else {
                    adminLink.style.display = '';
                }
            } else {
                // Nếu không phải admin, hiện nút Hồ sơ
                let profileBtn = document.getElementById('profile-btn');
                if (!profileBtn) {
                    const navList = document.querySelector('#nav-menu ul');
                    if (navList) {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = '#';
                        a.id = 'profile-btn';
                        a.className = 'nav-link';
                        a.textContent = 'Hồ sơ';
                        a.addEventListener('click', (e) => {
                            e.preventDefault();
                            window.location.href = 'profile.html';
                        });
                        li.appendChild(a);
                        navList.appendChild(li);
                        profileBtn = a;
                    }
                } else {
                    profileBtn.style.display = '';
                }
                // Ẩn nút Quản lý nếu không phải admin
                let adminLink = document.getElementById('admin-link');
                if (adminLink) adminLink.style.display = 'none';
            }
        });
    } else {
        if (loginLink) loginLink.style.display = '';
        let profileBtn = document.getElementById('profile-btn');
        if (profileBtn) profileBtn.style.display = 'none';
        let adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.style.display = 'none';
    }
});

async function fetchPopularProducts() {
    console.log('Bắt đầu fetchPopularProducts');
    try {
        console.log('Gọi API:', `${API_URL}/products/latest?limit=4`);
        const response = await axios.get(`${API_URL}/products/latest?limit=4`, { timeout: 5000 });
        console.log('API Response:', response.data);
        const products = response.data;
        const container = document.getElementById('latest-products-container');
        if (!container) {
            console.error('Không tìm thấy container: latest-products-container');
            return;
        }
        if (!Array.isArray(products) || products.length === 0) {
            console.warn('Không tìm thấy sản phẩm');
            container.innerHTML = `<div class="col-span-full text-center text-yellow-500"><p>Không có sản phẩm nào được tìm thấy.</p></div>`;
            return;
        }
        container.innerHTML = products.map(product => {
            const imageUrl = product.image ? `${BASE_URL}${product.image}` : 'assets/img/default-product.png';
            console.log(`Render sản phẩm: ${product.name}, ảnh: ${imageUrl}`);
            return `
                <div class="popular_card bg-green-950 p-10 pt-24 rounded-md relative hover:shadow-2xl hover:-translate-y-1 duration-300 flex flex-col justify-between gap-5">
                    <div>
                        <img src="${imageUrl}" alt="${product.name}" loading="lazy"
                            onerror="this.src='assets/img/default-product.png'"
                            class="w-56 absolute -top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 duration-500">
                        <p class="italic text-slate-200 h-80 overflow-hidden">
                            ${product.description && product.description.length > 200
                                ? product.description.substring(0, 200) + '...' 
                                : product.description || 'Sản phẩm hữu cơ chất lượng cao, an toàn cho sức khỏe.'}
                        </p>
                    </div>
                    <h3 class="text-xl font-bold text-yellow-500">${product.name}</h3>
                    <div>
                        <div class="text-yellow-500 text-xs py-3">
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-fill"></i>
                            <i class="ri-star-half-fill"></i>
                            <i class="ri-star-line text-gray-400"></i>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xl text-yellow-400">${Number(product.price || 0).toLocaleString()}₫</p>
                            <button onclick="addToCartAPI('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price})" 
                                    class="bg-yellow-500 px-2 py-1 rounded-sm text-xl hover:bg-yellow-600 duration-300">
                                <i class="ri-shopping-cart-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        ScrollReveal().reveal('.popular_card', { delay: 200, distance: '20px', origin: 'bottom' });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error.message, error.response);
        const container = document.getElementById('latest-products-container');
        if (container) {
            container.innerHTML = `<div class="col-span-full text-center text-yellow-500"><p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p></div>`;
        }
    }
}

async function fetchAllProducts(page = 1, limit = 8) {
    const container = document.getElementById('products-container');
    const pagination = document.getElementById('pagination');
    if (!container || !pagination) {
        console.log('Không tìm thấy container hoặc pagination');
        return;
    }

    container.innerHTML = `<div class="col-span-full flex justify-center"><div class="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div></div>`;
    try {
        console.log(`Gọi API: ${API_URL}/products?page=${page}&limit=${limit}`);
        const response = await axios.get(`${API_URL}/products?page=${page}&limit=${limit}`, { timeout: 5000 });
        // Hỗ trợ cả hai kiểu trả về: mảng trực tiếp hoặc object { products, total }
        let products = response.data.products || response.data;
        let total = response.data.total;
        if (typeof total !== 'number') {
            if (Array.isArray(products)) {
                // Nếu không có total, ước lượng tổng dựa trên số lượng trang
                total = (products.length === limit) ? (page * limit + 1) : ((page - 1) * limit + products.length);
            } else {
                products = [];
                total = 0;
            }
        }

        if (!Array.isArray(products) || products.length === 0) {
            console.warn('Không tìm thấy sản phẩm');
            container.innerHTML = `<div class="col-span-full text-center text-yellow-500"><p>Không có sản phẩm nào được tìm thấy.</p></div>`;
            pagination.innerHTML = '';
            return;
        }

        container.innerHTML = products.map(product => {
            const imageUrl = product.image ? `${BASE_URL}${product.image}` : 'assets/img/default-product.png';
            return `
                <div class="bg-green-900 rounded-md p-6 flex flex-col items-center h-full">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy"
                        onerror="this.src='assets/img/default-product.png'"
                        class="w-40 h-40 object-contain mb-4 rounded">
                    <h3 class="text-xl font-bold text-yellow-500 mb-2 text-center">${product.name}</h3>
                    <p class="italic text-slate-200 text-center mb-2 flex-1">${product.description || 'Sản phẩm hữu cơ chất lượng cao, an toàn cho sức khỏe.'}</p>
                    <div class="text-yellow-500 text-xs py-2">
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-fill"></i>
                        <i class="ri-star-half-fill"></i>
                        <i class="ri-star-line text-gray-400"></i>
                    </div>
                    <div class="flex items-center justify-between w-full mt-2">
                        <p class="text-lg text-yellow-400 font-bold">${Number(product.price || 0).toLocaleString()}₫</p>
                        <button onclick="addToCartAPI('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price})" 
                                class="bg-yellow-500 px-4 py-2 rounded text-green-950 font-bold hover:bg-yellow-600 duration-300">
                            <i class="ri-shopping-cart-fill"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Render pagination
        const totalPages = Math.max(1, Math.ceil(total / limit));
        pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
            <button id="page-btn-${i + 1}" class="page-btn mx-1 px-3 py-1 rounded ${i + 1 === page ? 'bg-yellow-500 text-green-950' : 'bg-yellow-200 text-green-700'} font-bold hover:bg-yellow-400 duration-200">${i + 1}</button>
        `).join('');

        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pageNum = parseInt(btn.id.replace('page-btn-', ''));
                fetchAllProducts(pageNum, limit);
            });
        });

        ScrollReveal().reveal('.bg-green-900', { delay: 200, distance: '20px', origin: 'bottom' });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error.message, error.response);
        container.innerHTML = `<div class="col-span-full text-center text-yellow-500"><p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p></div>`;
        pagination.innerHTML = '';
    }
}

async function fetchCart() {
    console.log('Bắt đầu fetchCart');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Không có token, giỏ hàng rỗng');
            cart = [];
            updateCart();
            return;
        }
        console.log('Gọi API:', `${API_URL}/carts`);
        const response = await axios.get(`${API_URL}/carts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Cart API Response:', response.data);
        if (response.data && response.data.items) {
            cart = response.data.items.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                qty: item.quantity
            }));
            updateCart();
        } else {
            console.warn('Giỏ hàng rỗng hoặc dữ liệu không hợp lệ');
            cart = [];
            updateCart();
        }
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error.message, error.response);
        if (error.response && error.response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    }
}

async function addToCartAPI(productId, name, price) {
    console.log(`Thêm vào giỏ: ${name} (ID: ${productId})`);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            window.location.href = 'login.html';
            return;
        }
        await axios.post(`${API_URL}/carts`, { productId, quantity: 1 }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ productId, name, price, qty: 1 });
        }
        updateCart();
        alert(`Đã thêm ${name} vào giỏ hàng!`);
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error.message, error.response);
        if (error.response && error.response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            alert('Có lỗi xảy ra!');
        }
    }
}

window.removeFromCart = async function(productId, idx) {
    console.log(`Xóa khỏi giỏ: ${productId}`);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng!');
            window.location.href = 'login.html';
            return;
        }
        await axios.delete(`${API_URL}/carts/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        cart.splice(idx, 1);
        updateCart();
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error.message, error.response);
        if (error.response && error.response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        } else {
            alert('Có lỗi xảy ra!');
        }
    }
};

function updateCart() {
    console.log('Cập nhật giỏ hàng:', cart);
    if (!cartItems || !cartTotal || !cartCount) {
        console.warn('Cart elements not found');
        return;
    }
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        cartItems.innerHTML += `
            <div class="flex justify-between items-center border-b pb-2">
                <div>
                    <div class="font-bold text-green-100">${item.name}</div>
                    <div class="text-xs text-yellow-500">${item.price.toLocaleString()}₫ x ${item.qty}</div>
                </div>
                <button onclick="removeFromCart('${item.productId}', ${idx})" class="text-red-500 text-lg">×</button>
            </div>
        `;
    });
    cartTotal.textContent = total.toLocaleString() + '₫';
    if (cartCount) cartCount.textContent = cart.length; // Chỉ cập nhật nếu cartCount tồn tại
}