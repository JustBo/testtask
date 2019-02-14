(function () {

    let openBtn = document.getElementById('open-modal');
    let count = 0;


    openBtn.addEventListener('click', openModal);

    function openModal() {
        count++;
        let modal = new Modal('openModal' + count);
        modal.setChildren(createElement(
            'button',
            {
                click: openModal
            },
            'Create another modal'
        ));
        modal.open();
    }
})();