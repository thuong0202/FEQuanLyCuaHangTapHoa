document.addEventListener('DOMContentLoaded', function() {
    let hoaDonNhapHangList = [];

    fetch('http://localhost:5282/api/HoaDonNhapHang')
        .then(response => response.json())
        .then(data => {
            hoaDonNhapHangList = data;

            // Lấy danh sách mã hàng hóa và mã nhà cung cấp
            const maHangHoaList = [...new Set(hoaDonNhapHangList.map(hoaDon => hoaDon.maHangHoa))];
            const maNhaCungCapList = [...new Set(hoaDonNhapHangList.map(hoaDon => hoaDon.maNhaCungCap))];

            // Tạo promises để lấy thông tin hàng hóa và nhà cung cấp
            const hangHoaPromises = maHangHoaList.map(maHangHoa =>
                fetch(`http://localhost:5282/api/HangHoa/${maHangHoa}`)
                    .then(response => response.json())
                    .then(hangHoa => ({ maHangHoa, tenHangHoa: hangHoa.tenHangHoa }))
            );

            const nhaCungCapPromises = maNhaCungCapList.map(maNhaCungCap =>
                fetch(`http://localhost:5282/api/NhaCungCap/${maNhaCungCap}`)
                    .then(response => response.json())
                    .then(nhaCungCap => ({ maNhaCungCap, tenNhaCungCap: nhaCungCap.tenNhaCungCap }))
            );

            return Promise.all([...hangHoaPromises, ...nhaCungCapPromises]);
        })
        .then(results => {
            const hangHoaMap = {};
            const nhaCungCapMap = {};

            results.forEach(result => {
                if (result.maHangHoa) {
                    hangHoaMap[result.maHangHoa] = result.tenHangHoa;
                } else if (result.maNhaCungCap) {
                    nhaCungCapMap[result.maNhaCungCap] = result.tenNhaCungCap;
                }
            });

            hoaDonNhapHangList = hoaDonNhapHangList.map(hoaDon => ({
                ...hoaDon,
                tenHangHoa: hangHoaMap[hoaDon.maHangHoa] || 'Chưa có thông tin',
                tenNhaCungCap: nhaCungCapMap[hoaDon.maNhaCungCap] || 'Chưa có thông tin'
            }));

            hienThiDanhSachHoaDon(hoaDonNhapHangList);
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        });
});

function parseTimeString(timeString) {
    if (!timeString) return 'Chưa có thông tin'; // Kiểm tra nếu timeString null hoặc undefined
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    return date;
}

function hienThiDanhSachHoaDon(hoaDonList) {
    const hoaDonNhapHangTbody = document.getElementById('hoadonnhaphang');
    hoaDonNhapHangTbody.innerHTML = '';

    let tongTien = 0; // Biến lưu trữ tổng tiền

    hoaDonList.forEach(hoaDon => {
        tongTien += hoaDon.tongTien; // Cộng tổng tiền của mỗi hóa đơn vào biến tongTien

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hoaDon.maHoaDonNhapHang}</td>
            <td>${hoaDon.ngayLap ? new Date(hoaDon.ngayLap).toLocaleDateString('vi-VN') : 'Chưa có thông tin'}</td>
            <td>${hoaDon.gioLap ? parseTimeString(hoaDon.gioLap).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có thông tin'}</td>
            <td>${hoaDon.tenHangHoa}</td>
            <td>${hoaDon.tenNhaCungCap}</td>
            <td>${hoaDon.soLuong}</td>
            <td>${formatCurrency(hoaDon.donGia)}</td>
            <td>${formatCurrency(hoaDon.tongTien)}</td>
        `;
        hoaDonNhapHangTbody.appendChild(row);
    });

    // Thêm hàng tổng cộng vào cuối tbody
    const tongCongRow = document.createElement('tr');
    tongCongRow.innerHTML = `
        <th colspan="7">Tổng cộng:</th>
        <td>${formatCurrency(tongTien)}</td>
    `;
    hoaDonNhapHangTbody.appendChild(tongCongRow);
}

function formatCurrency(value) {
    return value ? Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 ₫';
}
