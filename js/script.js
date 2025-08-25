document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Mở rộng Mini App ra toàn màn hình

    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const resultDiv = document.getElementById('result');

    // **QUAN TRỌNG:** Thay thế URL này bằng URL backend của bạn trên Render
    const API_ENDPOINT = 'https://telegram-downloader-api.onrender.com/download';

    downloadBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            tg.showAlert('Vui lòng nhập link video!');
            return;
        }

        // Vô hiệu hóa nút bấm và hiển thị loader
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Đang xử lý...</span>';
        loader.style.display = 'block';
        resultDiv.innerHTML = '';
        resultDiv.classList.remove('show');

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Đã có lỗi xảy ra.');
            }

            const data = await response.json();
            displayResult(data);

        } catch (error) {
            displayError(error.message);
        } finally {
            // Kích hoạt lại nút bấm và ẩn loader
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<i class="fas fa-download"></i><span>Tải về</span>';
            loader.style.display = 'none';
        }
    });

    function displayResult(data) {
        let bestFormat = data.formats.find(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4');
        if (!bestFormat) {
            bestFormat = data.formats[data.formats.length - 1]; // Lấy format cuối cùng nếu không tìm thấy mp4
        }

        const html = `
            <div class="video-info">
                <img src="${data.thumbnail}" alt="Thumbnail">
                <div class="details">
                    <h3>${data.title}</h3>
                </div>
            </div>
            <div class="formats">
                <a href="${bestFormat.url}" target="_blank" download>
                    Tải video (${bestFormat.format_note})
                </a>
            </div>
        `;
        resultDiv.innerHTML = html;
        resultDiv.classList.add('show');
        tg.HapticFeedback.notificationOccurred('success');
    }

    function displayError(message) {
        resultDiv.innerHTML = `<div class="error-message">${message}</div>`;
        resultDiv.classList.add('show');
        tg.HapticFeedback.notificationOccurred('error');
    }
});
