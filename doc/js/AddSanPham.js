$(document).ready(function() {
    var donViTinhList = []; // Biến lưu trữ danh sách đơn vị tính
    var danhMucList = []; // Biến lưu trữ danh sách danh mục

    // Hàm để lấy và hiển thị danh sách đơn vị tính từ API
    function fetchAndDisplayDonViTinh() {
        $.ajax({
            url: 'http://localhost:5282/api/DonViTinh',
            type: 'GET',
            success: function(data) {
                donViTinhList = data; // Lưu danh sách đơn vị tính vào biến toàn cục
                // Thêm một option mặc định nếu cần
                $('#donViTinh').append($('<option>').text('-- Chọn đơn vị tính --').attr('value', ''));
                // Duyệt qua danh sách đơn vị tính và thêm các option vào dropdown
                data.forEach(function(donViTinh) {
                    $('#donViTinh').append($('<option>').text(donViTinh.tenDonViTinh).attr('value', donViTinh.maDonViTinh));
                });
            },
            error: function(xhr) {
                swal("Lỗi", "Lỗi khi lấy danh sách đơn vị tính: " + xhr.responseText, "error");
            }
        });
    }

    // Hàm để lấy và hiển thị danh sách danh mục từ API
    function fetchAndDisplayDanhMuc() {
        $.ajax({
            url: 'http://localhost:5282/api/DanhMucSanPham',
            type: 'GET',
            success: function(data) {
                danhMucList = data; // Lưu danh sách danh mục vào biến toàn cục
                // Thêm một option mặc định nếu cần
                $('#danhMuc').append($('<option>').text('-- Chọn danh mục --').attr('value', ''));
                // Duyệt qua danh sách danh mục và thêm các option vào dropdown
                data.forEach(function(danhMuc) {
                    $('#danhMuc').append($('<option>').text(danhMuc.tenDanhMuc).attr('value', danhMuc.maDanhMuc));
                });
            },
            error: function(xhr) {
                swal("Lỗi", "Lỗi khi lấy danh sách danh mục: " + xhr.responseText, "error");
            }
        });
    }

    // Gọi hàm để lấy và hiển thị danh sách đơn vị tính và danh mục khi trang tải xong
    fetchAndDisplayDonViTinh();
    fetchAndDisplayDanhMuc();

    // Hàm để thêm sản phẩm
    function addProduct() {
        // Lấy thông tin từ form
        var productData = {
            tenHangHoa: $('#tenHangHoa').val(),
            soLuong: $('#soLuong').val(),
            moTaSanPham: $('#moTaSanPham').val(),
            giaBan: $('#giaBan').val(),
            thuongHieu: $('#thuongHieu').val(),
            hinhAnhHangHoa: $('#hinhAnhHangHoa').val(),
            tenDanhMuc: $('#danhMuc option:selected').text(), // Lấy tên danh mục từ dropdown
            tenDonViTinh: $('#donViTinh option:selected').text() // Lấy tên đơn vị tính từ dropdown
        };

        // Tìm maDanhMuc tương ứng với tenDanhMuc từ danhMucList
        var selectedDanhMuc = danhMucList.find(danhMuc => danhMuc.tenDanhMuc === productData.tenDanhMuc);

        // Kiểm tra nếu không tìm thấy danh mục
        if (!selectedDanhMuc) {
            swal("Lỗi", "Không tìm thấy danh mục cho tên: " + productData.tenDanhMuc, "error");
            return;
        }

        var maDM = selectedDanhMuc.maDanhMuc;

        // Tìm maDonViTinh tương ứng với tenDonViTinh từ donViTinhList
        var selectedDonViTinh = donViTinhList.find(donViTinh => donViTinh.tenDonViTinh === productData.tenDonViTinh);

        // Kiểm tra nếu không tìm thấy đơn vị tính
        if (!selectedDonViTinh) {
            swal("Lỗi", "Không tìm thấy đơn vị tính cho tên: " + productData.tenDonViTinh, "error");
            return;
        }

        var maDVT = selectedDonViTinh.maDonViTinh;

        // Gửi yêu cầu POST để thêm sản phẩm
        $.ajax({
            url: 'http://localhost:5282/api/HangHoa',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                tenHangHoa: productData.tenHangHoa,
                soLuong: parseInt(productData.soLuong),
                moTaSanPham: productData.moTaSanPham,
                giaBan: parseFloat(productData.giaBan),
                thuongHieu: productData.thuongHieu,
                hinhAnhHangHoa: productData.hinhAnhHangHoa,
                maDanhMuc: maDM,
                maDonViTinh: maDVT,
            }),
            success: function(response) {
                swal("Thành công", "Thêm sản phẩm thành công!", "success");
                // Reset form hoặc thực hiện các hành động khác sau khi thêm thành công
                window.location.href = 'quan-ly-sanpham.html';
                $('#addProductForm')[0].reset();
            },
            error: function(xhr) {
                var errorMessage = "Lỗi không xác định";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    errorMessage = xhr.responseText;
                }
                swal("Thất bại", errorMessage, "error");
            }
        });
    }

    // Bắt sự kiện khi nhấn vào nút "Lưu lại"
    $('#saveSanPham').on('click', function(event) {
        event.preventDefault();
        addProduct();
    });
});
