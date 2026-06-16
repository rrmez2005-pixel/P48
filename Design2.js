function toggleSidebar() {
    document.getElementById('sidebar').style.width = '200px';
    document.getElementById('overlay').style.display = 'block';
}

function closeSidebar() {
    document.getElementById('sidebar').style.width = '0';
    document.getElementById('overlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    var social = document.querySelector('.social');
    var icon   = document.querySelector('.btn-icon');
    if (social && icon) {
        social.addEventListener('mouseenter', function() { icon.textContent = '↺'; });
        social.addEventListener('mouseleave', function() { icon.textContent = '∨'; });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var confirmBtn = document.getElementById('confirmButton');
    var modal      = document.getElementById('confirmModal');
    var splitLeft  = document.getElementById('splitLeft');
    var downloadBtn = document.getElementById('downloadReceiptBtn');

    if (!confirmBtn || !modal) return;

    function resetConfirmState() {
        if (splitLeft) {
            splitLeft.classList.remove('confirmed-state');
            var labels = splitLeft.querySelectorAll('.split-label');
            if (labels.length >= 2) { 
                labels[0].textContent = 'Confirm'; 
                labels[1].textContent = 'Scheduling'; 
            }
        }
        confirmBtn.style.pointerEvents = 'auto'; 
    }

    confirmBtn.addEventListener('click', function() {
        if (typeof getAllTotals === 'function') getAllTotals();

        var station  = document.getElementById('mainStationName')?.innerText  || 'Not selected';
        var category = document.getElementById('mainCategoryName')?.innerText || 'Not selected';
        var ads      = document.getElementById('mainTotalAds')?.innerText     || '0';
        var cost     = document.getElementById('campaignCost')?.innerText     || '$0.00';
        var start    = document.getElementById('startWeekBtn')?.innerText     || 'Start Week';
        var end      = document.getElementById('endWeekBtn')?.innerText       || 'End Week';

        document.getElementById('confirmStation').innerText  = station;
        document.getElementById('confirmCategory').innerText = category;
        document.getElementById('confirmAds').innerText      = ads;
        document.getElementById('confirmCost').innerText     = cost;
        document.getElementById('confirmWeek').innerText     = start + ' > ' + end;

        modal.style.display = 'flex';

        if (splitLeft) {
            splitLeft.classList.add('confirmed-state');
            var labels = splitLeft.querySelectorAll('.split-label');
            if (labels.length >= 2) { 
                labels[0].textContent = '✔'; 
                labels[1].textContent = 'Confirmed'; 
            }
            confirmBtn.style.pointerEvents = 'none'; 
        }
    });

    window.closeConfirmModal = function() { 
        modal.style.display = 'none'; 
        resetConfirmState();
    };

    modal.addEventListener('click', function(e) { 
        if (e.target === modal) {
            modal.style.display = 'none'; 
            resetConfirmState();
        }
    });

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            var station  = document.getElementById('confirmStation').innerText;
            var category = document.getElementById('confirmCategory').innerText;
            var ads      = document.getElementById('confirmAds').innerText;
            var cost     = document.getElementById('confirmCost').innerText;
            var week     = document.getElementById('confirmWeek').innerText;

            var receiptText = 
                "=== CAMPAIGN RECEIPT ===\n" +
                "Station:     " + station + "\n" +
                "Category:    " + category + "\n" +
                "Total Ads:   " + ads + "\n" +
                "Total Cost:  " + cost + "\n" +
                "Duration:    " + week + "\n" +
                "========================\n" +
                "Generated on: " + new Date().toLocaleString();

            var blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
            var downloadLink = document.createElement('a');
            
            downloadLink.download = 'campaign-receipt.txt';
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadLink.href);

            modal.style.display = 'none';
            resetConfirmState();
        });
    }
});