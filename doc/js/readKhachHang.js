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
    
      loadKhachHang();
    });
    
    function loadKhachHang() {
      fetch('http://localhost:5282/api/KhachHang')
        .then(response => response.json())
        .then(data => {
          const tableBody = document.getElementById('tableKhachHang');
          tableBody.innerHTML = '';
    
          data.forEach(khachHang => {
            const row = document.createElement('tr');
            row.setAttribute('id', `row-${khachHang.maKhachHang}`);
    
            row.innerHTML = `
              <td><input type="checkbox" name="check1" value="1"></td>
              <td>${khachHang.maKhachHang}</td>
              <td>${khachHang.tenKhachHang}</td>
              <td>${khachHang.sdt}</td>
              <td>${khachHang.diaChi}</td>
              <td>${new Date(khachHang.ngaySinh).toLocaleDateString('en-GB')}</td>
              <td>${khachHang.gioiTinh}</td>
              <td>${khachHang.soDiem}</td>
              <td>
                <div class="btn-group" role="group">
                  <button class="btn btn-primary btn-sm trash" type="button" title="Xóa"><i class="fas fa-trash-alt"></i></button>
                  <button class="btn btn-primary btn-sm edit" type="button" title="Sửa" data-toggle="modal" data-target="#ModalUP"><i class="fas fa-edit"></i></button>
                </div>
              </td>
            `;
    
            // Thêm sự kiện xóa cho nút xóa
            row.querySelector('.trash').addEventListener('click', function () {
              if (confirm(`Bạn có chắc chắn muốn xóa nhân viên với mã ${khachHang.maKhachHang}?`)) {
                fetch(`http://localhost:5282/api/KhachHang/${khachHang.maKhachHang}`, {
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
    
            // Thêm sự kiện chỉnh sửa khách hàng
            row.querySelector('.edit').addEventListener('click', function () {
              populateModal(khachHang.maKhachHang);
            });
            tableBody.appendChild(row);
          });
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          alert('Đã xảy ra lỗi khi tải danh sách nhân viên.');
        });
    }
    
    function populateModal(maKhachHang) {
      fetch(`http://localhost:5282/api/KhachHang/${maKhachHang}`)
        .then(response => response.json())
        .then(data => {
          const modalBody = document.querySelector('#ModalUP .modal-body');
          modalBody.innerHTML = `
            <div class="form-group col-md-6">
              <label class="control-label">Mã Khách hàng</label>
              <input class="form-control" type="text" name="maKhachHang" required disabled value="${data.maKhachHang}">
            </div>
            <div class="form-group col-md-6">
              <label class="control-label">Họ và tên</label>
              <input class="form-control" type="text" name="tenKhachHang" required value="${data.tenKhachHang}">
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
              <div class="form-group col-md-6">
              <label class="control-label">Số điểm</label>
              <input class="form-control" type="text" name="soDiem" value="${data.soDiem}">
            </div>
          `;
          modalBody.dataset.maKhachHang = maKhachHang;
        })
        .catch(error => {
          console.error('Error fetching employee details:', error);
          alert('Đã xảy ra lỗi khi tải thông tin nhân viên.');
        });
    }
    
    document.getElementById('luuKhachHang').addEventListener('click', function () {
      const maKhachHang = document.querySelector('#ModalUP .modal-body').dataset.maKhachHang;
      updateNhanVien(maKhachHang);
    });
    
    function updateNhanVien(maKhachHang) {
      const modalBody = document.querySelector('#ModalUP .modal-body');
      const tenKhachHang = modalBody.querySelector('input[name="tenKhachHang"]').value;
      const sdt = modalBody.querySelector('input[name="sdt"]').value;
      const diaChi = modalBody.querySelector('input[name="diaChi"]').value;
      const ngaySinh = modalBody.querySelector('input[name="ngaySinh"]').value;
      const gioiTinh = modalBody.querySelector('select[name="gioiTinh"]').value;
      const soDiem = modalBody.querySelector('input[name="soDiem"]').value;

      const updatedData = {
        tenKhachHang: tenKhachHang,
        sdt: sdt,
        diaChi: diaChi,
        ngaySinh: ngaySinh,
        gioiTinh: gioiTinh,
        soDiem: soDiem,
      };
    
      fetch(`http://localhost:5282/api/KhachHang/${maKhachHang}`, {
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
          loadKhachHang(); // Tải lại danh sách nhân viên
        } else {
          alert('Đã xảy ra lỗi khi cập nhật thông tin nhân viên.');
          $('#ModalUP').modal('hide'); // Ẩn modal
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('Đã xảy ra lỗi khi cập nhật thông tin nhân viên.');
        $('#ModalUP').modal('hide'); // Ẩn modal

      });
    }

