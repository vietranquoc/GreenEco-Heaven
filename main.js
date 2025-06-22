/*~~~~~~~~~~~~~~~ TOGGLE BUTTON ~~~~~~~~~~~~~~~*/
const navMenu = document.getElementById("nav-menu")
const navLink = document.querySelectorAll(".nav-link")
const hamburger = document.getElementById("hamburger")

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("left-[0]")
    navMenu.classList.toggle("left-[-100%]")
    hamburger.classList.toggle("ri-close-large-line")
})

navLink.forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.toggle("left-[0]")
        navMenu.classList.toggle("left-[-100%]")
        hamburger.classList.toggle("ri-close-large-line")
    })
})

/*~~~~~~~~~~~~~~~ SHOW SCROLL UP ~~~~~~~~~~~~~~~*/

const scrollUp = () => {
    const scrollUpBtn = document.getElementById("scroll-up");

    if (this.scrollY >= 250) {
        scrollUpBtn.classList.remove("-bottom-1/2")
        scrollUpBtn.classList.add("bottom-4")
    } else {
        scrollUpBtn.classList.add("-bottom-1/2")
        scrollUpBtn.classList.remove("bottom-4")
    }
}

window.addEventListener("scroll", scrollUp)


/*~~~~~~~~~~~~~~~ CHANGE BACKGROUND HEADER ~~~~~~~~~~~~~~~*/

const scrollHeader = () => {
    const header = document.getElementById("navbar");

    if (this.scrollY >= 50) {
        header.classList.add("border-b", "border-yellow-500")
    } else {
        header.classList.remove("border-b", "border-yellow-500")
    }
}

window.addEventListener("scroll", scrollHeader)

/*~~~~~~~~~~~~~~~ SWIPER ~~~~~~~~~~~~~~~*/
const swiper = new Swiper('.swiper', {
    // Optional parameters
    speed: 400,
    spaceBetween: 30,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    loop: true,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    grabCursor: true,
        breakpoints: {
        640: {
            slidesPerView: 1,
        },
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    }
});


/*~~~~~~~~~~~~~~~ SCROLL SECTIONS ACTIVE LINK ~~~~~~~~~~~~~~~*/

const activeLink = () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    let current = "home";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;

        if (this.scrollY >= sectionTop - 60) {
            current = section.getAttribute("id");
        }
    })

    navLinks.forEach(link => {
        link.classList.remove("active");
        
        if (link.href.includes(current)) {  
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", activeLink)


/*~~~~~~~~~~~~~~~ SCROLL REVEAL ANIMATION ~~~~~~~~~~~~~~~*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 300,
    reset: true
});

sr.reveal(`.home_data, .about_top, .popular_top, .review_top, .reveiw_swiper,
    .footer_icon, .footer_content, .copy_right`)
sr.reveal(`.home_image`, { delay: 500, scale: 0.5})

sr.reveal(`.service_card, .popular_card`, {interval: 100})

sr.reveal(`.about_leaf`, {delay: 1000, origin: "right"})
sr.reveal(`.about_item_1_content, .about_item_2_img`, {origin: "right"})
sr.reveal(`.about_item_2_content, .about_item_1_img`, {origin: "left"})

sr.reveal(`.reveiw_leaf, .footer_floral`, {delay: 100, origin: "left"})


/*~~~~~~~~~~~~~~~ Cart ~~~~~~~~~~~~~~~*/
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo EmailJS
    emailjs.init("YOUR_PUBLIC_KEY"); // Thay YOUR_PUBLIC_KEY bằng public key của bạn

    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const payBtn = document.getElementById('pay-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const qrModal = document.getElementById('qr-modal');
    const closeQr = document.getElementById('close-qr');
    const thankyouModal = document.getElementById('thankyou-modal');
    const closeThankyou = document.getElementById('close-thankyou');

    // Kiểm tra xem các phần tử có tồn tại không
    if (!payBtn || !checkoutModal || !closeCheckout || !checkoutForm) {
        console.error('One or more elements not found:', {
            payBtn, checkoutModal, closeCheckout, checkoutForm
        });
        return;
    }

    let cart = [];

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach((item, idx) => {
            total += item.price * item.qty;
            cartItems.innerHTML += `
                <div class="flex justify-between items-center border-b pb-2">
                    <div>
                        <div class="font-bold">${item.name}</div>
                        <div class="text-xs text-yellow-500">${item.price.toLocaleString()}₫ x ${item.qty}</div>
                    </div>
                    <button onclick="removeFromCart(${idx})" class="text-red-500 text-lg">×</button>
                </div>
            `;
        });
        cartTotal.textContent = total.toLocaleString() + '₫';
        cartCount.textContent = cart.length;
    }

    window.removeFromCart = function(idx) {
        cart.splice(idx, 1);
        updateCart();
    };

    document.querySelectorAll('.ri-shopping-cart-fill').forEach(btn => {
        btn.closest('button').addEventListener('click', function(e) {
            e.preventDefault();
            const card = btn.closest('.popular_card, .product-item, .bg-green-900');
            const name = card.querySelector('h3, h2').textContent.trim();
            const priceEl = card.querySelector('.text-yellow-400');
            const price = priceEl ? Number(priceEl.textContent.replace(/[^\d]/g, '')) : 0;
            const found = cart.find(item => item.name === name);
            if (found) {
                found.qty += 1;
            } else {
                cart.push({ name, price, qty: 1 });
            }
            updateCart();
        });
    });


    cartBtn.addEventListener('click', e => {
        e.preventDefault();
        cartModal.classList.remove('hidden');
    });

    closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));

    // Mở checkout modal khi nhấn nút Thanh toán
    payBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Pay button clicked');
        if (cart.length === 0) {
            alert('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
            return;
        }
        console.log('Opening checkout modal');
        cartModal.classList.add('hidden');
        checkoutModal.classList.remove('hidden');
    });

    // Đóng checkout modal
    closeCheckout.addEventListener('click', () => {
        console.log('Closing checkout modal');
        checkoutModal.classList.add('hidden');
    });

    // Xử lý gửi form checkout
    // Xử lý gửi form checkout
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Checkout form submitted');
        const formData = new FormData(checkoutForm);
        const paymentMethod = formData.get('payment');
        const customerName = formData.get('name');
        const customerPhone = formData.get('phone');
        const customerAddress = formData.get('address');

        // Tạo nội dung đơn hàng
        const orderItems = cart.map(item => 
            `${item.name} - ${item.price.toLocaleString()}₫ x ${item.qty} = ${(item.price * item.qty).toLocaleString()}₫`
        ).join('\n');
        
        const totalAmount = cart.reduce((total, item) => total + (item.price * item.qty), 0).toLocaleString() + '₫';

        // Chuẩn bị dữ liệu gửi đi
        const formDataToSend = {
            access_key: "5e211e15-6ae3-4648-8115-5eff57d5b26b", // Thay bằng access key của bạn từ Web3Forms
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            payment_method: paymentMethod === 'online' ? 'Thanh toán online' : 'Thanh toán khi nhận hàng',
            order_items: orderItems,
            total_amount: totalAmount
        };

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(formDataToSend)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log("Form submitted successfully");
                // Đóng checkout modal
                checkoutModal.classList.add('hidden');

                if (paymentMethod === 'online') {
                    console.log('Opening QR modal');
                    qrModal.classList.remove('hidden');
                } else {
                    console.log('Opening thankyou modal');
                    thankyouModal.classList.remove('hidden');
                    cart = [];
                    updateCart();
                }
            } else {
                throw new Error("Form submission failed");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại sau.");
        }
    });

    // Đóng QR modal
    closeQr.addEventListener('click', () => {
        console.log('Closing QR modal');
        qrModal.classList.add('hidden');
        thankyouModal.classList.remove('hidden');
        cart = [];
        updateCart();
    });

    // Đóng thankyou modal
    closeThankyou.addEventListener('click', () => {
        console.log('Closing thankyou modal');
        thankyouModal.classList.add('hidden');
    });
});


/*~~~~~~~~~~~~~~~ Pagination ~~~~~~~~~~~~~~~*/
const productsPerPage = 8;
const products = document.querySelectorAll('.product-item');
const totalProducts = products.length;
const totalPages = Math.ceil(totalProducts / productsPerPage);
const pagination = document.getElementById('pagination');

function showPage(page) {
    products.forEach((item, idx) => {
        if (idx >= (page-1)*productsPerPage && idx < page*productsPerPage) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
    // Highlight nút trang hiện tại
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('bg-yellow-500', 'text-green-950');
        btn.classList.add('bg-yellow-200', 'text-green-700');
    });
    document.getElementById('page-btn-' + page).classList.add('bg-yellow-500', 'text-green-950');
    document.getElementById('page-btn-' + page).classList.remove('bg-yellow-200', 'text-green-700');
}

// Tạo nút phân trang
let pagHTML = '';
for (let i = 1; i <= totalPages; i++) {
    pagHTML += `<button id="page-btn-${i}" class="page-btn mx-1 px-3 py-1 rounded bg-yellow-200 text-green-700 font-bold hover:bg-yellow-400 duration-200">${i}</button>`;
}
pagination.innerHTML = pagHTML;

// Gán sự kiện click cho các nút
for (let i = 1; i <= totalPages; i++) {
    document.getElementById('page-btn-' + i).addEventListener('click', () => showPage(i));
}

// Hiển thị trang đầu tiên khi load
showPage(1);

/*~~~~~~~~~~~~~~~ Newsletter Form ~~~~~~~~~~~~~~~*/
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[name="email"]').value;
            
            // Chuẩn bị dữ liệu gửi đi
            const formDataToSend = {
                access_key: "5e211e15-6ae3-4648-8115-5eff57d5b26b",
                email: email,
                subject: "Đăng ký nhận thông báo từ GreenEco Heaven",
                message: `Cảm ơn bạn đã đăng ký nhận thông báo từ GreenEco Heaven!\n\nChúng tôi sẽ gửi cho bạn những thông tin mới nhất về:\n- Sản phẩm mới\n- Chương trình khuyến mãi\n- Các sự kiện đặc biệt\n\nTrân trọng,\nGreenEco Heaven Team`
            };

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify(formDataToSend)
                });

                const result = await response.json();
                
                if (result.success) {
                    alert("Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin mới nhất đến email của bạn.");
                    this.reset();
                } else {
                    throw new Error("Form submission failed");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
            }
        });
    }
});