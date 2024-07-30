$(document).ready(function() {
    $('#luuKhachHang').click(function(event) {
        event.preventDefault();
        var khachHang = {
            tenKhachHang: $('#tenKhachHang').val(),
            gioiTinh: $('#gt').val(),
            ngaySinh: $('#ngaySinh').val(),
            sdt: $('#sdtKhachHang').val(),
            diaChi: $('#diaChiKhachHang').val(),
            soDiem: $('#soDiem').val(),
        };

        $.ajax({
            url: 'http://localhost:5282/api/KhachHang',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(khachHang),
            success: function(response) {
                swal("Thành công", "Thêm khách hàng thành công!", "success");
                // Xóa giá trị các trường trong form sau khi thành công
                $('#tenKhachHang').val('');
                $('#gt').val('');
                $('#ngaySinh').val('');
                $('#sdtKhachHang').val('');
                $('#diaChiKhachHang').val('');
                $('#soDiem').val('');
                window.location = 'quan-ly-khachhang.html';
            },
            error: function(xhr) {
                var errorMessage = "Lỗi không xác định";
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    // Trường hợp API trả về lỗi dưới dạng văn bản
                    errorMessage = xhr.responseText;
                }
                swal("Thất bại", errorMessage, "error");
            }
        });
    });
});
