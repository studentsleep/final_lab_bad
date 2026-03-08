// ==========================================
// ข้อ 1: ระบบคำนวณภาษีหัก ณ ที่จ่าย (แบบขั้นบันได)
// ==========================================
function calculateTax() {
    let incomeInput = document.getElementById('incomeInput');
    let income = parseFloat(incomeInput.value);
    let resultDiv = document.getElementById('taxResult');

    if (isNaN(income) || income < 0) {
        // ใช้ SweetAlert แจ้งเตือน Error
        Swal.fire({
            icon: 'error',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกรายได้เป็นตัวเลขที่ถูกต้อง',
            confirmButtonColor: '#3085d6'
        });
        incomeInput.value = '';
        resultDiv.classList.add('hidden');
        return;
    }

    let tax = 0;
    if (income > 500000) {
        tax += (income - 500000) * 0.15;
        tax += (500000 - 300000) * 0.10;
        tax += (300000 - 150000) * 0.05;
    } else if (income > 300000) {
        tax += (income - 300000) * 0.10;
        tax += (300000 - 150000) * 0.05;
    } else if (income > 150000) {
        tax += (income - 150000) * 0.05;
    }

    let netIncome = income - tax;

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="space-y-2">
            <h3 class="font-bold text-lg mb-2">📊 สรุปผลการคำนวณภาษี</h3>
            <div class="flex justify-between border-b border-blue-200 pb-2">
                <span>รายได้รวมทั้งหมด:</span>
                <span class="font-semibold">${income.toLocaleString()} บาท</span>
            </div>
            <div class="flex justify-between border-b border-blue-200 pb-2 text-red-600">
                <span>ภาษีที่ต้องชำระ:</span>
                <span class="font-bold">${tax.toLocaleString()} บาท</span>
            </div>
            <div class="flex justify-between pt-2 text-green-700 text-lg">
                <span>รายได้สุทธิหลังหักภาษี:</span>
                <span class="font-bold">${netIncome.toLocaleString()} บาท</span>
            </div>
        </div>
    `;
}

// ==========================================
// ข้อ 2: ระบบจัดการสต็อกสินค้า (POS Inventory)
// ==========================================
let products = [
    { id: 'P01', name: 'Premium Matcha Powder 100g', price: 450, stock: 30 },
    { id: 'P02', name: 'Green Box Salad Set', price: 120, stock: 15 },
    { id: 'P03', name: 'Arabica Coffee Beans 250g', price: 280, stock: 50 }
];

function renderTable() {
    let tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';

    products.forEach((p, index) => {
        let bgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        let stockClass = p.stock < 10 ? 'text-red-600 font-bold' : 'text-green-600 font-semibold';

        let row = `<tr class="${bgClass} hover:bg-emerald-50 transition-colors duration-150">
            <td class="px-6 py-4 font-mono font-semibold">${p.id}</td>
            <td class="px-6 py-4">${p.name}</td>
            <td class="px-6 py-4">${p.price.toLocaleString()}</td>
            <td class="px-6 py-4 ${stockClass}">${p.stock}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function buyProduct() {
    let idInput = document.getElementById('productId').value.trim().toUpperCase();
    let qtyInput = parseInt(document.getElementById('buyQty').value);

    if (!idInput || isNaN(qtyInput) || qtyInput <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ข้อมูลไม่ครบถ้วน',
            text: 'กรุณากรอกรหัสสินค้าและจำนวนที่ต้องการซื้อให้ถูกต้อง',
            confirmButtonColor: '#10b981'
        });
        return;
    }

    let productIndex = products.findIndex(p => p.id === idInput);

    if (productIndex === -1) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบสินค้า',
            text: 'ไม่มีรหัสสินค้านี้ในระบบ กรุณาตรวจสอบอีกครั้ง',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    let product = products[productIndex];

    if (qtyInput > product.stock) {
        Swal.fire({
            icon: 'warning',
            title: 'สต็อกไม่เพียงพอ!',
            text: `สินค้าคงเหลือเพียง ${product.stock} ชิ้นเท่านั้น`,
            confirmButtonColor: '#f59e0b'
        });
    } else {
        product.stock -= qtyInput;
        let totalPrice = product.price * qtyInput;

        // แจ้งเตือนสำเร็จพร้อมสรุปยอด
        Swal.fire({
            icon: 'success',
            title: 'สั่งซื้อสำเร็จ!',
            html: `
                <div class="text-left mt-2">
                    <p><b>สินค้า:</b> ${product.name}</p>
                    <p><b>จำนวน:</b> ${qtyInput} ชิ้น</p>
                    <hr class="my-2">
                    <p class="text-lg text-emerald-600"><b>ราคารวม: ${totalPrice.toLocaleString()} บาท</b></p>
                </div>
            `,
            confirmButtonColor: '#10b981'
        });

        renderTable();

        document.getElementById('productId').value = '';
        document.getElementById('buyQty').value = '';
    }
}

renderTable();

// ==========================================
// ข้อ 3: ระบบแปลงสกุลเงิน (API Fetch)
// ==========================================
async function calculateImport() {
    let usdInput = document.getElementById('usdInput');
    let usdAmount = parseFloat(usdInput.value);
    let resultDiv = document.getElementById('importResult');

    if (isNaN(usdAmount) || usdAmount <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกต้นทุน (USD) เป็นตัวเลขที่มากกว่า 0',
            confirmButtonColor: '#8b5cf6'
        });
        usdInput.value = '';
        resultDiv.classList.add('hidden');
        return;
    }

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<div class="animate-pulse flex space-x-4"><div class="flex-1 space-y-4 py-1"><div class="h-4 bg-purple-200 rounded w-3/4"></div><div class="h-4 bg-purple-200 rounded"></div></div></div>`;

    try {
        let response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        let data = await response.json();
        let exchangeRate = data.rates.THB;

        let baseCostTHB = usdAmount * exchangeRate;
        let importFee = baseCostTHB * 0.03;
        let netCostTHB = baseCostTHB + importFee;

        resultDiv.innerHTML = `
            <div class="space-y-2">
                <h3 class="font-bold text-lg mb-2">💱 สรุปต้นทุนนำเข้า (Real-time)</h3>
                <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Rate ปัจจุบัน: 1 USD = ${exchangeRate.toFixed(2)} THB</span>
                </div>
                <div class="flex justify-between border-b border-purple-200 pb-2">
                    <span>ต้นทุนสินค้า (THB):</span>
                    <span class="font-medium">${baseCostTHB.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                </div>
                <div class="flex justify-between border-b border-purple-200 pb-2 text-orange-600">
                    <span>ค่าธรรมเนียม (3%):</span>
                    <span class="font-medium">+${importFee.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                </div>
                <div class="flex justify-between pt-2 text-purple-800 text-xl font-bold">
                    <span>ต้นทุนสุทธิรวม:</span>
                    <span>${netCostTHB.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        resultDiv.innerHTML = `<span class="text-red-600 font-bold">❌ ไม่สามารถดึงข้อมูลอัตราแลกเปลี่ยนได้ กรุณาลองใหม่อีกครั้ง</span>`;
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
            text: 'ไม่สามารถดึงข้อมูลอัตราแลกเปลี่ยนจาก API ได้ในขณะนี้',
            confirmButtonColor: '#ef4444'
        });
    }
}