const apiURL = 'http://localhost:5282/api/HangHoa';
const danhMucURL = 'http://localhost:5282/api/DanhMucSanPham';
const donViTinhURL = 'http://localhost:5282/api/DonViTinh';

let danhMucMap = {};
let donViTinhMap = {};

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('sanPhamTableBody')) {
    fetchDanhMuc();
    fetchDonViTinh();
    loadSanPham();
  }
  if (document.getElementById('editProductForm')) {
    populateProductData();
  }

  if (document.getElementById('saveChanges'))
   {
      saveProductChanges();
    }

  const deleteSelectedButton = document.getElementById('deleteSelected');
  if (deleteSelectedButton) {
    deleteSelectedButton.addEventListener('click', function () {
      deleteSelected();
    });
  }
});

function fetchDanhMuc() {
  fetch(danhMucURL)
    .then(response => response.json())
    .then(data => {
      danhMucMap = data.reduce((map, obj) => {
        map[obj.maDanhMuc] = obj.tenDanhMuc;
        return map;
      }, {});
      populateSelectOptions('danhMuc', danhMucMap);
    });
}

function fetchDonViTinh() {
  fetch(donViTinhURL)
    .then(response => response.json())
    .then(data => {
      donViTinhMap = data.reduce((map, obj) => {
        map[obj.maDonViTinh] = obj.tenDonViTinh;
        return map;
      }, {});
      populateSelectOptions('donViTinh', donViTinhMap);
    });
}

function loadSanPham() {
  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.getElementById('sanPhamTableBody');
      tableBody.innerHTML = '';
      data.forEach(sanPham => {
        const row = createTableRow(sanPham);
        tableBody.appendChild(row);
      });
    });
}

function createTableRow(sanPham) {
  const row = document.createElement('tr');
  row.setAttribute('id', `row-${sanPham.maHangHoa}`);
  row.setAttribute('data-maHangHoa', sanPham.maHangHoa);
  row.setAttribute('data-tenHangHoa', sanPham.tenHangHoa);
  row.setAttribute('data-soLuong', sanPham.soLuong);
  row.setAttribute('data-maDonViTinh', sanPham.maDonViTinh);
  row.setAttribute('data-maDanhMuc', sanPham.maDanhMuc);
  row.setAttribute('data-giaBan', sanPham.giaBan);
  row.setAttribute('data-thuongHieu', sanPham.thuongHieu);
  row.setAttribute('data-moTaSanPham', sanPham.moTaSanPham);
  row.setAttribute('data-hinhAnhHangHoa', sanPham.hinhAnhHangHoa);

  row.innerHTML = `
    <td><input type="checkbox" name="check1" value="1"></td>
    <td class="maHangHoa">${sanPham.maHangHoa}</td>
    <td class="tenHangHoa">${sanPham.tenHangHoa}</td>
    <td class="hinhAnhHangHoa"><img src="${sanPham.hinhAnhHangHoa}" style="width: 200px; height: auto;"></td>
    <td class="soLuong">${sanPham.soLuong}</td>
    <td class="donViTinh">${donViTinhMap[sanPham.maDonViTinh] || 'Chưa có'}</td>
    <td class="giaBan">${sanPham.giaBan}</td>
    <td class="danhMuc">${danhMucMap[sanPham.maDanhMuc] || 'Chưa có'}</td>
    <td class="thuongHieu">${sanPham.thuongHieu}</td>
    <td class="moTaSanPham">${sanPham.moTaSanPham}</td>
    <td>
      <button class="btn btn-primary btn-sm trash" type="button" title="Xóa"><i class="fas fa-trash-alt"></i></button>
      <button class="btn btn-primary btn-sm edit" type="button" title="Sửa"><i class="fas fa-edit"></i></button>
    </td>
  `;

  const deleteButton = row.querySelector('.trash');
  deleteButton.addEventListener('click', function () {
    deleteSanPham(sanPham.maHangHoa, row);
  });

  const editButton = row.querySelector('.edit');
  editButton.addEventListener('click', function () {
    redirectToEditPage(row);
  });

  return row;
}


function deleteSanPham(maHangHoa, row) {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    fetch(`${apiURL}/${maHangHoa}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          row.remove();
          alert('Xóa sản phẩm thành công.');
        } else {
          alert('Xóa sản phẩm thất bại.');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        alert('Đã xảy ra lỗi khi xóa sản phẩm.');
      });
  }
}

function deleteSelected() {
  const checkboxes = document.querySelectorAll('input[name="check1"]:checked');
  if (checkboxes.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm để xóa.');
    return;
  }

  if (confirm('Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?')) {
    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const maHangHoa = row.getAttribute('data-maHangHoa');
      deleteSanPham(maHangHoa, row);
    });
  }
}

function redirectToEditPage(row) {
  const queryParams = new URLSearchParams({
    maHangHoa: row.getAttribute('data-maHangHoa'),
    tenHangHoa: row.getAttribute('data-tenHangHoa'),
    soLuong: row.getAttribute('data-soLuong'),
    maDonViTinh: row.getAttribute('data-maDonViTinh'),
    maDanhMuc: row.getAttribute('data-maDanhMuc'),
    giaBan: row.getAttribute('data-giaBan'),
    thuongHieu: row.getAttribute('data-thuongHieu'),
    moTaSanPham: row.getAttribute('data-moTaSanPham'),
    hinhAnhHangHoa: row.getAttribute('data-hinhAnhHangHoa')
  });

  window.location.href = `chinhSuaSP.html?${queryParams.toString()}`;
}
// Function to populate select options
function populateSelectOptions(selectId, optionsMap) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = '';
  for (const [key, value] of Object.entries(optionsMap)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value;
    selectElement.appendChild(option);
  }
}
function populateProductData() {
  const urlParams = new URLSearchParams(window.location.search);

  const maHangHoa = urlParams.get('maHangHoa');
  const tenHangHoa = urlParams.get('tenHangHoa');
  const soLuong = urlParams.get('soLuong');
  const maDonViTinh = urlParams.get('maDonViTinh');
  const maDanhMuc = urlParams.get('maDanhMuc');
  const giaBan = urlParams.get('giaBan');
  const thuongHieu = urlParams.get('thuongHieu');
  const moTaSanPham = urlParams.get('moTaSanPham');
  const hinhAnhHangHoa = urlParams.get('hinhAnhHangHoa');

  document.getElementById('maHangHoa').value = maHangHoa;
  document.getElementById('tenHangHoa').value = tenHangHoa;
  document.getElementById('soLuong').value = soLuong;
  document.getElementById('giaBan').value = giaBan;
  document.getElementById('thuongHieu').value = thuongHieu;
  document.getElementById('moTa').value = moTaSanPham;
  document.getElementById('hinhAnhHangHoa').value = hinhAnhHangHoa;

  // Set the selected options for danhMuc and donViTinh after fetching the maps
  fetchDanhMuc();
  fetchDonViTinh();

  // After fetching the maps, set the selected options
  setTimeout(() => {
    document.getElementById('danhMuc').value = maDanhMuc;
    document.getElementById('donViTinh').value = maDonViTinh;
  }, 1000); // Adjust timeout as needed to ensure the maps are populated
}


function saveProductChanges() {
  const maHangHoa = document.getElementById('maHangHoa').value;
  const tenHangHoa = document.getElementById('tenHangHoa').value;
  const soLuong = document.getElementById('soLuong').value;
  const donViTinh = document.getElementById('donViTinh').value;
  const danhMuc = document.getElementById('danhMuc').value;
  const giaBan = document.getElementById('giaBan').value;
  const thuongHieu = document.getElementById('thuongHieu').value;
  const moTaSanPham = document.getElementById('moTa').value;
  const hinhAnhHangHoa = document.getElementById('hinhAnhHangHoa').value;

  const maDonViTinh = parseInt(donViTinh); // Ensure it's an integer
  const maDanhMuc = parseInt(danhMuc); // Ensure it's an integer
  console.log(maDanhMuc);
  if (!maDonViTinh || !maDanhMuc) {
    alert('Đơn vị tính hoặc danh mục không hợp lệ.');
    return;
  }

  const updatedProduct = {
    maHangHoa: parseInt(maHangHoa),
    tenHangHoa: tenHangHoa,
    soLuong: parseInt(soLuong),
    maDonViTinh: maDonViTinh, // Already parsed as integer
    maDanhMuc: maDanhMuc, // Already parsed as integer
    giaBan: parseFloat(giaBan),
    thuongHieu: thuongHieu,
    moTaSanPham: moTaSanPham,
    hinhAnhHangHoa: hinhAnhHangHoa
  };

  fetch(`${apiURL}/${maHangHoa}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedProduct)
  })
    .then(response => {
      if (response.ok) {
        alert('Cập nhật sản phẩm thành công.');
        window.location.href = 'quan-ly-sanpham.html'; // Chuyển hướng sau khi lưu
      } else {
        return response.json().then(errorData => {
          console.error('Error updating product:', errorData);
          alert('Cập nhật sản phẩm thất bại. Chi tiết lỗi đã được ghi lại.');
        });
      }
    })
    .catch(error => {
      console.error('Error updating product:', error);
      alert('Đã xảy ra lỗi khi cập nhật sản phẩm.');
    });
}


function deleteSanPham(maHangHoa, row) {
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
    fetch(`${apiURL}/${maHangHoa}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          row.remove();
          alert('Xóa sản phẩm thành công.');
        } else {
          alert('Xóa sản phẩm thất bại.');
        }
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        alert('Đã xảy ra lỗi khi xóa sản phẩm.');
      });
  }
}

function deleteSelected() {
  const checkboxes = document.querySelectorAll('input[name="check1"]:checked');
  if (checkboxes.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm để xóa.');
    return;
  }

  if (confirm('Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?')) {
    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr');
      const maHangHoa = row.getAttribute('data-maHangHoa');
      deleteSanPham(maHangHoa, row);
    });
  }
}
