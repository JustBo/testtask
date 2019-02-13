(function () {
    let rootElement = document.getElementById('root');

    renderApp();

    function createElement(el, props) {
        let children = Array.prototype.slice.call(arguments, 2);
        let element = document.createElement(el);
        for (let name in props) {
            if (typeof props[name] === "function") {
                element.addEventListener(name, props[name]);
            } else {
                element.setAttribute(name, props[name]);
            }
        }
        for (let key in children) {
            let child = children[key];
            if (Array.isArray(child)) {
                for (let node in child) {
                    element.appendChild(child[node]);
                }
            } else if (typeof(child) === 'object') {
                element.appendChild(child);
            } else {
                element.innerHTML += child;
            }
        }
        return element;
    }

    function renderApp() {
        rootElement.innerHTML = '';
        let app = new App();
        return rootElement.appendChild(app.render());
    }

    function App() {
        this.getContacts = function () {
            let contactsStorage = localStorage.getItem('contacts');
            return contactsStorage ? JSON.parse(contactsStorage) : [];
        };
        this.render = function () {
            this.contacts = this.getContacts();

            let contactList = new ContactList(this.contacts);
            let contactAdd = new ContactAdd();
            let contactRemove = new ContactRemove(this.contacts);
            return createElement(
                'div',
                null,
                contactList.render(),
                contactAdd.render(),
                contactRemove.render()
            );
        };
    }

    function ContactRemove(contacts) {
        this.contacts = contacts;
        this.handleClick = function () {
            let checked = [];
            let checkboxes = document.querySelectorAll('.check-contact');
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes.item(i).checked) {
                    checked.push(i);
                }
            }
            let filteredContacts = [];
            let contacts = this.contacts;
            for (let key in contacts) {
                if (checked.indexOf(Number(key)) === -1) {
                    filteredContacts.push(contacts[key]);
                }
            }
            localStorage.setItem('contacts', JSON.stringify(filteredContacts));
            renderApp();
        };

        this.render = function () {
            let that = this;
            return createElement(
                'button',
                {
                    click: function () {
                        that.handleClick();
                    }
                },
                'Delete'
            );
        };
    }

    function ContactAdd() {

        this.handleClick = function () {
            let modal = new Modal('testModal');
            let form = new ContactForm(modal);

            modal.setChildren(form);
            modal.open();
        };

        this.render = function () {
            return createElement(
                'div',
                null,
                createElement(
                    'button',
                    {
                        click: this.handleClick
                    },
                    'Add'
                )
            );
        };
    }

    function Modal(name) {
        this.name = name;
        this.children = document.createElement('div');
        this.setChildren = function (nodes) {
            this.children = nodes;
        };
        this.getChildren = function () {
            return this.children;
        };
        this.close = function () {
            let modal = document.getElementsByClassName(this.name).item(0);
            modal.classList.remove('animate-open');
            modal.classList.add('animate-close');
            setTimeout(function () {
                document.getElementsByClassName('backdrop').item(0).remove();
                modal.remove();
            }, 300);
        };
        this.open = function () {
            let that = this;
            let backdrop = createElement(
                'div',
                {
                    class: 'backdrop',
                    click: function () {
                        that.close();
                    }
                }
            );

            let modal = createElement(
                'div',
                {
                    class: 'modal ' + this.name + ' ' + 'animate-open',
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

    function ContactForm(modal, id = null) {
        this.id = id;
        this.contact = id === null ? null : JSON.parse(localStorage.getItem('contacts'))[id];
        this.inputs = {
            firstName: {
                displayName: 'First Name',
                type: 'text',
                validate: {
                    required: true,
                    minLength: 3
                },
                value: this.contact === null ? '' : this.contact.firstName
            },
            lastName: {
                displayName: 'Last Name',
                type: 'text',
                validate: {
                    required: true,
                    minLength: 3
                },
                value: this.contact === null ? '' : this.contact.lastName
            },
            email: {
                displayName: 'E-mail',
                type: 'email',
                validate: {
                    required: true,
                    regex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
                },
                value: this.contact === null ? '' : this.contact.email
            },
        };
        this.modal = modal;
        this.getForm = function () {
            return document.getElementById('contact-form');
        };
        this.setErrors = function (errors) {
            // reset errors
            let errorContainers = document.querySelectorAll('.input-error');
            for (let i = 0; i < errorContainers.length; i++) {
                errorContainers[i].innerText = '';
            }
            //set errors
            if (errors.length > 0) {
                for (let i = 0; i < errors.length; i++) {
                    let errorContainer = document.querySelector('.input-error.' + errors[i].name);
                    errorContainer.innerText = errors[i].msg;
                }
            }
        };
        this.validate = function () {
            let data = new FormData(this.getForm());
            let inputs = this.inputs;
            let errors = [];
            for (let name in inputs) {
                let options = inputs[name];
                let value = data.get(name);
                if (options.validate) {
                    if (options.validate.required && value === '') {
                        errors.push({
                            'name': name,
                            'msg': options.displayName + ' is Required'
                        });
                        continue;
                    }
                    if (options.validate.minLength && value.length < options.validate.minLength) {
                        errors.push({
                            'name': name,
                            'msg': 'Enter ' + options.validate.minLength + ' or more characters'
                        });
                        continue;
                    }
                    if (options.validate.regex && !options.validate.regex.test(value)) {
                        errors.push({
                            'name': name,
                            'msg': 'Invalid ' + options.displayName
                        });
                        continue;
                    }
                }
            }
            return errors;
        };
        this.handleSubmit = function (e) {
            e.preventDefault();
            let data = new FormData(this.getForm());
            let inputs = this.inputs;
            //validate
            let errors = this.validate();
            this.setErrors(errors);
            if (errors.length > 0) {
                return;
            }
            // create new row
            let contacts = localStorage.getItem('contacts');
            let rows = contacts ? JSON.parse(contacts) : [];
            let contact = {
                'date': new Date()
            };
            for (let name in inputs) {
                contact[name] = data.get(name);
            }
            if (this.id === null) {
                rows.push(contact);
            } else {
                rows[this.id] = contact;
            }
            localStorage.setItem('contacts', JSON.stringify(rows));
            this.modal.close();
            renderApp();
        };
        this.render = function () {
            const inputs = this.inputs;
            let that = this;
            let fields = [];
            for (let name in inputs) {
                fields.push(
                    createElement(
                        'div',
                        null,
                        createElement(
                            'label',
                            null,
                            inputs[name].displayName
                        ),
                        createElement(
                            'input',
                            {
                                type: inputs[name].type,
                                name: name,
                                value: inputs[name].value
                            }
                        ),
                        createElement(
                            'div',
                            {
                                class: 'input-error ' + name
                            }
                        )
                    )
                );
            }
            return createElement(
                'form',
                {
                    id: 'contact-form',
                    submit: function (e) {
                        that.handleSubmit(e);
                    }
                },
                fields,
                createElement(
                    'button',
                    null,
                    'Save'
                )
            );
        };
        return this.render();
    }

    function ContactList(contacts) {
        this.contacts = contacts;
        this.fields = {
            firstName: "First Name",
            lastName: 'Last Name',
            email: 'E-mail',
        };
        this.handleClick = function (id) {
            let modal = new Modal('testModal');
            let form = new ContactForm(modal, id);

            modal.setChildren(form);
            modal.open();
        };

        this.render = function (rows = null) {
            const fields = this.fields;
            let that = this;
            let titles = [
                createElement(
                    'th',
                    null,
                    createElement(
                        'input',
                        {
                            type: 'checkbox',
                            id: 'select-checkbox',
                            click: function (e) {
                                let checkboxes = document.querySelectorAll('.check-contact');
                                for (let key in checkboxes) {
                                    checkboxes.item(key).checked = e.target.checked;
                                }
                                that.checked = e.target.checked ? Object.keys(that.contacts) : [];
                            }
                        }
                    )
                )
            ];
            for (let name in fields) {
                titles.push(createElement(
                    'th',
                    null,
                    fields[name]
                ));
            }
            // generate rows
            let contacts = rows === null ? this.contacts : rows;
            let contactRows = [
                createElement(
                    'tr',
                    null,
                    titles
                ),
            ];
            for (let id in contacts) {
                let cells = [
                    createElement(
                        'input',
                        {
                            type: 'checkbox',
                            class: 'check-contact',
                            click: function () {
                                let selectAll = document.getElementById('select-checkbox');
                                selectAll.checked = false;
                            }
                        }
                    )
                ];

                for (let name in fields) {
                    cells.push(
                        createElement(
                            'td',
                            null,
                            contacts[id][name]
                        )
                    );
                }

                contactRows.push(
                    createElement(
                        'tr',
                        {
                            click: function () {
                                that.handleClick(id);
                            }
                        },
                        cells
                    )
                );
            }
            return createElement(
                'table',
                null,
                contactRows
            );
        };
    }
})();