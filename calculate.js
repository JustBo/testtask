(function () {
    const par = {
        1: 'долар',
        0.5: 'цент',
        0.25: 'цент',
        0.1: 'цент',
        0.05: 'цент',
        0.01: 'цент'
    };

    function calculateChange(sum, price) {
        let change = (sum - price).toFixed(2);
        let result = Object.keys(par).reduce((result, item) => {
            let change = result.change;
            let amount = Math.floor(change / item);
            return amount === 0 ? result : {
                change: (change - amount * item).toFixed(2),
                money: [
                    ...result.money,
                    {
                        nominal: item,
                        amount: amount
                    }
                ]
            }
        }, {
            change: change,
            money: []
        });

        return {
            change: change,
            money: result.money
        }
    }

    function formatName(amount, name) {
        let lastNumber = Number(amount.toString().slice(-1));
        let lastTwoNumber = Number(amount.toString().slice(-2));

        if (lastTwoNumber > 10 && lastTwoNumber < 15) {
            name += 'ів';
        } else if (lastNumber > 1 && lastNumber < 5) {
            name += 'и';
        } else if (lastNumber !== 1) {
            name += 'ів';
        }
        return `${amount} ${name}`;
    }

    function resultOutput(result) {
        let nominalOutput = result.money.map(item => {
            let multiply = item.nominal >= 1 ? 1 : 100;
            let amount = item.amount * item.nominal * multiply;
            return formatName(amount, par[item.nominal]);
        }).join(', ');

        nominalOutput = result.money.length === 0 ? `` : `(По номіналу ${nominalOutput})`;

        let dollarAmount = Math.floor(result.change);
        let centAmount = (result.change - dollarAmount).toFixed(2) * 100;
        let dollarOutput = dollarAmount > 0 ? formatName(dollarAmount, ' долар') : '';
        let centOutput = centAmount > 0 ? formatName(centAmount, ' цент') : '';

        let changeOutput = `${dollarOutput} ${centOutput}`;

        return `Ваша решта: ${changeOutput} ${nominalOutput}`;
    }

    let form = document.getElementById('form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let data = new FormData(form);
        let modal = new Modal('resultModal');
        let summ = data.get('sum');
        let price = data.get('price');
        let output = '';

        if (summ < price) {
            output = 'Недостатньо коштів';
        } else if (summ === price) {
            output = 'Без решти';
        } else {
            let result = calculateChange(summ, price);
            output = resultOutput(result);
        }

        modal.setChildren(
            createElement('div', {class: 'calculate-result'}, output)
        );
        modal.open();
    });
})();