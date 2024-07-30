$(document).ready(function() {
    // Hàm tìm kiếm
    function searchItems(query) {
        console.log('Đang tìm kiếm sản phẩm với từ khóa:', query); // Log từ khóa tìm kiếm
        $.ajax({
            url: `http://localhost:5282/api/HangHoa/search?tenHangHoa=${encodeURIComponent(query)}`,
            method: 'GET',
            success: function(data) {
                console.log('Dữ liệu nhận được từ API HangHoa/search:', data); // Log dữ liệu từ API
                var tableBody = $('#sanPhamTableBody');
                tableBody.empty(); // Xóa nội dung cũ của bảng

                if(data.length === 0) {
                    console.log('Không tìm thấy sản phẩm nào.'); // Log khi không có sản phẩm nào được tìm thấy
                    tableBody.append('<tr><td colspan="10" class="text-center">Không tìm thấy sản phẩm nào.</td></tr>');
                    return;
                }

                data.forEach(function(item) {
                    console.log('Đang xử lý sản phẩm:', item); // Log từng sản phẩm
                    // Lấy thông tin danh mục
                    $.ajax(`http://localhost:5282/api/DanhMucSanPham/${item.maDanhMuc}`)
                        .done(function(danhMucResponse) {
                            console.log('Thông tin danh mục:', danhMucResponse); // Log thông tin danh mục
                            var danhMucName = danhMucResponse.tenDanhMuc;

                            // Lấy thông tin đơn vị tính
                            $.ajax(`http://localhost:5282/api/DonViTinh/${item.maDonViTinh}`)
                                .done(function(donViTinhResponse) {
                                    console.log('Thông tin đơn vị tính:', donViTinhResponse); // Log thông tin đơn vị tính
                                    var donViTinhName = donViTinhResponse.tenDonViTinh;

                                    // Thêm hàng mới vào bảng
                                    tableBody.append(`
                                        <tr>
                                            <td><input type="checkbox" /></td>
                                            <td>${item.maHangHoa}</td>
                                            <td>${item.tenHangHoa}</td>
                                            <td><img src="${item.hinhAnhHangHoa}" alt="${item.tenHangHoa}" width="100"></td>
                                            <td>${item.soLuong}</td>
                                            <td>${donViTinhName}</td>
                                            <td>${item.giaBan}</td>
                                            <td>${danhMucName}</td>
                                            <td>${item.thuongHieu}</td>
                                            <td>${item.moTaSanPham}</td>
                                            <td>Chức năng</td>
                                        </tr>
                                    `);
                                })
                                .fail(function() {
                                    alert('Đã xảy ra lỗi khi lấy thông tin đơn vị tính.');
                                });
                        })
                        .fail(function() {
                            alert('Đã xảy ra lỗi khi lấy thông tin danh mục.');
                        });
                });
            },
            error: function() {
                alert('Đã xảy ra lỗi khi tìm kiếm hàng hóa.');
            }
        });
    }

    // Sự kiện khi người dùng gõ vào ô tìm kiếm
    $('#searchInput').on('input', function() {
        var query = $(this).val();
        if(query) {
            searchItems(query);
        } else {
            $('#sanPhamTableBody').empty(); // Xóa bảng nếu không có từ khóa tìm kiếm
        }
    });
});
