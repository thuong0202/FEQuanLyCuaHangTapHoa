$(document).ready(function () {
    // Khai báo các biến toàn cục để lưu trữ dữ liệu
    var labels = [];
    var valuesHangHoa = [];
    var valuesNhapHang = [];
    var valuesHoaDon = [];
    var valuesNhapHangBar = [];

    // Lấy dữ liệu cho biểu đồ lineChartDemo (hàng hóa)
    $.ajax({
        url: 'http://localhost:5282/api/ChiTietHoaDon',
        method: 'GET',
        success: function (data) {
            data.forEach(function (item) {
                labels.push(item.maHangHoa);
                valuesHangHoa.push(item.soLuong);
            });

            // Khi hoàn thành việc lấy dữ liệu từ API, kiểm tra và hiển thị dữ liệu nhập hàng
            loadNhapHangData();
        },
        error: function (xhr, status, error) {
            console.error("Lỗi khi lấy dữ liệu cho biểu đồ lineChartDemo: ", error);
        }
    });

    function loadNhapHangData() {
        // Lấy dữ liệu nhập hàng từ API
        $.ajax({
            url: 'http://localhost:5282/api/HoaDonNhapHang',
            method: 'GET',
            success: function (data) {
                data.forEach(function (item) {
                    valuesNhapHang.push(item.soLuong);
                });

                // Sau khi có tất cả dữ liệu, hiển thị biểu đồ
                renderLineChart();
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi lấy dữ liệu nhập hàng: ", error);
            }
        });
    }

    function renderLineChart() {
        var lineData = {
            labels: labels,
            datasets: [
                {
                    label: "Số lượng hàng hóa",
                    fillColor: "rgba(255, 255, 255, 0.158)",
                    strokeColor: "black",
                    pointColor: "rgb(220, 64, 59)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "green",
                    data: valuesHangHoa
                },
                {
                    label: "Doanh số nhập hàng",
                    fillColor: "rgba(255, 0, 0, 0.158)",
                    strokeColor: "red",
                    pointColor: "rgb(255, 0, 0)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "red",
                    data: valuesNhapHang
                }
            ]
        };

        var ctxl = $("#lineChartDemo").get(0).getContext("2d");
        new Chart(ctxl).Line(lineData);
    }

    // Lấy dữ liệu cho biểu đồ barChartDemo
    $.ajax({
        url: 'http://localhost:5282/api/HoaDon',
        method: 'GET',
        success: function (data) {
            var monthlyData = {};

            data.forEach(function (item) {
                var date = new Date(item.ngayLap);
                var month = date.getMonth() + 1;
                if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                }
                monthlyData[month] += item.tongTien;
            });

            for (var i = 1; i <= 12; i++) {
                valuesHoaDon.push(monthlyData[i] || 0);
            }

            // Sau khi có dữ liệu hóa đơn, lấy thêm dữ liệu nhập hàng cho bar chart
            loadNhapHangBarData();
        },
        error: function (xhr, status, error) {
            console.error("Lỗi khi lấy dữ liệu cho biểu đồ barChartDemo: ", error);
        }
    });

    function loadNhapHangBarData() {
        $.ajax({
            url: 'http://localhost:5282/api/HoaDonNhapHang',
            method: 'GET',
            success: function (data) {
                var monthlyNhapHangData = {};

                data.forEach(function (item) {
                    var date = new Date(item.ngayLap);
                    var month = date.getMonth() + 1;
                    if (!monthlyNhapHangData[month]) {
                        monthlyNhapHangData[month] = 0;
                    }
                    monthlyNhapHangData[month] += item.tongTien;
                });

                for (var i = 1; i <= 12; i++) {
                    valuesNhapHangBar.push(monthlyNhapHangData[i] || 0);
                }

                // Sau khi có tất cả dữ liệu, hiển thị biểu đồ
                renderBarChart();
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi lấy dữ liệu nhập hàng cho bar chart: ", error);
            }
        });
    }

    function renderBarChart() {
        var barData = {
            labels: labels,
            datasets: [
                {
                    label: "Tổng tiền hóa đơn",
                    fillColor: "rgba(255, 255, 255, 0.158)",
                    strokeColor: "rgb(220, 64, 59)",
                    data: valuesHoaDon
                },
                {
                    label: "Tổng tiền nhập hàng",
                    fillColor: "rgba(0, 0, 0, 0.158)",
                    strokeColor: "black",
                    data: valuesNhapHangBar
                }
            ]
        };

        var ctxb = $("#barChartDemo").get(0).getContext("2d");
        new Chart(ctxb).Bar(barData);
    }
});
