document.addEventListener('DOMContentLoaded', function () {
  var userRole = localStorage.getItem('userRole');

  if (userRole === '1') {
    fetch('aside.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('app-sidebar-placeholder').innerHTML = html;
      })
      .catch(error => {
        console.error('Error fetching aside.html:', error);
      });
  } else if (userRole === '0') {
    fetch('asideNhanVien.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('app-sidebar-placeholder').innerHTML = html;
      })
      .catch(error => {
        console.error('Error fetching asideNhanVien.html:', error);
      });
  } else {
    console.error('Không thể xác định vai trò.');
  }

  loadNhanVien();
});

function loadNhanVien() {
  fetch('http://localhost:5282/api/NhanVien')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('nhanVienTableBody');
      tableBody.innerHTML = '';

      data.forEach(nhanVien => {
        const row = document.createElement('tr');
        row.setAttribute('id', `row-${nhanVien.maNhanVien}`);

        row.innerHTML = `
          <td><input type="checkbox" name="check1" value="1"></td>
          <td>${nhanVien.maNhanVien}</td>
          <td>${nhanVien.tenNhanVien}</td>
          <td>${nhanVien.diaChi}</td>
          <td>${new Date(nhanVien.ngaySinh).toLocaleDateString('en-GB')}</td>
          <td>${nhanVien.gioiTinh}</td>
          <td>${nhanVien.sdt}</td>
          <td>
            <div class="btn-group" role="group">
              <button class="btn btn-primary btn-sm trash" type="button" title="Xóa"><i class="fas fa-trash-alt"></i></button>
              <button class="btn btn-primary btn-sm edit" type="button" title="Sửa" data-toggle="modal" data-target="#ModalUP"><i class="fas fa-edit"></i></button>
              <button class="btn btn-primary btn-sm grant-account" type="button" title="Cấp tài khoản" data-toggle="modal" data-target="#capTK"><i class="fas fa-key"></i></button>
            </div>
          </td>
        `;

        // Thêm sự kiện xóa cho nút xóa
        row.querySelector('.trash').addEventListener('click', function () {
          if (confirm(`Bạn có chắc chắn muốn xóa nhân viên với mã ${nhanVien.maNhanVien}?`)) {
            fetch(`http://localhost:5282/api/NhanVien/${nhanVien.maNhanVien}`, {
              method: 'DELETE'
            })
            .then(response => {
              if (response.ok) {
                alert('Xóa thành công!');
                row.remove();
              } else {
                alert('Đã xảy ra lỗi khi xóa nhân viên.');
              }
            })
            .catch(error => {
              console.error('Fetch error:', error);
              alert('Đã xảy ra lỗi khi xóa nhân viên.');
            });
          }
        });

        // Thêm sự kiện chỉnh sửa nhân viên
        row.querySelector('.edit').addEventListener('click', function () {
          populateModal(nhanVien.maNhanVien);
        });

        // Thêm sự kiện cấp tài khoản
        row.querySelector('.grant-account').addEventListener('click', function () {
          populateGrantAccountModal(nhanVien.maNhanVien);
        });

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Đã xảy ra lỗi khi tải danh sách nhân viên.');
    });
}

function populateModal(maNhanVien) {
  fetch(`http://localhost:5282/api/NhanVien/${maNhanVien}`)
    .then(response => response.json())
    .then(data => {
      const modalBody = document.querySelector('#ModalUP .modal-body');
      modalBody.innerHTML = `
        <div class="form-group col-md-6">
          <label class="control-label">Mã nhân viên</label>
          <input class="form-control" type="text" name="maNhanVien" required disabled value="${data.maNhanVien}">
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Họ và tên</label>
          <input class="form-control" type="text" name="tenNhanVien" required value="${data.tenNhanVien}">
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Số điện thoại</label>
          <input class="form-control" type="text" name="sdt" required value="${data.sdt}">
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Địa chỉ</label>
          <input class="form-control" type="text" name="diaChi" required value="${data.diaChi}">
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Ngày sinh</label>
          <input class="form-control" type="date" name="ngaySinh" value="${new Date(data.ngaySinh).toISOString().split('T')[0]}">
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Giới tính</label>
          <select class="form-control" name="gioiTinh" required>
            <option ${data.gioiTinh === 'Nam' ? 'selected' : ''}>Nam</option>
            <option ${data.gioiTinh === 'Nữ' ? 'selected' : ''}>Nữ</option>
          </select>
        </div>
      `;
      modalBody.dataset.maNhanVien = maNhanVien;
    })
    .catch(error => {
      console.error('Error fetching employee details:', error);
      alert('Đã xảy ra lỗi khi tải thông tin nhân viên.');
    });
}

document.getElementById('luuNhanVien').addEventListener('click', function () {
  const maNhanVien = document.querySelector('#ModalUP .modal-body').dataset.maNhanVien;
  updateNhanVien(maNhanVien);
});

function updateNhanVien(maNhanVien) {
  const modalBody = document.querySelector('#ModalUP .modal-body');
  const tenNhanVien = modalBody.querySelector('input[name="tenNhanVien"]').value;
  const sdt = modalBody.querySelector('input[name="sdt"]').value;
  const diaChi = modalBody.querySelector('input[name="diaChi"]').value;
  const ngaySinh = modalBody.querySelector('input[name="ngaySinh"]').value;
  const gioiTinh = modalBody.querySelector('select[name="gioiTinh"]').value;

  const updatedData = {
    tenNhanVien: tenNhanVien,
    sdt: sdt,
    diaChi: diaChi,
    ngaySinh: ngaySinh,
    gioiTinh: gioiTinh
  };

  fetch(`http://localhost:5282/api/NhanVien/${maNhanVien}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  })
  .then(response => {
    if (response.ok) {
      alert('Cập nhật thành công!');
      $('#ModalUP').modal('hide'); // Ẩn modal
      loadNhanVien(); // Tải lại danh sách nhân viên
    } else {
      alert('Đã xảy ra lỗi khi cập nhật thông tin nhân viên.');
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    alert('Đã xảy ra lỗi khi cập nhật thông tin nhân viên.');
  });
}

function populateGrantAccountModal(maNhanVien) {
  fetch(`http://localhost:5282/api/NhanVien/${maNhanVien}`)
    .then(response => response.json())
    .then(data => {
      const modalBody = document.querySelector('#capTK .row');
      modalBody.innerHTML = `
        <div class="form-group col-md-6">
          <label class="control-label">Số điện thoại</label>
          <input class="form-control" type="text" name="sdt" required value="${data.sdt}" readonly>
        </div>
        <div class="form-group col-md-6">
          <label class="control-label">Mật khẩu mới</label>
          <input class="form-control" type="password" name="matKhau" required>
        </div>
        <button class="btn btn-primary" id="grantAccountButton">Cấp tài khoản</button>
      `;
      $('#capTK').modal('show'); // Hiển thị modal

      // Thêm sự kiện cho nút cấp tài khoản
      document.getElementById('grantAccountButton').addEventListener('click', function () {
        const matKhau = modalBody.querySelector('input[name="matKhau"]').value;
        if (matKhau.trim() === '') {
          alert('Vui lòng nhập mật khẩu.');
          return;
        }

        fetch(`http://localhost:5282/api/NhanVien/${maNhanVien}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "passwword": matKhau })
        })
        .then(response => {
          if (response.ok) {
            alert('Cấp tài khoản thành công!');
            $('#capTK').modal('hide'); // Ẩn modal
          } else {
            alert('Đã xảy ra lỗi khi cấp tài khoản.' + error);
          }
        })
        .catch(error => { // Đã thêm tham số lỗi
          console.error('Fetch error:' + error);
          alert('Đã xảy ra lỗi khi cấp tài khoản.' + error);
        });
      });
    })
    .catch(error => { // Đã thêm tham số lỗi
      console.error('Error fetching employee details:', error);
      alert('Đã xảy ra lỗi khi tải thông tin nhân viên.');
    });
}