$(document).ready(function() {
    $('#saveNhanVien').click(function(event) {
        event.preventDefault();

        var NhanVien = {
            tenNhanVien: $('#tenNhanVien').val(),
            gioiTinh: $('#gioiTinh').val(),
            ngaySinh: $('#ngaySinh').val(),
            sdt: $('#sdtNhanVien').val(),
            password: "string", // Sử dụng giá trị mặc định cho mật khẩu
            diaChi: $('#diaChiNhanVien').val(),
            role: 0 // Điều chỉnh giá trị này nếu cần
        };

        $.ajax({
            url: 'http://localhost:5282/api/NhanVien',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(NhanVien),
            success: function(response) {
                swal("Thành công", "Thêm nhân viên thành công!", "success");
                // Xóa giá trị các trường trong form sau khi thành công
                $('#tenNhanVien').val('');
                $('#gioiTinh').val('');
                $('#ngaySinh').val('');
                $('#sdtNhanVien').val('');
                $('#diaChiNhanVien').val('');
                window.location = 'quan-ly-nhanvien.html';
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
