// Register Service Worker for PWA (assuming sw.js exists from file tree)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registration successful');
        }, (err) => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Function to calculate and verify wallet vs total cost
function calculateAndUpdateTotal() {
    // 1. Get Wallet Total (strips the '$' and converts to a float)
    const walletElement = document.getElementById('wallet-total');
    if (!walletElement) return; // Prevent errors if running on a page without this element
    
    const walletText = walletElement.innerText;
    const walletTotal = parseFloat(walletText.replace('$', '')) || 0;

    // 2. Sum up all items in the cart dynamically
    const itemInputs = document.querySelectorAll('.item-input');
    let currentTotalCost = 0;
    
    itemInputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            currentTotalCost += val;
        }
    });

    // 3. Update the Left Box Text
    const totalCostDisplay = document.getElementById('total-cost-display');
    if (totalCostDisplay) {
        totalCostDisplay.innerText = '$' + currentTotalCost.toFixed(2);
    }

    // 4. Compare and trigger UI changes
    const totalCostBox = document.getElementById('total-cost-box');
    const warningOverlay = document.getElementById('insufficient-funds-overlay');

    if (totalCostBox && warningOverlay) {
        if (currentTotalCost > walletTotal) {
            // Change left box to Red
            totalCostBox.classList.remove('total-box-green');
            totalCostBox.classList.add('total-box-red');
            
            // Show the bottom-half blocking overlay
            warningOverlay.classList.remove('hidden');
        } else {
            // Keep left box Green
            totalCostBox.classList.remove('total-box-red');
            totalCostBox.classList.add('total-box-green');
            
            // Hide overlay so user can pay
            warningOverlay.classList.add('hidden');
        }
    }
}

// Function to handle adding new items dynamically
function handleAddNewItem() {
    const itemList = document.getElementById('item-list');
    if (!itemList) return;

    const newItemHtml = `
        <div class="item-row">
            <span class="currency-symbol">$</span>
            <input type="number" class="item-input" value="0.00" step="0.01">
            <button class="delete-item-btn">🗑️</button>
        </div>
    `;
    
    itemList.insertAdjacentHTML('beforeend', newItemHtml);
    calculateAndUpdateTotal(); // Recalculate immediately after adding
}

// Global Event Listeners Initialization
function initEventListeners() {
    // Triggers live auto-populate anytime a user types or modifies a number field
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('item-input')) {
            calculateAndUpdateTotal();
        }
    });

    // Handle button clicks for both static and dynamically added elements
    document.addEventListener('click', function(e) {
        // Delete item logic
        if (e.target && e.target.closest('.delete-item-btn')) {
            const row = e.target.closest('.item-row');
            if (row) {
                row.remove();
                calculateAndUpdateTotal(); // Recalculate immediately after deleting
            }
        }
        
        // Add new item logic
        if (e.target && e.target.id === 'add-item-btn') {
            handleAddNewItem();
        }
    });
}

// Initialize application state on page load
window.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    calculateAndUpdateTotal(); // Run once to set initial status
});
