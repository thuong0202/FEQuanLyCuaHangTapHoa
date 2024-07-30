// Chờ cho DOM được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    // Gọi hàm validate khi người dùng nhấn nút đăng nhập hoặc tương tự
    document.getElementById('login-button').addEventListener('click', validate);
});

function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password-field").value;

    if (!username || !password) {
        swal({
            title: "",
            text: "Bạn chưa điền đầy đủ thông tin đăng nhập...",
            icon: "error",
            close: true,
            button: "Thử lại",
        });
        return false;
    }

    fetch('http://localhost:5282/api/NhanVien')
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi khi lấy thông tin người dùng.');
        }
        return response.json();
    })
    .then(data => {
        var foundUser = data.find(user => user.sdt === username && user.passwword === password);

        if (!foundUser) {
            throw new Error('Sai thông tin đăng nhập, hãy kiểm tra lại.');
        }

        var role = foundUser.role;

        if (role === 1) {
            window.location = "doc/trangchu.html"; // Đường dẫn của trang quản lý nhân viên
        } else if (role === 0) {
            window.location = "doc/quan-ly-sanpham.html"
        } else {
            throw new Error('Không thể xác định role.');
        }
        localStorage.setItem('userRole', role); // Lưu giá trị role vào localStorage
    })
    .catch(error => {
        console.error('Error occurred:', error);
        swal({
            title: "",
            text: error.message,
            icon: "error",
            close: true,
            button: "Thử lại",
        });
    });

    return false;
}
