$(document).ready(function() {
    $('#save').click(function(event) {
        event.preventDefault();

        var nhaCungCap = {
            tenNhaCungCap: $('#TenNhaCungCap').val(),
            diaChi: $('#DiaChi').val(),
            sdt: $('#SDT').val()
        };

        $.ajax({
            url: 'http://localhost:5282/api/NhaCungCap',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nhaCungCap),
            success: function(response) {
                swal("Thành công", "Thêm nhà cung cấp thành công!", "success");
                $('#TenNhaCungCap').val('');
                $('#DiaChi').val('');
                $('#SDT').val('');
                window.location.href = `quan-ly-nhacungcap.html`;
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
