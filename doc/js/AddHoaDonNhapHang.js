
var productStock = {};
$(document).ready(function() {
    fetchHangHoa();
    fetchNhaCungCap();

    // Gọi hàm updateTotalPrice khi số lượng hoặc đơn giá thay đổi
    $('#quantity, #unitPrice').on('input', updateTotalPrice);

    // Xử lý sự kiện khi nhấn nút "Lưu hóa đơn"
    $('.btn-save').click(function() {
        saveInvoice();
    });
});

let hangHoaList = [];

// Fetch products (HangHoa) and populate the dropdown
function fetchHangHoa() {
    $.ajax({
        url: 'http://localhost:5282/api/HangHoa',
        type: 'GET',
        success: function(response) {
            hangHoaList = response; // Lưu danh sách hàng hóa
            updateHangHoaOptions(response);
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu hàng hóa:', error);
        }
    });
}

// Populate product (HangHoa) dropdown with options
function updateHangHoaOptions(hangHoaList) {
    var hangHoaSelect = $('#product');
    hangHoaSelect.empty();
    hangHoaSelect.append('<option value="">Chọn hàng hóa</option>');
    hangHoaList.forEach(function(hangHoa) {
        hangHoaSelect.append($('<option></option>')
            .attr('value', hangHoa.maHangHoa) // Sử dụng tên hàng hóa làm giá trị
            .text(hangHoa.tenHangHoa));
            productStock[hangHoa.maHangHoa] = hangHoa.soLuong
    });
}

// Fetch suppliers (NhaCungCap) and populate the dropdown
function fetchNhaCungCap() {
    $.ajax({
        url: 'http://localhost:5282/api/NhaCungCap',
        type: 'GET',
        success: function(response) {
            updateNhaCungCapOptions(response);
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu nhà cung cấp:', error);
        }
    });
}

// Populate supplier (NhaCungCap) dropdown with options
function updateNhaCungCapOptions(nhaCungCapList) {
    var nhaCungCapSelect = $('#supplier');
    nhaCungCapSelect.empty();
    nhaCungCapSelect.append('<option value="">Chọn nhà cung cấp</option>');
    nhaCungCapList.forEach(function(nhaCungCap) {
        nhaCungCapSelect.append($('<option></option>')
            .attr('value', nhaCungCap.maNhaCungCap)
            .text(nhaCungCap.tenNhaCungCap));
    });
}

// Update total price based on quantity and unit price
function updateTotalPrice() {
    var quantity = parseFloat($('#quantity').val());
    var unitPrice = parseFloat($('#unitPrice').val());
    var totalPrice = 0;

    if (!isNaN(quantity) && !isNaN(unitPrice)) {
        totalPrice = quantity * unitPrice;
    }

    $('#totalPrice').val(totalPrice.toFixed(2)); // Cập nhật trường tổng tiền
}

// Save invoice
function saveInvoice() {
    var invoiceDate = $('#invoiceDate').val();
    var invoiceTime = $('#invoiceTime').val();
    var quantity = parseFloat($('#quantity').val());
    var unitPrice = parseFloat($('#unitPrice').val());
    var supplierId = $('#supplier').val(); // Mã nhà cung cấp
    var productId = $('#product').val(); // Mã hàng hóa

    if (isNaN(quantity) || quantity <= 0) {
        alert('Số lượng phải lớn hơn 0.');
        return;
    }
    if (isNaN(unitPrice) || unitPrice <= 0) {
        alert('Đơn giá phải lớn hơn 0.');
        return;
    }

    var totalPrice = quantity * unitPrice;

    var invoiceData = {
        ngayLap: invoiceDate,
        gioLap: invoiceTime.toString(),
        soLuong: quantity,
        donGia: unitPrice,
        tongTien: totalPrice,
        maNhaCungCap: supplierId,
        maHangHoa: productId
    };

    $.ajax({
        url: 'http://localhost:5282/api/HoaDonNhapHang',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(invoiceData),
        success: function(response) {
            alert('Hóa đơn đã được lưu thành công');
            var newQuantity = productStock[invoiceData.maHangHoa] + invoiceData.soLuong;
            updateProductQuantity(invoiceData.maHangHoa, newQuantity);        
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lưu hóa đơn:', error);
            alert('Đã xảy ra lỗi khi lưu hóa đơn: ' + (error.responseJSON ? JSON.stringify(error.responseJSON) : error.responseText));
        }
    });
}


// Update product quantity based on product ID
function updateProductQuantity(maHangHoa, soLuong) {
    if (!maHangHoa || !soLuong) {
        alert('Mã hàng hóa hoặc số lượng không hợp lệ.');
        return;
    }

    const updatedProduct = {
        maHangHoa: maHangHoa,
        soLuong: soLuong
    };

    fetch(`http://localhost:5282/api/HangHoa/${maHangHoa}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(response => {
        if (response.ok) {
            console.log('Cập nhật số lượng sản phẩm thành công.');
            // Có thể thêm mã điều hướng nếu cần
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



