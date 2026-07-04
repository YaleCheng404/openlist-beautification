// v8-login

class Beautifier {
    /**
        * Beautifier 类用于美化页面背景色
        * 
        * 其提供了3个方法：
        * - observe: 开始监听页面变化并美化背景色
        * - disconnect: 停止监听页面变化
        * - undo: 恢复页面背景色到默认状态
        *
        * 可以通过window.beautifier访问实例对象
        * 
     */
    static ignoredSelectors = [
        '.hope-tooltip', // 提示小标签及其装饰
        '.hope-tooltip__arrow',
        '.hope-checkbox__control',// 复选框
        '.hope-modal__overlay', // 模态框遮罩 
        '.hope-drawer__overlay', // 抽屉遮罩
        '.hope-select__option', // 下拉选项
        '.monaco-editor, .monaco-editor *', // 代码编辑器
        '.art-video-player, .art-video-player *', // 视频播放器
        'button:not(.hope-menu__trigger)', // 除目录外按钮
        'svg' // SVG 图标
    ];

    static ignoredSelector = Beautifier.ignoredSelectors.join(',');

    static lightBgColor = 'rgba(255, 255, 255, 0.8)';
    static darkBgColor = 'rgb(32, 36, 37)';

    static specificPrefix = 'rgba(132, 133, 141,';

    constructor() {
        this.observer = null;
        this.frameId = 0;
        this.pendingElements = new Set();
        this.handleMutations = this.handleMutations.bind(this);
    }

    shouldBeautifyPath() {
        return !location.pathname.startsWith('/@manage') && !location.pathname.startsWith('/@login');
    }

    getTheme(element) {
        if (element.closest('.hope-ui-light')) {
            return 'light';
        }

        if (element.closest('.hope-ui-dark')) {
            return 'dark';
        }

        return '';
    }

    shouldIgnore(element) {
        return element.matches(Beautifier.ignoredSelector) || Boolean(element.closest(Beautifier.ignoredSelector));
    }

    rewriteElement(element) {
        if (!(element instanceof Element) || element.matches('.hope-ui-light, .hope-ui-dark') || this.shouldIgnore(element)) {
            return;
        }

        const theme = this.getTheme(element);

        if (!theme) {
            return;
        }

        const bgColor = theme === 'light' ? Beautifier.lightBgColor : Beautifier.darkBgColor;

        if (element.dataset.beautifierTheme === theme && element.style.backgroundColor === bgColor) {
            return;
        }

        const { backgroundColor } = getComputedStyle(element);

        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && !backgroundColor.startsWith(Beautifier.specificPrefix)) {
            element.style.backgroundColor = bgColor;
            element.dataset.beautified = 'true';
            element.dataset.beautifierTheme = theme;
        }
    }

    rewriteSubtree(root) {
        if (!(root instanceof Element)) {
            return;
        }

        this.rewriteElement(root);
        root.querySelectorAll('*').forEach(element => this.rewriteElement(element));
    }

    schedule(root = document.body) {
        if (!root || !this.shouldBeautifyPath()) {
            return;
        }

        this.pendingElements.add(root);

        if (!this.frameId) {
            this.frameId = requestAnimationFrame(() => {
                this.frameId = 0;

                if (!this.shouldBeautifyPath()) {
                    this.pendingElements.clear();
                    return;
                }

                const roots = [...this.pendingElements];
                this.pendingElements.clear();
                roots.forEach(element => this.rewriteSubtree(element));
            });
        }
    }

    handleMutations(records) {
        records.forEach(record => {
            if (record.type === 'attributes') {
                this.schedule(record.target);
                return;
            }

            record.addedNodes.forEach(node => {
                if (node instanceof Element) {
                    this.schedule(node);
                }
            });
        });
    }

    observe() {
        if (!document.body) {
            return;
        }

        this.disconnect();

        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true
        });

        this.schedule();
    }

    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }

        this.pendingElements.clear();
    }

    undo() {
        this.disconnect();

        document.body.querySelectorAll('[data-beautified]').forEach(element => {
            element.style.backgroundColor = '';

            element.removeAttribute('data-beautified');
            element.removeAttribute('data-beautifier-theme');
        });
    }
}

const beautifier = new Beautifier();
window.beautifier = beautifier;

beautifier.observe();
