var LENGTHS = [':15', ':30', ':45', ':60'];
var DAYS    = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

var rows = [
    { name: 'Mornings (7a-10a)',     len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 },
    { name: 'Middays (10a-3p)',      len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 },
    { name: 'Afternoons (3p-6:30p)', len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 },
    { name: 'Sa-Su 9a-3p',          len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 },
    { name: 'M-Su 6a-12M',    len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 }
];

function lenOptions(cur) {
    return LENGTHS.map(function(l) {
        return '<option value="' + l + '"' + (cur === l ? ' selected' : '') + '>' + l + '</option>';
    }).join('');
}

function renderGrid() {
    var body = document.getElementById('gridBody');
    if (!body) return;
    body.innerHTML = '';
    rows.forEach(function(row, i) {
        var tr = document.createElement('tr');
        var dayCells = DAYS.map(function(d) {
            return '<td class="num-cell"><input type="number" min="0" max="99" value="' + (row[d] || 0) + '"></td>';
        }).join('');
        tr.innerHTML =
            '<td class="dp-name"><input type="text" value="' + row.name + '" placeholder="Daypart name"></td>' +
            '<td class="num-cell ads-week">0</td>' +
            '<td class="sel-cell"><select>' + lenOptions(row.len) + '</select></td>' +
            dayCells +
            '<td class="rate-cell"><input type="text" placeholder="0.00"></td>' +
            '<td class="cost-cell" style="color:#cc0000;font-weight:600;text-align:center;"></td>' +
            '<td class="del-cell"><button class="del-row-btn" onclick="deleteRow(' + i + ')">✕</button></td>';
        body.appendChild(tr);
    });
    getAllTotals();
}

function getSelectedWeeks() {
    var weekStart = document.getElementById('weekStart');
    var weekEnd   = document.getElementById('weekEnd');
    if (!weekStart || !weekEnd || !weekStart.value || !weekEnd.value) return 1;
    var sp = weekStart.value.split('-W').map(Number);
    var ep = weekEnd.value.split('-W').map(Number);
    if (sp[0] === ep[0]) return Math.max(1, (ep[1] - sp[1]) + 1);
    return 1;
}

function calculateRow(tr) {
    var cells = tr.children;
    var adsPerWeek = 0;
    for (var i = 3; i <= 9; i++) {
        var inp = cells[i].querySelector('input');
        adsPerWeek += parseInt(inp ? inp.value : 0) || 0;
    }
    var rateInput = cells[10].querySelector('input');
    var rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
    var weeklyCost = adsPerWeek * rate;
    var campaignCost = weeklyCost * getSelectedWeeks();
    cells[1].textContent  = adsPerWeek;
    cells[11].textContent = campaignCost > 0 ? '$' + campaignCost.toFixed(2) : '';
    return [adsPerWeek, weeklyCost, campaignCost];
}

function getMonthlySpendBreakdown(weeklyCost) {
    var weekStart = document.getElementById('weekStart');
    var weekEnd   = document.getElementById('weekEnd');

    if (!weekStart || !weekEnd || !weekStart.value || !weekEnd.value) {
        return {};
    }

    var startDate = getMondayOfWeek(weekStart.value);
    var endDate   = getMondayOfWeek(weekEnd.value);

    var monthlyTotals = {};
    var current = new Date(startDate);

    while (current <= endDate) {
        var monthName = current.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });

        if (!monthlyTotals[monthName]) {
            monthlyTotals[monthName] = 0;
        }

        monthlyTotals[monthName] += weeklyCost;

        current.setDate(current.getDate() + 7);
    }

    return monthlyTotals;
}

function updateMonthlySpend(weeklyCost) {
    var monthlySpendEl = document.getElementById('monthlySpend');
    if (!monthlySpendEl) return;

    var monthlyTotals = getMonthlySpendBreakdown(weeklyCost);
    var output = [];

    for (var month in monthlyTotals) {
        output.push(month + ': $' + monthlyTotals[month].toFixed(2));
    }

    monthlySpendEl.innerText = output.length ? output.join(' | ') : '—';
}

function getAllTotals() {
    var body = document.getElementById('gridBody');
    if (!body) return;
    var totalAds = 0, totalWeekly = 0, totalCampaign = 0;
    body.querySelectorAll('tr').forEach(function(tr) {
        var r = calculateRow(tr);
        totalAds      += r[0];
        totalWeekly   += r[1];
        totalCampaign += r[2];
    });
    var el;
    el = document.getElementById('totalAds');      if (el) el.innerText = totalAds;
    el = document.getElementById('totalCost');     if (el) el.innerText = '$' + totalCampaign.toFixed(2);
    el = document.getElementById('mainTotalAds');  if (el) el.innerText = totalAds;
    el = document.getElementById('mainTotalCost'); if (el) el.innerText = '$' + totalWeekly.toFixed(2);
    el = document.getElementById('campaignCost');  if (el) el.innerText = '$' + totalCampaign.toFixed(2);
    
    updateMonthlySpend(totalWeekly);
}

document.addEventListener('input', function(e) {
    var body = document.getElementById('gridBody');
    if (body && body.contains(e.target)) getAllTotals();
});

function addRow() {
    rows.push({ name: 'New daypart', len: ':60', Mo:0, Tu:0, We:0, Th:0, Fr:0, Sa:0, Su:0 });
    renderGrid();
}

function deleteRow(i) { 
    rows.splice(i, 1); 
    renderGrid(); 
}

function openScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'block';
    renderGrid();
    var si = document.getElementById('stationInput');
    var mn = document.getElementById('mainStationName');
    if (si && mn) mn.innerText = si.value.trim() || '— Select station —';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    var scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal) {
        scheduleModal.addEventListener('click', function(e) { 
            if (e.target === this) closeScheduleModal(); 
        });
    }
});

function getMondayOfWeek(value) {
    var parts = value.split('-W').map(Number);
    var year = parts[0], week = parts[1];
    var jan4 = new Date(year, 0, 4);
    var dow  = jan4.getDay() || 7;
    var mon  = new Date(jan4);
    mon.setDate(jan4.getDate() - (dow - 1) + (week - 1) * 7);
    return mon;
}

function fmtDate(d) {
    return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate();
}

function syncWeekRange() {
    var s  = document.getElementById('startWeekBtn').innerText.trim();
    var e  = document.getElementById('endWeekBtn').innerText.trim();
    var el = document.getElementById('mainWeekRange');
    if (!el) return;
    var hasS = s !== 'Start Week', hasE = e !== 'End Week';
    el.innerText = (hasS || hasE) ? s + '  →  ' + e : '— Select dates —';
}

document.addEventListener('DOMContentLoaded', function() {
    var startBtn  = document.getElementById('startWeekBtn');
    var endBtn    = document.getElementById('endWeekBtn');
    var weekStart = document.getElementById('weekStart');
    var weekEnd   = document.getElementById('weekEnd');

    if (!startBtn || !endBtn || !weekStart || !weekEnd) return;

    startBtn.addEventListener('click', function() { if (weekStart.showPicker) weekStart.showPicker(); else weekStart.click(); });
    endBtn.addEventListener('click', function() { if (weekEnd.showPicker) weekEnd.showPicker(); else weekEnd.click(); });

    weekStart.addEventListener('change', function() {
        if (!this.value) return;
        startBtn.textContent = fmtDate(getMondayOfWeek(this.value)) + ' - Week 2026';
        getAllTotals();
        syncWeekRange();
    });
    weekEnd.addEventListener('change', function() {
        if (!this.value) return;
        endBtn.textContent = fmtDate(getMondayOfWeek(this.value)) + ' - Week 2026';
        getAllTotals();
        syncWeekRange();
    });
});

document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'stationInput') {
        var mn = document.getElementById('mainStationName');
        if (mn) mn.innerText = e.target.value.trim() || '— Select station —';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var catSelect = document.getElementById('categorySelect');
    if (catSelect) {
        catSelect.addEventListener('change', function() {
            var el = document.getElementById('mainCategoryName');
            if (el) el.innerText = this.value || '— Select category —';
        });
    }
});