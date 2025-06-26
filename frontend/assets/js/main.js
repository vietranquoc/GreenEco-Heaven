// Newsletter form handling
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[name="email"]').value;
            
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: 'YOUR-WEB3FORMS-ACCESS-KEY', // Replace with your Web3Forms access key
                        email: email,
                        subject: 'Đăng ký nhận thông báo từ GreenEco Heaven',
                        message: `Email ${email} đã đăng ký nhận thông báo từ GreenEco Heaven`
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    alert('Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin mới nhất đến email của bạn.');
                    newsletterForm.reset();
                } else {
                    alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        });
    }
}); 