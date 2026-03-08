// ==========================================
// ระบบ Navigation (เปลี่ยนหน้า)
// ==========================================
function navigateTo(pageId) {
    // ซ่อนทุกหน้า
    document.querySelectorAll('.page-section').forEach(el => {
        el.classList.remove('page-active');
    });
    // แสดงหน้าที่เลือก
    document.getElementById('page-' + pageId).classList.add('page-active');

    // รีเฟรช Animation
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// ==========================================
// ข้อ 1: ระบบคำนวณภาษีหัก ณ ที่จ่าย
// ==========================================
function calculateTax() {
    let incomeInput = document.getElementById('incomeInput');
    let income = parseFloat(incomeInput.value);
    let resultDiv = document.getElementById('taxResult');

    if (isNaN(income) || income < 0) {
        Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ถูกต้อง', text: 'กรุณากรอกรายได้เป็นตัวเลข' });
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
        <h3 class="font-bold text-xl mb-3">สรุปผลการคำนวณภาษี</h3>
        <div class="flex justify-between border-b border-blue-200 pb-2 mb-2">
            <span>รายได้รวมทั้งหมด:</span><span class="font-semibold">${income.toLocaleString()} บาท</span>
        </div>
        <div class="flex justify-between border-b border-blue-200 pb-2 mb-2 text-red-600">
            <span>ภาษีที่ต้องชำระ:</span><span class="font-bold">${tax.toLocaleString()} บาท</span>
        </div>
        <div class="flex justify-between pt-2 text-green-700 text-xl font-bold">
            <span>รายได้สุทธิหลังหักภาษี:</span><span>${netIncome.toLocaleString()} บาท</span>
        </div>
    `;
}

// ==========================================
// ข้อ 2: ระบบจัดการสต็อกสินค้า (Cards & Pagination)
// ==========================================

// Mock Data สินค้า 25 ชิ้น (เพื่อทดสอบ Pagination ว่าเกิน 20 ชิ้นจะตัดหน้า)
let products = Array.from({ length: 25 }, (_, i) => {
    let idStr = (i + 1).toString().padStart(2, '0');
    return {
        id: `P${idStr}`,
        name: `สินค้าทดสอบ ${idStr} (Product)`,
        price: Math.floor(Math.random() * 900) + 100,
        stock: Math.floor(Math.random() * 50) + 1,
        image: `https://picsum.photos/seed/${i + 10}/200/150` // ภาพสุ่มจำลอง
    };
});
products[0] = { id: 'P01', name: 'Premium Matcha Powder', price: 450, stock: 30, image: 'https://picsum.photos/seed/m1/200/150' };
products[1] = { id: 'P02', name: 'Green Box Salad Set', price: 120, stock: 5, image: 'https://picsum.photos/seed/s1/200/150' };

let currentPage = 1;
const itemsPerPage = 20;
let filteredProducts = [...products]; // ตัวแปรสำหรับเก็บผลลัพธ์การค้นหา

// ฟังก์ชันสร้างการ์ด HTML
function createCardHTML(p) {
    let stockClass = p.stock < 10 ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50';
    return `
        <div class="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
            <img src="${p.image}" class="w-full h-32 object-cover" alt="${p.name}">
            <div class="p-4 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-bold text-gray-400 uppercase">${p.id}</span>
                    <span class="text-xs font-semibold px-2 py-1 rounded-md ${stockClass}">เหลือ ${p.stock}</span>
                </div>
                <h4 class="font-bold text-gray-800 text-sm mb-2 flex-1">${p.name}</h4>
                <div class="text-lg font-bold text-emerald-600">฿${p.price.toLocaleString()}</div>
            </div>
            <button onclick="document.getElementById('productId').value='${p.id}'; document.getElementById('buyQty').value=1;" 
                class="w-full py-2 bg-gray-50 text-gray-600 font-semibold hover:bg-emerald-500 hover:text-white transition text-sm border-t">
                เลือกซื้อ
            </button>
        </div>
    `;
}

// 2.1 เรนเดอร์ Carousel (สุ่มมาแสดง 6 ชิ้น)
function renderCarousel() {
    let container = document.getElementById('carouselContainer');
    container.innerHTML = '';
    // ดึงสินค้า 6 ชิ้นแรกมาแสดงใน Carousel
    let highlights = products.slice(0, 6);

    highlights.forEach(p => {
        // กำหนดความกว้างการ์ดให้เห็นทีละ ~3 ชิ้นในจอ Desktop
        container.innerHTML += `<div class="min-w-[280px] snap-center">${createCardHTML(p)}</div>`;
    });
}

// 2.2 เรนเดอร์ Grid & Pagination
function renderProductGrid() {
    let grid = document.getElementById('productGrid');
    let controls = document.getElementById('paginationControls');
    grid.innerHTML = '';
    controls.innerHTML = '';

    // คำนวณหน้า
    let totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedItems = filteredProducts.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">❌ ไม่พบสินค้าที่ค้นหา</div>`;
        return;
    }

    paginatedItems.forEach(p => {
        grid.innerHTML += createCardHTML(p);
    });

    // สร้างปุ่มเปลี่ยนหน้า
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            let activeClass = i === currentPage ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            controls.innerHTML += `<button onclick="changePage(${i})" class="w-10 h-10 rounded-full font-bold transition ${activeClass}">${i}</button>`;
        }
    }
}

function changePage(page) {
    currentPage = page;
    renderProductGrid();
}

// 2.3 ฟังก์ชันค้นหา
function searchProducts() {
    let keyword = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = products.filter(p => p.name.toLowerCase().includes(keyword) || p.id.toLowerCase().includes(keyword));
    currentPage = 1;
    renderProductGrid();
}

// 2.4 ฟังก์ชันสั่งซื้อ
function buyProduct() {
    let idInput = document.getElementById('productId').value.trim().toUpperCase();
    let qtyInput = parseInt(document.getElementById('buyQty').value);

    if (!idInput || isNaN(qtyInput) || qtyInput <= 0) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกรหัสและจำนวน' });
        return;
    }

    let product = products.find(p => p.id === idInput);

    if (!product) {
        Swal.fire({ icon: 'error', title: 'ไม่พบสินค้า', text: 'รหัสสินค้านี้ไม่มีในระบบ' });
        return;
    }

    if (qtyInput > product.stock) {
        Swal.fire({ icon: 'error', title: 'สต็อกไม่พอ', text: `มีสินค้าเหลือเพียง ${product.stock} ชิ้น` });
    } else {
        product.stock -= qtyInput;
        Swal.fire({
            icon: 'success',
            title: 'ซื้อสำเร็จ!',
            html: `<div class="text-left mt-2">
                    <p><b>สินค้า:</b> ${product.name}</p>
                    <p><b>จำนวน:</b> ${qtyInput} ชิ้น</p>
                    <hr class="my-2">
                    <p class="text-lg text-emerald-600"><b>รวม: ${(product.price * qtyInput).toLocaleString()} บาท</b></p>
                   </div>`
        });

        // อัปเดต UI
        searchProducts(); // อัปเดต Grid
        renderCarousel(); // อัปเดต Carousel

        document.getElementById('productId').value = '';
        document.getElementById('buyQty').value = '';
    }
}

// โหลดข้อมูลเริ่มต้น
renderCarousel();
renderProductGrid();


// ==========================================
// ข้อ 3: ระบบแปลงสกุลเงิน (Multi-Currency API)
// ==========================================
async function calculateImport() {
    let currency = document.getElementById('currencySelect').value;
    let amount = parseFloat(document.getElementById('foreignAmount').value);
    let resultDiv = document.getElementById('importResult');

    if (isNaN(amount) || amount <= 0) {
        Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ถูกต้อง', text: 'กรุณากรอกราคาสินค้าให้ถูกต้อง' });
        return;
    }

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<div class="animate-pulse flex space-x-4"><div class="flex-1 space-y-4 py-1"><div class="h-4 bg-purple-200 rounded w-3/4"></div><div class="h-4 bg-purple-200 rounded"></div></div></div>`;

    try {
        // ใช้ API โดยกำหนด Base เป็นสกุลเงินที่เลือก
        let response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        let data = await response.json();
        let exchangeRate = data.rates.THB; // เรทเงินบาทไทยเทียบกับสกุลเงินที่เลือก

        let baseCostTHB = amount * exchangeRate;
        let importFee = baseCostTHB * 0.03;
        let netCostTHB = baseCostTHB + importFee;

        resultDiv.innerHTML = `
            <h3 class="font-bold text-xl mb-3">สรุปต้นทุนนำเข้า (Real-time)</h3>
            <div class="flex justify-between border-b border-purple-200 pb-2 mb-2">
                <span>เรทปัจจุบัน (1 ${currency}):</span><span class="font-semibold">${exchangeRate.toFixed(4)} THB</span>
            </div>
            <div class="flex justify-between border-b border-purple-200 pb-2 mb-2">
                <span>ราคาสินค้า (${amount} ${currency}):</span><span>${baseCostTHB.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
            </div>
            <div class="flex justify-between border-b border-purple-200 pb-2 mb-2 text-orange-600">
                <span>ค่าธรรมเนียมนำเข้า (3%):</span><span>+${importFee.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
            </div>
            <div class="flex justify-between pt-2 text-purple-800 text-2xl font-bold">
                <span>ต้นทุนสุทธิรวม:</span><span>${netCostTHB.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</span>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        resultDiv.classList.add('hidden');
        Swal.fire({ icon: 'error', title: 'เชื่อมต่อ API ล้มเหลว', text: 'ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบอินเทอร์เน็ต' });
    }
}