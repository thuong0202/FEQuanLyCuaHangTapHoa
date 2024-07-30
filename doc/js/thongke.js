// Tạo dictionary để lưu mã hàng hóa và tổng số lượng đã bán
const hangHoaDictionary = {};
const sanPhamBanChayList = []; // Biến trung gian để lưu thông tin sản phẩm bán chạy

document.addEventListener('DOMContentLoaded', function() {
    layThongTinChiTietHoaDon();

    // Hàm tính tổng số tiền của tất cả các hóa đơn
    function tinhTongSoTien(hoaDonList) {
        let tongSoTien = 0;
        
        hoaDonList.forEach(hoaDon => {
            // Cộng dồn tổng tiền của từng hóa đơn
            if (hoaDon.tongTien) {
                tongSoTien += hoaDon.tongTien;
            }
        });
        
        return tongSoTien;
    }

    // Gửi yêu cầu đến API để lấy thông tin hóa đơn
    fetch('http://localhost:5282/api/HoaDon')
        .then(response => response.json())
        .then(data => {
            // Tính tổng số tiền từ danh sách hóa đơn
            const tongSoTien = tinhTongSoTien(data);
            
            // Hiển thị tổng số tiền lên phần tử <div id="thuNhap">
            const thuNhapDiv = document.getElementById('thuNhap');
            if (thuNhapDiv) {
                thuNhapDiv.innerHTML = `
                    <h4>Tổng thu nhập</h4>
                    <p>${formatCurrency(tongSoTien)}</p>
                `;
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
    
    // Hàm định dạng số tiền thành tiền tệ
    function formatCurrency(value) {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
});

function layThongTinChiTietHoaDon() {
    // Gửi yêu cầu đến API để lấy thông tin chi tiết hóa đơn
    fetch('http://localhost:5282/api/ChiTietHoaDon')
        .then(response => response.json())
        .then(data => {
            // Duyệt qua danh sách chi tiết hóa đơn và lưu vào dictionary
            data.forEach(chiTiet => {
                const maHangHoa = chiTiet.maHangHoa;
                const soLuong = chiTiet.soLuong;
            
                if (maHangHoa && soLuong) {
                    // Cập nhật dictionary với mã hàng hóa và tổng số lượng đã bán
                    if (hangHoaDictionary[maHangHoa]) {
                        hangHoaDictionary[maHangHoa] += soLuong;
                    } else {
                        hangHoaDictionary[maHangHoa] = soLuong;
                    }
                }
            });            
            // In kết quả dictionary lên console
            console.log(hangHoaDictionary);

            // Lấy 5 mã sản phẩm có số lượng bán nhiều nhất
            layTop5SanPham(hangHoaDictionary);
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
}

function layTop5SanPham(dictionary) {
    // Chuyển đổi dictionary thành mảng các cặp [maHangHoa, soLuong]
    const entries = Object.entries(dictionary);

    // Sắp xếp mảng theo số lượng giảm dần
    entries.sort((a, b) => b[1] - a[1]);

    // Lấy 5 phần tử đầu tiên
    const top5 = entries.slice(0, 5);

    // Lấy thông tin chi tiết của 5 sản phẩm và hiển thị
    layThongTinSanPham(top5);
}

function layThongTinSanPham(top5) {
    const sanPhamTbody = document.getElementById('sanPham');
    sanPhamTbody.innerHTML = ''; // Xóa nội dung cũ (nếu có)
    
    // Tạo danh sách các promises để lấy thông tin sản phẩm từ API
    const promises = top5.map(([maHangHoa, soLuongDaBan]) => 
        fetch(`http://localhost:5282/api/HangHoa/${maHangHoa}`)
            .then(response => response.json())
            .then(sanPham => {
                // Thêm soLuongDaBan vào đối tượng sản phẩm và lưu vào danh sách sản phẩm bán chạy
                return { 
                    maHangHoa: sanPham.maHangHoa, 
                    tenHangHoa: sanPham.tenHangHoa, 
                    giaBan: sanPham.giaBan, 
                };
            })
    );

    // Sử dụng Promise.all để chờ tất cả các yêu cầu hoàn thành
    Promise.all(promises)
        .then(sanPhamList => {
            // Tạo các hàng cho bảng dựa trên thông tin sản phẩm
            const rows = sanPhamList.map(sanPham => `
                <tr>
                    <td>${sanPham.maHangHoa}</td>
                    <td>${sanPham.tenHangHoa}</td>
                    <td>${sanPham.giaBan}</td> <!-- Định dạng giá bán -->
                    <td>${hangHoaDictionary[sanPham.maHangHoa]}</td> <!-- Hiển thị số lượng đã bán -->
                </tr>
            `).join('');
            console.log('Dữ liệu trong sanPhamBanChayList:', sanPhamBanChayList);

            sanPhamTbody.innerHTML = rows;
        })
        .catch(error => {
            console.error('Có lỗi xảy ra khi lấy thông tin sản phẩm:', error);
        });
}
