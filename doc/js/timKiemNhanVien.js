$(document).ready(function() {
    $('#searchNV').on('input', function() {
        var tenNhanVien = $(this).val();
        if (tenNhanVien) {
            searchNhanVien(tenNhanVien);
        } else {
            $('#nhanVienTableBody').empty();
        }
    });

    function searchNhanVien(tenNhanVien) {
        $.ajax({
            url: `http://localhost:5282/api/NhanVien/search?tenNhanVien=${encodeURIComponent(tenNhanVien)}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                displayNhanVien(data);
            },
            error: function(xhr, status, error) {
                console.error('Lỗi khi tìm kiếm nhân viên:', xhr, status, error);
                $('#nhanVienTableBody').empty();
            }
        });
    }

    function displayNhanVien(data) {
        $('#nhanVienTableBody').empty();
        data.forEach(function(nhanVien) {
            var row = `
                <tr>
                    <td><input type="checkbox" value="${nhanVien.maNhanVien}"></td>
                    <td>${nhanVien.maNhanVien}</td>
                    <td>${nhanVien.tenNhanVien}</td>
                    <td>${nhanVien.diaChi}</td>
                    <td>${nhanVien.ngaySinh}</td>
                    <td>${nhanVien.gioiTinh}</td>
                    <td>${nhanVien.sdt}</td>
                    <td>
                        <!-- Các nút chức năng có thể thêm vào đây -->
                    </td>
                </tr>
            `;
            $('#nhanVienTableBody').append(row);
        });
    }
});