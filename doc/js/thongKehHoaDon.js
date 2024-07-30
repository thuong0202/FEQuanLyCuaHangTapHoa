document.addEventListener('DOMContentLoaded', function() {
    // Tạo biến trung gian để lưu thông tin hóa đơn
    let hoaDonList = [];

    // Gửi yêu cầu đến API để lấy thông tin hóa đơn
    fetch('http://localhost:5282/api/HoaDon')
        .then(response => response.json())
        .then(data => {
            // Lưu dữ liệu vào biến trung gian
            hoaDonList = data;
            
            // Tạo danh sách mã nhân viên và mã khách hàng từ danh sách hóa đơn
            const maNhanVienList = [...new Set(hoaDonList.map(hoaDon => hoaDon.maNhanVien))];
            const maKhachHangList = [...new Set(hoaDonList.map(hoaDon => hoaDon.maKhachHang))];
            
            // Tạo các promises để lấy thông tin nhân viên và khách hàng
            const nhanVienPromises = maNhanVienList.map(maNhanVien => 
                fetch(`http://localhost:5282/api/NhanVien/${maNhanVien}`)
                    .then(response => response.json())
                    .then(nhanVien => ({ maNhanVien, tenNhanVien: nhanVien.tenNhanVien }))
            );
            
            const khachHangPromises = maKhachHangList.map(maKhachHang => 
                fetch(`http://localhost:5282/api/KhachHang/${maKhachHang}`)
                    .then(response => response.json())
                    .then(khachHang => ({ maKhachHang, tenKhachHang: khachHang.tenKhachHang }))
            );

            // Thực hiện tất cả các yêu cầu API đồng thời
            return Promise.all([...nhanVienPromises, ...khachHangPromises]);
        })
        .then(results => {
            // Tạo đối tượng để lưu thông tin nhân viên và khách hàng
            const nhanVienMap = {};
            const khachHangMap = {};

            // Phân loại kết quả
            results.forEach(result => {
                if (result.maNhanVien) {
                    nhanVienMap[result.maNhanVien] = result.tenNhanVien;
                } else if (result.maKhachHang) {
                    khachHangMap[result.maKhachHang] = result.tenKhachHang;
                }
            });

            // Cập nhật danh sách hóa đơn với tên nhân viên và khách hàng
            hoaDonList = hoaDonList.map(hoaDon => ({
                ...hoaDon,
                tenNhanVien: nhanVienMap[hoaDon.maNhanVien] || 'Chưa có thông tin',
                tenKhachHang: khachHangMap[hoaDon.maKhachHang] || 'Chưa có thông tin'
            }));

            // Hiển thị dữ liệu hóa đơn vào bảng
            hienThiDanhSachHoaDon(hoaDonList);
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
});

function hienThiDanhSachHoaDon(hoaDonList) {
    const thongKeDonHangTbody = document.getElementById('thongKeDonHang');
    
    // Xóa nội dung cũ của tbody
    thongKeDonHangTbody.innerHTML = '';

    // Tạo hàng cho mỗi hóa đơn và tính tổng tiền
    let tongTien = 0;
    hoaDonList.forEach(hoaDon => {
        tongTien += hoaDon.tongTien || 0; // Cộng dồn tổng tiền

        // Tạo một hàng cho bảng
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hoaDon.maHoaDon}</td>
            <td>${hoaDon.tenKhachHang}</td>
            <td>${hoaDon.tenNhanVien}</td>
            <td>${hoaDon.ngayLap ? new Date(hoaDon.ngayLap).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</td>
            <td>${formatCurrency(hoaDon.tongTien)}</td>
        `;
        thongKeDonHangTbody.appendChild(row);
    });

    // Thêm hàng tổng cộng vào cuối tbody
    const tongCongRow = document.createElement('tr');
    tongCongRow.innerHTML = `
        <th colspan="4">Tổng cộng:</th>
        <td>${formatCurrency(tongTien)}</td>
    `;
    thongKeDonHangTbody.appendChild(tongCongRow);
}

function formatCurrency(value) {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
