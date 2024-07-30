var productStock = {};
$(document).ready(function() {
    fetchNhanVien();
    fetchKhachHang();
    populateProductOptions();

    // Tính tổng số tiền khi trang tải
    calculateTotalAmount();
    $('#addRow').click(addNewRow);
    $('#removeRow').click(removeLastRow);
    $('#luuHoaDon').click(saveAndPrintBill);
    $('#customerPayment').on('input', calculateChange);
    $(document).on('input', '.so--luong1, .sellingPrice', function() {
        updatePrice(this);
    });
});

function fetchNhanVien() {
    $.ajax({
        url: 'http://localhost:5282/api/NhanVien',
        type: 'GET',
        success: function(response) {
            updateNhanVienOptions(response);
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu:', error);
        }
    });
}

function updateNhanVienOptions(nhanVienList) {
    var nhanVienSelect = $('#nhanVien');
    nhanVienSelect.empty();
    nhanVienList.forEach(function(nhanVien) {
        nhanVienSelect.append($('<option></option>')
            .attr('value', nhanVien.maNhanVien)
            .attr('data-ten-nhan-vien', nhanVien.tenNhanVien)
            .text(nhanVien.tenNhanVien));
    });
}

function fetchKhachHang() {
    $.ajax({
        url: 'http://localhost:5282/api/KhachHang',
        type: 'GET',
        success: function(response) {
            updateKhachHangOptions(response);
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu:', error);
        }
    });
}

function updateKhachHangOptions(khachHangList) {
    var khachHangSelect = $('#khachHang');
    khachHangSelect.empty();
    khachHangList.forEach(function(khachHang) {
        khachHangSelect.append($('<option></option>')
            .attr('value', khachHang.maKhachHang)
            .attr('data-ten-khach-hang', khachHang.tenKhachHang)
            .text(khachHang.tenKhachHang));
    });
}

function calculateChange() {
    var total = parseFloat($('#total').text().replace(/[^0-9.-]+/g,""));
    var customerPayment = parseFloat($('#customerPayment').val());

    if (isNaN(customerPayment) || customerPayment < total) {
        $('.control-all-money').text("0 VNĐ");
    } else {
        var change = customerPayment - total;
        $('.control-all-money').text(change.toLocaleString() + " VNĐ");
    }
}

function calculateTotalAmount() {
    var total = 0;
    $('.table tbody tr').each(function() {
        var quantity = parseFloat($(this).find('input.so--luong1').val());
        var unitPrice = parseFloat($(this).find('.sellingPrice').val());
        var totalPrice = quantity * unitPrice;
        $(this).find('.totalPrice').text(totalPrice.toLocaleString() + " VNĐ");
        total += totalPrice;
    });
    $('#total').text(total.toLocaleString() + " VNĐ");
}

function updatePrice(element) {
    var $row = $(element).closest('tr');
    var quantity = parseFloat($row.find('input.so--luong1').val());
    var unitPrice = parseFloat($row.find('.sellingPrice').val());
    var productCode = $row.find('.productCode').val();

    // Kiểm tra số lượng không vượt quá số lượng có sẵn
    if (productCode && productStock[productCode] !== undefined && quantity > productStock[productCode]) {
        alert('Số lượng hàng không đủ.');
        $row.find('input.so--luong1').val(productStock[productCode]);
        quantity = productStock[productCode];
    }

    if (quantity < 0) {
        alert('Số lượng không thể âm. Vui lòng nhập lại.');
        $row.find('input.so--luong1').val(1);
        quantity = 1;
    }

    if (!isNaN(quantity) && !isNaN(unitPrice)) {
        var totalPrice = quantity * unitPrice;
        $row.find('.totalPrice').text(totalPrice.toLocaleString() + " VNĐ");
    }

    calculateTotalAmount();
}


function populateProductOptions() {
    $.ajax({
        url: 'http://localhost:5282/api/HangHoa',
        type: 'GET',
        success: function(response) {
            var $productSelects = $('.productCode');
            $productSelects.each(function() {
                var $select = $(this);
                $select.empty();
                $select.append('<option value="">Chọn mã hàng hóa</option>');
                response.forEach(function(product) {
                    $select.append(`<option value="${product.maHangHoa}" data-ten-hang="${product.tenHangHoa}" 
                        data-don-gia="${product.giaBan}" 
                        data-so-luong="${product.soLuong}">${product.maHangHoa}</option>`);
                    productStock[product.maHangHoa] = product.soLuong; // Lưu số lượng sản phẩm
                });
            });
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy dữ liệu:', error);
        }
    });
}

// Hàm gọi cập nhật số lượng hàng hóa sau khi lưu hóa đơn
function saveAndPrintBill() {
    calculateTotalAmount();

    const customerName = $('#khachHang option:selected').attr('data-ten-khach-hang');
    const customerID = $('#khachHang').val();
    const salesperson = $('#nhanVien option:selected').attr('data-ten-nhan-vien');
    const salespersonID = $('#nhanVien').val();
    const paymentMethod = $('#paymentMethod').val().trim();
    const orderDate = $('#ngayLap').val().trim();
    const customerPayment = parseFloat($('#customerPayment').val().trim());
    const total = parseFloat($('#total').text().replace(/[^0-9.-]+/g, ""));
    const change = customerPayment - total;

    // Tùy chọn: Tải lại trang sau khi in
    if (isNaN(customerPayment) || customerPayment <= 0 || customerPayment < total) {
        alert("Khách hàng đưa tiền phải lớn hơn không và lớn hơn tổng bill");
        return;
    }

    const billDetails = [];

    $('.table tbody tr.chiTietHoaDon').each(function() {
        const $row = $(this);
        const productCode = $row.find('.productCode').val();
        const productName = $row.find('.productCode option:selected').attr('data-ten-hang');
        const quantity = parseFloat($row.find('.so--luong1').val());
        const unitPrice = parseFloat($row.find('.sellingPrice').val());
        const totalPrice = quantity * unitPrice;

        if (productCode && quantity && unitPrice) {
            billDetails.push({
                maHangHoa: productCode,
                tenHangHoa: productName,
                soLuong: quantity,
                donGia: unitPrice,
                thanhTien: totalPrice
            });
        }
    });

    printBill(customerName, salesperson, paymentMethod, orderDate, total, customerPayment, change, billDetails);
    createBill(customerID, salespersonID, orderDate, total);
    updateProductQuantities(); // Cập nhật số lượng hàng hóa
}


function createBill(customerID, salespersonID, orderDate, total) {
    const billData = {
        maKhachHang: customerID,
        maNhanVien: salespersonID,
        ngayLap: orderDate,
        tongTien: total
    };

    $.ajax({
        url: 'http://localhost:5282/api/HoaDon',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(billData),
        success: function() {
            getLastBillID(); // Lấy mã hóa đơn cuối cùng sau khi tạo hóa đơn thành công
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lưu hóa đơn:', error);
        }
    });
}


function getLastBillID() {
    $.ajax({
        url: 'http://localhost:5282/api/HoaDon',
        type: 'GET',
        success: function(bills) {
            if (bills.length > 0) {
                const lastBill = bills[bills.length - 1];
                if (lastBill && lastBill.maHoaDon) {
                    createBillDetails(lastBill.maHoaDon);
                } else {
                    alert('Không nhận được mã hóa đơn từ phản hồi.');
                }
            } else {
                alert('Danh sách hóa đơn rỗng.');
            }
        },
        error: function(error) {
            console.error('Đã xảy ra lỗi khi lấy danh sách hóa đơn:', error);
        }
    });
}


function createBillDetails(billID) {
    // Tạo một mảng chứa tất cả các chi tiết hóa đơn
    let billDetailsList = [];

    $('.table tbody tr.chiTietHoaDon').each(function() {
        const $row = $(this);
        const productCode = $row.find('.productCode').val();
        const quantity = parseFloat($row.find('.so--luong1').val());
        const unitPrice = parseFloat($row.find('.sellingPrice').val());

        if (productCode && quantity && unitPrice) {
            const billDetails = {
                soLuong: quantity,
                donGia: unitPrice,
                thanhTien: quantity * unitPrice,
                maHangHoa: productCode,
                maHoaDon: billID
            };

            billDetailsList.push(billDetails);
        }
    });

    // Gửi từng chi tiết hóa đơn qua AJAX
    let errorOccurred = false;

    billDetailsList.forEach(details => {
        $.ajax({
            url: 'http://localhost:5282/api/ChiTietHoaDon',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(details),
            success: function() {
                console.log('Lưu chi tiết hóa đơn thành công:', details);
                // Cập nhật số lượng hàng hóa
                var newQuantity = productStock[details.maHangHoa] - details.soLuong;
                updateProductQuantity(details.maHangHoa, newQuantity);
            },
            error: function(error) {
                errorOccurred = true;
                console.error('Đã xảy ra lỗi khi lưu chi tiết hóa đơn:', error);
                alert('Đã xảy ra lỗi khi lưu chi tiết hóa đơn. ' + error.responseText);
            }
        });
    });

    // Thông báo khi tất cả các yêu cầu đã hoàn tất (chỉ thông báo nếu không có lỗi)
    if (!errorOccurred) {
        alert('Lưu hóa đơn thành công.');
    }
}




function handleError(error, message) {
    console.error(message, error);
    alert(`${message}\n${error.responseText}`);
}
function printBill(customerName, salesperson, paymentMethod, orderDate, total, customerPayment, change, billDetails) {
    let printContent = `
        <h3>Thông tin thanh toán</h3>
        <p>Họ tên khách hàng: ${customerName}</p>
        <p>Nhân viên bán hàng: ${salesperson}</p>
        <p>Hình thức thanh toán: ${paymentMethod}</p>
        <p>Ngày lập hóa đơn: ${orderDate}</p>
        <p>Tổng tiền: ${total.toLocaleString()} VNĐ</p>
        <p>Số tiền khách đưa: ${customerPayment.toLocaleString()} VNĐ</p>
        <p>Tiền thừa: ${change.toLocaleString()} VNĐ</p>
        <h3>Chi tiết hóa đơn</h3>
        <table border="1" style="width:100%">
            <thead>
                <tr>
                    <th>Mã hàng hóa</th>
                    <th>Tên hàng hóa</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Thêm chi tiết hóa đơn từ dữ liệu billDetails
    billDetails.forEach(detail => {
        printContent += `
            <tr>
                <td>${detail.maHangHoa}</td>
                <td>${detail.tenHangHoa}</td>
                <td>${detail.soLuong}</td>
                <td>${detail.donGia.toLocaleString()} VNĐ</td>
                <td>${detail.thanhTien.toLocaleString()} VNĐ</td>
            </tr>
        `;
    });

    printContent += `
            </tbody>
        </table>
    `;

    let printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Hóa đơn</title>
        </head>
        <body onload="window.print(); window.close();">
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
}


function handleError(error, message) {
    console.error(message, error);
    alert(`${message}\n${error.responseText}`);
}

function addNewRow() {
    var newRow = `<tr class="chiTietHoaDon">
                    <td><select class="productCode form-control" onchange="updateProductInfo(this)">
                        <option value="">Chọn mã hàng hóa</option>
                    </select></td>
                    <td><input type="text" class="form-control ten--hang" readonly /></td>
                    <td><input type="number" class="form-control so--luong1" value="1" min="1" /></td>
                    <td><input type="number" class="form-control sellingPrice" readonly /></td>
                    <td><span class="totalPrice">0 VNĐ</span></td>
                </tr>`;
    $('.table tbody').append(newRow);
    populateProductOptions(); // Cập nhật các tùy chọn hàng hóa mới
}


function removeLastRow() {
    var rows = $('.table tbody tr');
    if (rows.length > 1) {
        rows.last().remove();
        calculateTotalAmount();
    }
}

function updateProductInfo(selectElement) {
    var $row = $(selectElement).closest('tr');
    var selectedOption = $(selectElement).find('option:selected');
    var productName = selectedOption.data('ten-hang');
    var sellingPrice = selectedOption.data('don-gia');

    if (selectedOption.val() === "") {
        $row.find('.ten--hang').val('');
        $row.find('.sellingPrice').val('');
    } else {
        $row.find('.ten--hang').val(productName);
        $row.find('.sellingPrice').val(sellingPrice);
    }

    calculateTotalAmount();
}

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

