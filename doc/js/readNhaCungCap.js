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

  // Load danh sách nhà cung cấp
  loadNhaCungCap();
});

function loadNhaCungCap() {
  // Gọi API để lấy dữ liệu nhà cung cấp
  fetch('http://localhost:5282/api/NhaCungCap')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('nhaCungCapTableBody');
      tableBody.innerHTML = ''; // Xóa các dữ liệu cũ trong tbody

      data.forEach(nhaCungCap => {
        const row = document.createElement('tr');
        row.setAttribute('id', `row-${nhaCungCap.maNhaCungCap}`);

        // Ô checkbox
        const checkboxCell = document.createElement('td');
        checkboxCell.innerHTML = '<input type="checkbox" name="check1" value="1">';
        row.appendChild(checkboxCell);

        // Ô mã nhà cung cấp
        const maNhaCungCapCell = document.createElement('td');
        maNhaCungCapCell.textContent = nhaCungCap.maNhaCungCap;
        row.appendChild(maNhaCungCapCell);

        // Ô tên nhà cung cấp
        const tenNhaCungCapCell = document.createElement('td');
        tenNhaCungCapCell.textContent = nhaCungCap.tenNhaCungCap;
        row.appendChild(tenNhaCungCapCell);

                // Ô địa chỉ
        const diaChiCell = document.createElement('td');
        diaChiCell.textContent = nhaCungCap.diaChi;
        row.appendChild(diaChiCell);

        // Ô số điện thoại
        const sdtCell = document.createElement('td');
        sdtCell.textContent = nhaCungCap.sdt;
        row.appendChild(sdtCell);



        // Ô Hành động
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `
          <button class="btn btn-primary btn-sm trash" type="button" title="Xóa"><i class="fas fa-trash-alt"></i></button>
          <button class="btn btn-primary btn-sm edit" type="button" title="Sửa" data-toggle="modal" data-target="#ModalUP"><i class="fas fa-edit"></i></button>`;
        
        // Thêm sự kiện xóa cho nút xóa
        const deleteButton = actionCell.querySelector('.trash');
        deleteButton.addEventListener('click', function () {
          if (confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp với mã ${nhaCungCap.maNhaCungCap}?`)) {
            fetch(`http://localhost:5282/api/NhaCungCap/${nhaCungCap.maNhaCungCap}`, {
              method: 'DELETE'
            })
            .then(response => {
              if (response.ok) {
                alert('Xóa thành công!');
                // Xóa hàng khỏi bảng
                row.remove();
              } else {
                alert('Đã xảy ra lỗi khi xóa nhà cung cấp.');
              }
            })
            .catch(error => {
              console.error('Fetch error:', error);
              alert('Đã xảy ra lỗi khi xóa nhà cung cấp.');
            });
          }
        });

        // Thêm sự kiện chỉnh sửa cho nút sửa
        const editButton = actionCell.querySelector('.edit');
        editButton.addEventListener('click', function () {
          // Populate modal with supplier details
          populateModal(nhaCungCap.maNhaCungCap);
        });
        row.appendChild(actionCell);

        // Thêm hàng vào table body
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Đã xảy ra lỗi khi tải danh sách nhà cung cấp.');
    });
}

function populateModal(maNhaCungCap) {
  // Fetch supplier details by ID from API
  fetch(`http://localhost:5282/api/NhaCungCap/${maNhaCungCap}`)
    .then(response => response.json())
    .then(data => {
      // Populate modal fields with supplier data
      const modalBody = document.querySelector('#ModalUP .modal-body');
      modalBody.innerHTML = `
        <div>
          <label for="tenNhaCungCap">Tên nhà cung cấp:</label>
          <input type="text" id="tenNhaCungCap" class="form-control" value="${data.tenNhaCungCap}">
        </div>
        <div>
          <label for="sdt">Số điện thoại:</label>
          <input type="text" id="sdt" class="form-control" value="${data.sdt}">
        </div>
        <div>
          <label for="diaChi">Địa chỉ:</label>
          <input type="text" id="diaChi" class="form-control" value="${data.diaChi}">
        </div>
      `;
      // Store the supplier ID in the modal for future reference
      modalBody.dataset.maNhaCungCap = maNhaCungCap;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Đã xảy ra lỗi khi tải dữ liệu từ API.');
    });
}

document.getElementById('saveChanges').addEventListener('click', function () {
  // Get the supplier ID from the modal
  const modalBody = document.querySelector('#ModalUP .modal-body');
  const maNhaCungCap = modalBody.dataset.maNhaCungCap;

  // Get updated supplier details from modal fields
  const tenNhaCungCap = document.getElementById('tenNhaCungCap').value;
  const sdt = document.getElementById('sdt').value;
  const diaChi = document.getElementById('diaChi').value;

  // Create updated supplier object
  const updatedSupplier = {
    maNhaCungCap: maNhaCungCap,
    tenNhaCungCap: tenNhaCungCap,
    sdt: sdt,
    diaChi: diaChi
  };

  // Send updated supplier details to API
  fetch(`http://localhost:5282/api/NhaCungCap/${maNhaCungCap}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedSupplier)
  })
  .then(response => {
    if (response.ok) {
      alert('Cập nhật thành công!');
      // Update the row in the table with new data
      const row = document.getElementById(`row-${maNhaCungCap}`);
      row.querySelector('.tenNhaCungCap').textContent = tenNhaCungCap;
      row.querySelector('.sdt').textContent = sdt;
      row.querySelector('.diaChi').textContent = diaChi;

      // Hide the modal
      $('#ModalUP').modal('hide');
    } else {
      alert('Đã xảy ra lỗi khi cập nhật nhà cung cấp.');
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    alert('Đã xảy ra lỗi khi cập nhật nhà cung cấp.');
  });
});

function deleteSelected() {
  // Lấy danh sách các checkbox được chọn
  const checkboxes = document.querySelectorAll('#nhaCungCapTableBody input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('Vui lòng chọn ít nhất một nhà cung cấp để xóa.');
    return;
  }

  // Xác nhận xóa các nhà cung cấp đã chọn
  if (confirm(`Bạn có chắc chắn muốn xóa ${checkboxes.length} nhà cung cấp đã chọn?`)) {
    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const maNhaCungCap = row.querySelector('td:nth-child(2)').textContent;

      fetch(`http://localhost:5282/api/NhaCungCap/${maNhaCungCap}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          alert(`Đã xóa thành công nhà cung cấp có mã ${maNhaCungCap}.`);
          // Xóa hàng khỏi bảng
          row.remove();
        } else {
          alert(`Đã xảy ra lỗi khi xóa nhà cung cấp có mã ${maNhaCungCap}.`);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert(`Đã xảy ra lỗi khi xóa nhà cung cấp có mã ${maNhaCungCap}.`);
      });
    });
  }
}
