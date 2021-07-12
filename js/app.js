const code = {
    data() {
        return {
            // * toggle menu
            showMenu: false,
            // * count income lines
            incomeLinksNumber: 0,
            // * count & render completed links
            outcomeLinksNumber: 0,
            outcomeLinks: [],
            // * code templates
            templates: [
                '<script src="https://static.production.almightypush.com/mng/subs_window.js?ver=1623419035"></script>\n<link rel="stylesheet" type="text/css" href="https://static.production.almightypush.com/mng/subs_window.css?ver=1623419035">\n\n<script src="https://static.production.almightypush.com/mng/channels/init.min.js?ver=1623419035"></script>\n<script>\nif (window.initSubscriber) {\n    const snippetId = \'PLACE_YOUR_DATA_HERE\';\n    const subscriber = window.initSubscriber(snippetId);\n    subscriber.ready();\n}\n</script>',
                '<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async=""></script>\n<script>\nvar OneSignal = window.OneSignal || [];\nOneSignal.push(function() {\n    OneSignal.init({\n        appId: "PLACE_YOUR_DATA_HERE",\n    });\n});\n</script>',
                '<script type="text/javascript" src="js/backoffer.js"></script>\n<script type="text/javascript">\n(function (w) {\n    w.backOfferUrl = \'PLACE_YOUR_DATA_HERE\'\n}(window));\n</script>'
            ],
            lineToReplace: 'PLACE_YOUR_DATA_HERE',
        }
    },
    methods: {
        // * resize texarea on input
        resizeArea(e) {
            e.target.style.height = "auto";
            e.target.style.height = (e.target.scrollHeight) + "px";
        },
        // * count input links
        countLines(e) {
            const n = e.target.value;
            const n_all = n.split('\n').length;
            let empty_in = empty_out = 0;

            switch (e.target.dataset.type) {
                case 'in':
                    n.split('\n').forEach(el => {
                        el === '' ? empty_in++ : '';
                    });
                    !n ? this.incomeLinksNumber = 0 : this.incomeLinksNumber = n_all - empty_in;
                    break;
                case 'out':
                    n.split('\n').forEach(el => {
                        el === '' ? empty_out++ : '';
                    });
                    !n ? this.outcomeLinksNumber = 0 : this.outcomeLinksNumber = n_all - empty_out;
                    break;
            }
        },
        // * count & generate completed links
        generateCompletedLinks(e) {
            this.outcomeLinks = [];

            e.target.value.split('\n').forEach(el => {
                this.outcomeLinks.push(el);
            });
        },
        // * generate php tag from curly brackets
        generatePHPTag(e) {
            const regexp = /(?<=.)({.+?})/g;
            const params = Array.from(e.target.value.matchAll(regexp));

            params.forEach(el => {
                e.target.value = e.target.value.replace(el[0], '<?php echo $_GET[\'' + el[0].slice(1).slice(0, -1) + '\']; ?>');
            });
            // * show popup if params was here
            params.length ? this.showNotify('Link URL replaced', 'success') : '';
        },
        // * add new block for script
        addNewScriptBlock(e) {
            // TODO: зробити додавання нового блоку
            this.showNotify('Under development');
        },
        // * replase double quotes in textarea
        replaceDoubleQuotes(e) {
            const regexp = /""/g;
            const onesignal = e.target.value.toLowerCase().search('async') !== -1 ? 1 : 0;

            if (!onesignal) {
                e.target.value  = e.target.value.replace(regexp, '"')
                this.showNotify('Doubled quotes replaced', 'success');
            }
        },
        // * add code template to textarea
        addCodeTemplate(e) {
            const textarea = e.target.parentNode.firstChild;
            textarea.value = this.templates[+e.target.dataset.template];
            // * need to resize textarea
            textarea.style.height = "auto";
            textarea.style.height = (textarea.scrollHeight) + "px";
            textarea.focus();
            // * select phrase to replace
            const sub = this.lineToReplace;
            const sp = textarea.value.indexOf(sub);
            const ep = sp + sub.length;
            this.stringToReplase(textarea, sp, ep);
            this.showNotify('Tepmlate #'+ (+e.target.dataset.template + 1) +' added', 'success');
        },
        // * select phrase to replace function
        stringToReplase(el, start, end) {
            if (el.createTextRange) {
                tr = el.createTextRange();
                tr.move("character", start);
                tr.moveEnd("character", end - start);
                tr.select();
            } else if (el.setSelectionRange) {
                el.setSelectionRange(start, end);
            }
        },
        // * copy value from input
        copyValue(e) {
            const str = e.target.previousSibling.value;
            if (str) {
                navigator.clipboard.writeText(str)
                    .then(() => {
                        this.showNotify('Copied', 'success');
                        console.info('Copied:\n' + str);
                    })
                    .catch((err) => {
                        this.showNotify('Error: ' + err.message, 'error');
                        console.error('Error:\n' + err.message);
                    });
            } else {
                this.showNotify('Empty input, nothing to copy');
                console.info('Empty input, nothing to copy')
            }
        },
        // * open link with worker url
        openWorkerLink(e) {
            const url = e.target.previousSibling.value;
            url ? window.open(url, '_blank') : this.showNotify('Empty URL');
        },
        // * creates notify on corner
        showNotify(msg, type) {
            const div = document.createElement('div');

            switch (type) {
                case 'success':
                    div.classList.add('notify__item', 'notify__item-success');
                    break;
                case 'error':
                    div.classList.add('notify__item', 'notify__item-error');
                    break;
                default:
                    div.classList.add('notify__item');
                    break;
            }

            const p = document.createElement('p');
            p.textContent = msg;
            div.appendChild(p);

            const popup = document.querySelector('.notify');
            popup.insertAdjacentElement("beforeend", div);

            setTimeout(() => popup.firstChild.style.transform = 'translateX(120%)', 2500);
            setTimeout(() => popup.removeChild(div), 2800);

        },
        // * open & close modal functions
        showModal() {
            document.querySelector('#modal').style.visibility = 'visible';
            document.querySelector('#modal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        },
        closeModal() {
            document.querySelector('#modal').style.visibility = 'hidden';
            document.querySelector('#modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        },
        // * save templates to array & localStorage
        saveModalData() {
            const area = document.querySelectorAll('.modal__content textarea');
            area.forEach((el, index) => {
                this.templates[index] = el.value;
                localStorage.setItem('temp_' + index, el.value);
            });

            this.showNotify('Templates saved', 'success');
        },
        // * load data to array from localStorage (if it exists)
        loadLocalStorageData() {
            this.templates.forEach( (el, index) => {
                let v = 'temp_' + index;
                localStorage[v] ? this.templates[index] = localStorage[v] : '';
            });
        },
        // confirm before leave
    },
    beforeMount() {
        // load data from localStorage
        this.loadLocalStorageData(),
        // confirm before leave
        window.onbeforeunload = function(e) {
            return 'Unsaved data may be lost. Close tab?'
        };
    }
}

const app = Vue.createApp(code);
const vm = app.mount('#app');