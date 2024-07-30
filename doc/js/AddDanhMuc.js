$(document).ready(function() {
    $('#danhmuc').click(function() {
        var tenDanhMuc = $('#tenDanhMuc').val();
        var hinhAnh = $('#hinhanh').val();
        var danhMucSanPham = {
            tenDanhMuc: tenDanhMuc,
            danhMucImageUrl: hinhAnh,
        };

        $.ajax({
            url: 'http://localhost:5282/api/DanhMucSanPham',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(danhMucSanPham),
            success: function(response) {
                swal("Thành công!", "Danh mục mới đã được thêm!", "success");
                window.location.href = `quan-ly-danhmuc.html?`;
            },
            error: function(error) {
                swal("Lỗi!", "Đã có lỗi xảy ra khi thêm danh mục mới.", "error");
            }
        });
    });
});
