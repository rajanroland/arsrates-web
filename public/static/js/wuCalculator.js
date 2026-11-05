// arsrates/static/js/wuCalculator.js (markup: partials/wu_calculator.html)
// Same-dollars comparison: what you pay in total to WU (amount + fee),
// changed as cash at Blue buy instead. The rates are prefilled but editable,
// because the rate WU quotes when you send can differ from our last reading.
(function () {
    var NEUTRAL_PCT = 0.5; // same as VS_BLUE_NEUTRAL_PCT in ratesComponent.js
    var el = function (id) { return document.getElementById(id); };
    var amountEl = el('wuCalcAmount'), feeEl = el('wuCalcFee');
    var wuEl = el('wuCalcWu'), blueEl = el('wuCalcBlue');
    var pesos = function (n) { return Math.round(n).toLocaleString('en-US'); };
    var usd = function (n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var pct = function (n) { return Math.abs(n).toFixed(1) + '%'; };

    function render() {
        var amount = parseFloat(amountEl.value), fee = parseFloat(feeEl.value);
        var wu = parseFloat(wuEl.value), blue = parseFloat(blueEl.value);
        var ok = amount > 0 && fee >= 0 && wu > 0 && blue > 0;
        el('wuCalcResult').hidden = !ok;
        el('wuCalcPrompt').hidden = ok;
        if (!ok) return;

        var total = amount + fee;
        var wuPesos = amount * wu, cashPesos = total * blue;
        var edge = (wuPesos / cashPesos - 1) * 100;
        var diff = pesos(Math.abs(wuPesos - cashPesos));
        var verdict;
        if (Math.abs(edge) < NEUTRAL_PCT) {
            verdict = 'About the same: within ' + NEUTRAL_PCT + '%';
        } else if (edge > 0) {
            verdict = 'Western Union gives about ' + diff + ' more pesos (' + pct(edge) + ')';
        } else {
            verdict = 'Changing cash gives about ' + diff + ' more pesos (' + pct(edge) + ')';
        }
        el('wuCalcVerdict').textContent = verdict;

        var gap = (wu / blue - 1) * 100;
        var feePct = fee / amount * 100;
        var gapText = gap === 0 ? 'the same as Blue'
            : pct(gap) + (gap > 0 ? ' above Blue' : ' below Blue');
        el('wuCalcWhy').textContent = "Western Union's rate is " + gapText + '. This fee is ' + feePct.toFixed(1)
            + '% of what you send, so Western Union needs to be more than ' + feePct.toFixed(1) + '% above Blue to win.';

        el('wuCalcPayWu').textContent = usd(total);
        el('wuCalcPayCash').textContent = usd(total);
        el('wuCalcGetWu').textContent = pesos(wuPesos);
        el('wuCalcGetCash').textContent = pesos(cashPesos);
        el('wuCalcPerWu').textContent = pesos(wuPesos / total);
        el('wuCalcPerCash').textContent = pesos(blue);
    }

    function loadFailed() {
        el('wuCalcStatus').textContent = "We couldn't load today's rates. Enter them from the rates page.";
    }

    el('wuCalc').hidden = false;
    el('wuCalcForm').addEventListener('input', render);
    el('wuCalcForm').addEventListener('submit', function (e) { e.preventDefault(); });
    render();

    fetch('/static/data/current_rates.json', { cache: 'no-cache' })
        .then(function (r) {
            if (!r.ok) throw new Error('rates ' + r.status);
            return r.json();
        })
        .then(function (data) {
            var rates = data.rates || {};
            var wu = rates.WU && rates.WU.rate, blue = rates.BLUE && rates.BLUE.buy;
            // Never overwrite something typed while the rates were loading
            if (wu && !wuEl.value) wuEl.value = wu;
            if (blue && !blueEl.value) blueEl.value = blue;
            if (!wu || !blue) return loadFailed();
            var when = new Date(data.last_updated).toLocaleString('en-US', {
                timeZone: 'America/Argentina/Buenos_Aires',
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });
            el('wuCalcStatus').textContent = 'Rates as of ' + when + ', Argentina time.';
            render();
        })
        .catch(loadFailed);
})();
