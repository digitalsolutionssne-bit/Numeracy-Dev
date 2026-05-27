// ==========================================
// purchasing2.js - Purchasing Flow Logic
// ==========================================

const denominations =[
    { val: 50, img: '../../assets/note-50.png', label: '$50', type: 'note' },
    { val: 10, img: '../../assets/note-10.png', label: '$10', type: 'note' },
    { val: 5,  img: '../../assets/note-5.png',  label: '$5',  type: 'note' },
    { val: 2,  img: '../../assets/note-2.png',  label: '$2',  type: 'note' },
    { val: 1,  img: '../../assets/coin-1.png',  label: '$1',  type: 'coin' },
    { val: 0.5,img: '../../assets/coin-50c.png',label: '50¢', type: 'coin' },
    { val: 0.2,img: '../../assets/coin-20c.png',label: '20¢', type: 'coin' },
    { val: 0.1,img: '../../assets/coin-10c.png',label: '10¢', type: 'coin' },
    { val: 0.05,img: '../../assets/coin-5c.png',label: '5¢',  type: 'coin' }
];

let walletCounts = { 50:0, 10:0, 5:0, 2:0, 1:0, 0.5:0, 0.2:0, 0.1:0, 0.05:0 };
let changeCounts = { 50:0, 10:0, 5:0, 2:0, 1:0, 0.5:0, 0.2:0, 0.1:0, 0.05:0 };
let totalWallet = 0;
let expectedChange = 0; 
let currentStep = 1;

const walletSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-icon" viewBox="0 0 24 24" fill="#E6A869" stroke="#5C3A21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" fill="#C88A4A"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" fill="#E6A869"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" fill="#F4D03F" stroke="#E67E22"/></svg>`;
const cashierSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-icon" viewBox="0 0 24 24" fill="#81D4FA" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18H2v-4h20v4Z" fill="#42A5F5"/><path d="M18 14V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8" fill="#BBDEFB"/><path d="M12 10h.01" stroke="#1565C0" stroke-width="3"/><path d="M8 10h.01" stroke="#1565C0" stroke-width="3"/><path d="M16 10h.01" stroke="#1565C0" stroke-width="3"/><rect x="10" y="2" width="4" height="4" fill="#FFF176" stroke="#F57F17"/></svg>`;

const minusSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><line x1="4" y1="12" x2="20" y2="12"/></svg>`;
const plusSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>`;

function renderGrid(containerId, countsObj, totalElemId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    denominations.forEach(d => {
        const item = document.createElement('div');
        item.className = 'wallet-item';
        const graphic = `<img src="${d.img}" alt="${d.label}" class="currency-img ${d.type}">`;
        item.innerHTML = `
            ${graphic}
            <div class="wallet-controls">
                <button class="control-btn minus" onclick="updateCount(${d.val}, -1, '${containerId}', '${totalElemId}')">${minusSvg}</button>
                <span class="control-count" id="count-${containerId}-${d.val}">${countsObj[d.val]}</span>
                <button class="control-btn plus" onclick="updateCount(${d.val}, 1, '${containerId}', '${totalElemId}')">${plusSvg}</button>
            </div>
        `;
        container.appendChild(item);
    });
}

window.updateCount = function(val, delta, containerId, totalElemId) {
    let countsObj = containerId === 'wallet-grid-container' ? walletCounts : changeCounts;
    if (countsObj[val] + delta >= 0) {
        countsObj[val] += delta;
        document.getElementById(`count-${containerId}-${val}`).innerText = countsObj[val];
        recalcTotal(countsObj, totalElemId);
    }
}

function recalcTotal(countsObj, totalElemId) {
    let totalCents = 0;
    for (const[val, count] of Object.entries(countsObj)) {
        totalCents += Math.round(parseFloat(val) * 100) * count;
    }
    const totalDollars = (totalCents / 100).toFixed(2);
    document.getElementById(totalElemId).innerText = totalDollars;
    
    if (totalElemId === 'wallet-total') {
        totalWallet = totalDollars;
    }

    if (totalElemId === 'change-total') {
        const cashierBox = document.getElementById('cashier-gave-box');
        if (cashierBox) {
            if (totalCents !== expectedChange) {
                cashierBox.style.backgroundColor = 'rgba(244, 67, 54, 0.15)'; 
                cashierBox.style.color = 'var(--error-color)';
            } else {
                cashierBox.style.backgroundColor = 'rgba(76, 175, 80, 0.15)';
                cashierBox.style.color = 'var(--success-color)';
            }
        }
    }
}

renderGrid('wallet-grid-container', walletCounts, 'wallet-total');
renderGrid('change-grid-container', changeCounts, 'change-total');

window.goBack = function() {
    window.speechSynthesis.cancel();
    if (currentStep === 3) window.goToStep2();
    else if (currentStep === 2) window.goToStep1();
    else window.location.href = '../../index.html';
}

function switchStep(stepNum, titleHtml) {
    currentStep = stepNum;
    document.querySelectorAll('.flow-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${stepNum}`).classList.add('active');
    document.getElementById('header-title').innerHTML = titleHtml;
}

window.goToStep1 = function() { 
    switchStep(1, `<div style="display:flex; align-items:center; justify-content:center; gap:8px;">${walletSvg} Wallet</div>`); 
}

window.goToStep2 = function() {
    if (parseFloat(totalWallet) === 0) {
        alert("Your wallet is empty! Please add money first.");
        return;
    }
    document.getElementById('step2-wallet-total').innerText = totalWallet;
    window.calculateTotalCost(); 
    switchStep(2, `🛒 Purchasing`);
}

window.goToStep3 = function() { 
    switchStep(3, `💵 Check Change`);
    recalcTotal(changeCounts, 'change-total');
}

window.addItem = function() {
    const list = document.getElementById('items-list');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.marginBottom = '0';
    row.innerHTML = `
        <div class="currency-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" class="large-input item-cost" placeholder="0.00" step="0.01" min="0" oninput="calculateTotalCost()">
        </div>
        <button class="remove-item-btn" onclick="removeItem(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
    `;
    list.appendChild(row);
    row.querySelector('.item-cost').focus(); 
    
    setTimeout(() => {
        const contentBody = document.querySelector('#step-2 .content-body');
        contentBody.scrollTo({ top: contentBody.scrollHeight, behavior: 'smooth' });
    }, 50);
}

window.removeItem = function(btn) {
    const list = document.getElementById('items-list');
    if (list.children.length > 1) {
        btn.parentElement.remove();
        window.calculateTotalCost(); 
    } else {
        btn.previousElementSibling.querySelector('input').value = '';
        window.calculateTotalCost();
    }
}

window.calculateTotalCost = function() {
    const inputs = document.querySelectorAll('.item-cost');
    let totalCostCents = 0;
    inputs.forEach(input => {
        totalCostCents += Math.round(parseFloat(input.value || 0) * 100);
    });

    const walletCents = Math.round(parseFloat(totalWallet) * 100);
    const costDisplay = document.getElementById('total-cost-display');
    costDisplay.innerText = (totalCostCents / 100).toFixed(2);

    const banner = document.getElementById('status-banner');
    const giveCashierSection = document.getElementById('give-cashier-section');
    const graphicsContainer = document.getElementById('give-cashier-graphics');
    const step2Footer = document.getElementById('step2-footer');
    const changeAmountDisplay = document.getElementById('change-amount-display');
    const expectedChangeDisplay = document.getElementById('step3-expected-change');

    let canBuy = false;
    let bestPaymentArray =[];
    let paymentSumCents = 0;

    if (totalCostCents > 0 && totalCostCents <= walletCents) {
        bestPaymentArray = calculateOptimalPayment(totalCostCents);
        if (bestPaymentArray.length > 0) {
            canBuy = true;
            bestPaymentArray.forEach(val => paymentSumCents += val);
        }
    }

    if (totalCostCents === 0) {
        banner.style.display = 'none';
        giveCashierSection.style.display = 'none';
        step2Footer.style.display = 'none';
        return;
    }

    if (canBuy) {
        banner.style.display = 'flex';
        banner.className = 'status-banner can-buy';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%;">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="4" fill="none"><path d="M20 6L9 17l-5-5"></path></svg>
                <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">CAN BUY</span>
            </div>
        `;
        
        graphicsContainer.innerHTML = '';
        bestPaymentArray.forEach(valCents => {
            const d = denominations.find(denom => Math.round(denom.val * 100) === valCents);
            graphicsContainer.innerHTML += `<img src="${d.img}" alt="${d.label}" class="payment-img ${d.type}">`;
        });

        expectedChange = paymentSumCents - totalCostCents;
        const changeDollars = (expectedChange / 100).toFixed(2);
        changeAmountDisplay.innerText = changeDollars;
        expectedChangeDisplay.innerText = changeDollars;
        
        giveCashierSection.style.display = 'flex';
        step2Footer.style.display = 'flex';
    } else {
        banner.style.display = 'flex';
        banner.className = 'status-banner cannot-buy';
        banner.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                <div style="display: flex; align-items: flex-start; justify-content: center; gap: 12px;">
                    <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="4" fill="none" style="margin-top: -4px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    <span style="font-size: 2.2rem; font-weight: 900; line-height: 1.1;">CANNOT BUY</span>
                </div>
                <div style="background-color: #FFEB3B; color: #000000; font-weight: 900; padding: 4px 12px; margin-top: 8px; border-radius: 6px; font-size: 1.1rem; text-align: center;">Choose Cheaper Items</div>
            </div>
        `;
        
        giveCashierSection.style.display = 'none';
        step2Footer.style.display = 'none';
    }
}

function calculateOptimalPayment(costCents) {
    let inventory =[];
    denominations.forEach(d => {
        let valCents = Math.round(d.val * 100);
        for (let i = 0; i < walletCounts[d.val]; i++) inventory.push(valCents);
    });
    inventory.sort((a,b) => b - a);

    let bestSum = Infinity;
    let bestSubset =[];

    function dfs(index, currentSubset, currentSum) {
        if (currentSum >= costCents) {
            if (currentSum < bestSum || (currentSum === bestSum && currentSubset.length < bestSubset.length)) {
                bestSum = currentSum; bestSubset =[...currentSubset];
            }
            return;
        }
        if (index >= inventory.length) return;
        currentSubset.push(inventory[index]);
        dfs(index + 1, currentSubset, currentSum + inventory[index]);
        currentSubset.pop();
        dfs(index + 1, currentSubset, currentSum);
    }

    if (inventory.length <= 22) {
        dfs(0,[], 0);
    } else {
        let sum = 0;
        for (let v of inventory) {
            bestSubset.push(v);
            sum += v;
            if (sum >= costCents) break;
        }
    }
    return bestSubset;
}

window.checkChange = function() {
    let actualChangeCents = 0;
    for (const[val, count] of Object.entries(changeCounts)) {
        actualChangeCents += Math.round(parseFloat(val) * 100) * count;
    }

    const isCorrect = actualChangeCents === expectedChange;
    document.getElementById('sheet-backdrop').classList.add('show');
    const sheet = document.getElementById('result-sheet');
    
    document.getElementById('sheet-content-correct').style.display = isCorrect ? 'flex' : 'none';
    document.getElementById('sheet-content-wrong').style.display = isCorrect ? 'none' : 'flex';
    
    if (isCorrect) {
        document.getElementById('sheet-home-btn').style.display = 'flex';
        document.getElementById('retry-btn').style.display = 'none';
    } else {
        const diffCents = expectedChange - actualChangeCents;
        let diffStr = "";
        if (diffCents > 0) {
            diffStr = `Still Need: $${(diffCents / 100).toFixed(2)}`;
        } else {
            diffStr = `Overpaid by: $${(Math.abs(diffCents) / 100).toFixed(2)}`;
        }
        document.getElementById('wrong-change-diff').innerText = diffStr;

        document.getElementById('sheet-home-btn').style.display = 'none';
        document.getElementById('retry-btn').style.display = 'block';
    }
    
    sheet.classList.remove('correct', 'wrong');
    sheet.classList.add(isCorrect ? 'correct' : 'wrong');
    sheet.classList.add('show');
}

window.retryChange = function() {
    window.speechSynthesis.cancel();
    document.getElementById('sheet-backdrop').classList.remove('show');
    document.getElementById('result-sheet').classList.remove('show');
    changeCounts = { 50:0, 10:0, 5:0, 2:0, 1:0, 0.5:0, 0.2:0, 0.1:0, 0.05:0 };
    renderGrid('change-grid-container', changeCounts, 'change-total');
    recalcTotal(changeCounts, 'change-total');
}

window.playTTS = function() {
    window.speechSynthesis.cancel();
    const diffText = document.getElementById('wrong-change-diff').innerText;
    const textToRead = `Sorry, wrong change. ${diffText}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    window.speechSynthesis.speak(utterance);
}