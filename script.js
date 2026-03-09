// ==========================================
// ระบบ Navigation (เปลี่ยนหน้า)
// ==========================================
function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('page-active'));
    document.getElementById('page-' + pageId).classList.add('page-active');
    if (typeof AOS !== 'undefined') AOS.refresh();
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
// ข้อ 2: ระบบจัดการสต็อกสินค้า & ตะกร้าสินค้า
// ==========================================

let products = Array.from({ length: 25 }, (_, i) => {
    let idStr = (i + 1).toString().padStart(2, '0');
    return {
        id: `P${idStr}`,
        name: `สินค้าทดสอบ ${idStr}`,
        price: Math.floor(Math.random() * 900) + 100,
        stock: Math.floor(Math.random() * 50) + 1,
        image: `https://picsum.photos/seed/${i + 10}/200/150`
    };
});
products[0] = { id: 'P01', name: 'Premium Matcha Powder', price: 450, stock: 30, image: 'https://picsum.photos/seed/m1/200/150' };
products[1] = { id: 'P02', name: 'Green Box Salad Set', price: 120, stock: 5, image: 'https://picsum.photos/seed/s1/200/150' };

let currentPage = 1;
const itemsPerPage = 20;
let filteredProducts = [...products];

// [ใหม่] ตัวแปรเก็บสินค้าในตะกร้า
let cart = [];

function createCardHTML(p) {
    let stockClass = p.stock < 10 ? 'text-red-500 bg-red-50' : 'text-emerald-600 bg-emerald-50';
    // ปิดปุ่มหากของหมด
    let btnHtml = p.stock > 0
        ? `<button onclick="addToCart('${p.id}', 1)" class="w-full py-2 bg-gray-50 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white transition text-sm border-t">➕ เพิ่มลงตะกร้า</button>`
        : `<button disabled class="w-full py-2 bg-gray-200 text-gray-400 font-bold text-sm border-t cursor-not-allowed">สินค้าหมด</button>`;

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
            ${btnHtml}
        </div>
    `;
}

// 2.1 เรนเดอร์ Carousel พร้อมฟังก์ชันเลื่อน (Scroll)
function renderCarousel() {
    let container = document.getElementById('carouselContainer');
    if (!container) return;
    container.innerHTML = '';

    let highlights = products.slice(0, 6);
    highlights.forEach(p => {
        container.innerHTML += `<div class="min-w-[260px] md:min-w-[280px] snap-center">${createCardHTML(p)}</div>`;
    });
}

function scrollCarousel(direction) {
    const container = document.getElementById('carouselContainer');
    const scrollAmount = 300; // ระยะการเลื่อนแต่ละครั้ง
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// 2.2 เรนเดอร์ Grid & Pagination
function renderProductGrid() {
    let grid = document.getElementById('productGrid');
    let controls = document.getElementById('paginationControls');
    if (!grid || !controls) return;

    grid.innerHTML = '';
    controls.innerHTML = '';

    let totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let paginatedItems = filteredProducts.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">❌ ไม่พบสินค้าที่ค้นหา</div>`;
        return;
    }

    paginatedItems.forEach(p => grid.innerHTML += createCardHTML(p));

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            let activeClass = i === currentPage ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
            controls.innerHTML += `<button onclick="changePage(${i})" class="w-10 h-10 rounded-full font-bold transition ${activeClass}">${i}</button>`;
        }
    }
}

function changePage(page) { currentPage = page; renderProductGrid(); }

function searchProducts() {
    let keyword = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = products.filter(p => p.name.toLowerCase().includes(keyword) || p.id.toLowerCase().includes(keyword));
    currentPage = 1;
    renderProductGrid();
}

// 2.3 ระบบตะกร้าสินค้า (Cart Logic)
function addToCart(id, qtyToAdd) {
    let product = products.find(p => p.id === id);
    if (!product) {
        Swal.fire({ icon: 'error', title: 'ไม่พบสินค้า', text: 'รหัสสินค้านี้ไม่มีในระบบ' });
        return;
    }

    // ตรวจสอบว่าในตะกร้ามีสินค้านี้กี่ชิ้นแล้ว เพื่อบวกเช็คกับสต็อก
    let cartItem = cart.find(item => item.id === id);
    let currentQtyInCart = cartItem ? cartItem.qty : 0;

    if (currentQtyInCart + qtyToAdd > product.stock) {
        Swal.fire({ icon: 'warning', title: 'สต็อกไม่พอ', text: `มีสินค้าเหลือให้สั่งเพิ่มได้อีกแค่ ${product.stock - currentQtyInCart} ชิ้น` });
        return;
    }

    if (cartItem) {
        cartItem.qty += qtyToAdd; // ถ้ามีอยู่แล้วให้บวกจำนวน
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: qtyToAdd }); // ถ้ายังไม่มีให้เพิ่มใหม่
    }

    Swal.fire({
        icon: 'success',
        title: 'เพิ่มลงตะกร้าแล้ว',
        text: `${product.name} (${qtyToAdd} ชิ้น)`,
        timer: 1000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    });

    renderCart();
}

// การเพิ่มลงตะกร้าจากช่องกรอกเอง
function addManualToCart() {
    let idInput = document.getElementById('productId').value.trim().toUpperCase();
    let qtyInput = parseInt(document.getElementById('buyQty').value);

    if (!idInput || isNaN(qtyInput) || qtyInput <= 0) {
        Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกรหัสและจำนวนให้ถูกต้อง' });
        return;
    }

    addToCart(idInput, qtyInput);

    document.getElementById('productId').value = '';
    document.getElementById('buyQty').value = '';
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

function renderCart() {
    let cartBody = document.getElementById('cartBody');
    let cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-500">🛒 ตะกร้าว่างเปล่า ลองเลือกสินค้าด้านล่างดูสิ!</td></tr>`;
        cartTotal.innerText = '0';
        return;
    }

    cartBody.innerHTML = '';
    let totalAmount = 0;

    cart.forEach(item => {
        let subtotal = item.price * item.qty;
        totalAmount += subtotal;
        cartBody.innerHTML += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-50">
                <td class="px-4 py-3 font-medium text-gray-800">${item.name} <span class="text-xs text-gray-400">(${item.id})</span></td>
                <td class="px-4 py-3 text-center text-gray-600">${item.price.toLocaleString()}</td>
                <td class="px-4 py-3 text-center font-bold text-emerald-600">${item.qty}</td>
                <td class="px-4 py-3 text-center font-semibold text-gray-800">${subtotal.toLocaleString()}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition text-sm">ลบ</button>
                </td>
            </tr>
        `;
    });

    cartTotal.innerText = totalAmount.toLocaleString();
}

// 2.4 ฟังก์ชันชำระเงิน (ตัดสต็อกทีเดียว)
function checkout() {
    if (cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'ตะกร้าว่างเปล่า', text: 'กรุณาเพิ่มสินค้าลงตะกร้าก่อนชำระเงิน' });
        return;
    }

    // หักสต็อกออกจากฐานข้อมูล
    cart.forEach(cartItem => {
        let product = products.find(p => p.id === cartItem.id);
        if (product) product.stock -= cartItem.qty;
    });

    let totalAmount = document.getElementById('cartTotal').innerText;

    Swal.fire({
        icon: 'success',
        title: '🎉 ชำระเงินสำเร็จ!',
        html: `ทำรายการสั่งซื้อทั้งหมดเรียบร้อยแล้ว<br><br><span class="text-emerald-600 text-xl font-bold">ยอดรวม: ${totalAmount} บาท</span>`,
        confirmButtonColor: '#10b981'
    });

    // ล้างตะกร้าและอัปเดตหน้าจอ
    cart = [];
    renderCart();
    searchProducts(); // รีเฟรชกริดให้เลขสต็อกอัปเดต
    renderCarousel(); // รีเฟรชคาร์โรเซล
}


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
        let response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        let data = await response.json();
        let exchangeRate = data.rates.THB;

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

// ==========================================
// สั่งให้ทำงานเมื่อหน้าเว็บโหลดเสร็จ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    renderCarousel();
    renderProductGrid();
    renderCart(); // โหลดตะกร้าว่างเปล่ารอไว้
});