function Modal(name) {
    this.name = name;
    this.children = createElement('div');
    this.setChildren = function (nodes) {
        this.children = nodes;
    };
    this.getChildren = function () {
        return this.children;
    };
    this.close = function () {
        let modal = document.getElementsByClassName('modal-' + this.name).item(0);
        let backdrop = document.getElementsByClassName('backdrop-' + this.name).item(0);
        modal.classList.remove('animate-open');
        modal.classList.add('animate-close');
        setTimeout(function () {
            backdrop.remove();
            modal.remove();
        }, 300);
    };
    this.open = function () {
        let that = this;
        let backdrop = createElement(
            'div',
            {
                class: 'backdrop backdrop-' + this.name,
                click: function () {
                    that.close();
                }
            }
        );

        let modal = createElement(
            'div',
            {
                class: 'modal modal-' + this.name + ' ' + 'animate-open',
                'data-name': this.name
            },
            createElement(
                'div',
                {
                    class: 'close-btn',
                    click: function () {
                        that.close();
                    }
                },
                'x'
            ),
            this.getChildren()
        );

        document.getElementsByTagName('body').item(0).appendChild(backdrop);
        document.getElementsByTagName('body').item(0).appendChild(modal);
    }
}