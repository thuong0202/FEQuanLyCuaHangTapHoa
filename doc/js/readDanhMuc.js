// main.js
const apiURL = 'http://localhost:5282/api/DanhMucSanPham';

document.addEventListener('DOMContentLoaded', function () {
  var userRole = localStorage.getItem('userRole');
  if (userRole === '1') {
    fetchSidebar('aside.html', 'app-sidebar-placeholder');
  } else if (userRole === '0') {
    fetchSidebar('asideNhanVien.html', 'app-sidebar-placeholder');
  } else {
    console.error('Không thể xác định vai trò.');
  }

  // Load danh sách danh mục sản phẩm
  loadDanhMucSanPham();
});

function fetchSidebar(url, placeholderId) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById(placeholderId).innerHTML = html;
    })
    .catch(error => {
      console.error(`Error fetching ${url}:`, error);
    });
}

function loadDanhMucSanPham() {
  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('danhMucTableBody');
      tableBody.innerHTML = ''; // Xóa các dữ liệu cũ trong tbody

      data.forEach(danhMucSanPham => {
        const row = createTableRow(danhMucSanPham);
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Đã xảy ra lỗi khi tải danh sách danh mục sản phẩm.');
    });
}

function createTableRow(danhMucSanPham) {
  const row = document.createElement('tr');
  row.setAttribute('id', `row-${danhMucSanPham.maDanhMuc}`);

  row.innerHTML = `
    <td><input type="checkbox" name="check1" value="1"></td>
    <td class="maDanhMuc">${danhMucSanPham.maDanhMuc}</td>
    <td class="tenDanhMuc">${danhMucSanPham.tenDanhMuc}</td>
    <td class="danhMucImageUrl"><img src="${danhMucSanPham.danhMucImageUrl}" alt="Hình ảnh danh mục" style="width: 100px; height: auto;"></td>
    <td>
      <button class="btn btn-primary btn-sm trash" type="button" title="Xóa"><i class="fas fa-trash-alt"></i></button>
      <button class="btn btn-primary btn-sm edit" type="button" title="Sửa" data-toggle="modal" data-target="#ModalUP"><i class="fas fa-edit"></i></button>
    </td>
  `;

  // Thêm sự kiện xóa cho nút xóa
  const deleteButton = row.querySelector('.trash');
  deleteButton.addEventListener('click', function () {
    deleteDanhMucSanPham(danhMucSanPham.maDanhMuc, row);
  });

  // Thêm sự kiện chỉnh sửa cho nút edit
  const editButton = row.querySelector('.edit');
  editButton.addEventListener('click', function () {
    populateModal(danhMucSanPham.maDanhMuc);
  });

  return row;
}

function populateModal(maDanhMuc) {
  fetch(`${apiURL}/${maDanhMuc}`)
    .then(response => response.json())
    .then(data => {
      const modalBody = document.querySelector('#ModalUP .modal-body');
      modalBody.innerHTML = `
        <div>
          <label for="tenNhaCungCap">Tên danh mục:</label>
          <input type="text" id="tenNhaCungCap" class="form-control" value="${data.tenDanhMuc}">
        </div>
        <div>
          <label for="diaChi">Ảnh danh mục:</label>
          <input type="text" id="diaChi" class="form-control" value="${data.danhMucImageUrl}">
        </div>
      `;

      modalBody.dataset.maDanhMuc = maDanhMuc;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Đã xảy ra lỗi khi tải dữ liệu từ API.');
    });
}

document.getElementById('saveChanges').addEventListener('click', function () {
  const modalBody = document.querySelector('#ModalUP .modal-body');
  const maDanhMuc = modalBody.dataset.maDanhMuc;
  const tenDanhMuc = document.getElementById('tenNhaCungCap').value; // Corrected ID
  const danhMucImageUrl = document.getElementById('diaChi').value; // Corrected ID

  const updatedCategory = {
    maDanhMuc: parseInt(maDanhMuc),
    tenDanhMuc: tenDanhMuc,
    danhMucImageUrl: danhMucImageUrl
  };

  fetch(`${apiURL}/${maDanhMuc}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedCategory)
    })
    .then(response => {
      if (response.ok) {
        alert('Cập nhật thành công!');
        const row = document.getElementById(`row-${maDanhMuc}`);
        row.querySelector('.tenDanhMuc').textContent = tenDanhMuc;
        const imgElement = row.querySelector('.danhMucImageUrl img');
        imgElement.src = danhMucImageUrl;
        imgElement.alt = 'Hình ảnh danh mục';
        $('#ModalUP').modal('hide');
      } else {
        alert('Đã xảy ra lỗi khi cập nhật danh mục sản phẩm.');
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Đã xảy ra lỗi khi cập nhật danh mục sản phẩm.');
    });
});

function deleteDanhMucSanPham(maDanhMuc, row) {
  if (confirm(`Bạn có chắc chắn muốn xóa danh mục sản phẩm với mã ${maDanhMuc}?`)) {
    fetch(`${apiURL}/${maDanhMuc}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          alert('Xóa thành công!');
          row.remove();
        } else {
          alert('Đã xảy ra lỗi khi xóa danh mục sản phẩm.');
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert('Đã xảy ra lỗi khi xóa danh mục sản phẩm.');
      });
  }
}

function deleteSelected() {
  const checkboxes = document.querySelectorAll('#danhMucTableBody input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('Vui lòng chọn ít nhất một danh mục để xóa.');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa ${checkboxes.length} danh mục đã chọn?`)) {
    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const maDanhMuc = row.querySelector('.maDanhMuc').textContent;

      fetch(`${apiURL}/${maDanhMuc}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (response.ok) {
            alert(`Đã xóa thành công danh mục có mã ${maDanhMuc}.`);
            row.remove();
          } else {
            alert(`Đã xảy ra lỗi khi xóa danh mục có mã ${maDanhMuc}.`);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
          alert(`Đã xảy ra lỗi khi xóa danh mục có mã ${maDanhMuc}.`);
        });
    });
  }
}
