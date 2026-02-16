// 全局变量
let pyodide;
let updateCount = 0;
const MAX_IGNORE_COUNT = 3;
const CURRENT_VERSION = '1.0';
const LATEST_VERSION = '1.1';

// 初始化函数
async function init() {
    // 加载Pyodide
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        console.log('Pyodide 加载成功');
    } catch (error) {
        console.error('Pyodide 加载失败:', error);
        document.getElementById('output').textContent = 'Pyodide 加载失败，请刷新页面重试';
    }
    
    // 检查本地存储中的忽略次数
    const storedCount = localStorage.getItem('updateIgnoreCount');
    if (storedCount) {
        updateCount = parseInt(storedCount);
    }
    
    // 检查版本更新
    checkVersionUpdate();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 绑定事件监听器
function bindEventListeners() {
    // 运行按钮
    document.getElementById('run-btn').addEventListener('click', runCode);
    
    // 清空按钮
    document.getElementById('clear-btn').addEventListener('click', clearCode);
    
    // 更新按钮
    document.getElementById('update-now').addEventListener('click', updateNow);
    document.getElementById('update-later').addEventListener('click', updateLater);
}

// 运行Python代码
async function runCode() {
    const code = document.getElementById('code-editor').value;
    const outputElement = document.getElementById('output');
    
    if (!code.trim()) {
        outputElement.textContent = '请输入Python代码';
        return;
    }
    
    try {
        outputElement.textContent = '运行中...';
        
        // 重定向标准输出
        pyodide.globals.set('print', (text) => {
            outputElement.textContent += text + '\n';
        });
        
        // 运行代码
        await pyodide.runPythonAsync(code);
        
        // 如果没有输出，显示成功信息
        if (outputElement.textContent === '运行中...') {
            outputElement.textContent = '代码运行成功，无输出';
        }
    } catch (error) {
        outputElement.textContent = '错误: ' + error.message;
    }
}

// 清空代码
function clearCode() {
    document.getElementById('code-editor').value = '';
    document.getElementById('output').textContent = '';
}

// 检查版本更新
function checkVersionUpdate() {
    // 这里模拟从GitHub获取最新版本
    // 实际项目中，应该通过API请求获取最新版本信息
    
    if (CURRENT_VERSION !== LATEST_VERSION) {
        // 检查是否已经忽略了多次
        if (updateCount >= MAX_IGNORE_COUNT) {
            // 强制更新
            forceUpdate();
        } else {
            // 显示更新提示
            showUpdateModal();
        }
    }
}

// 显示更新模态框
function showUpdateModal() {
    const modal = document.getElementById('update-modal');
    const countElement = document.getElementById('update-count');
    
    countElement.textContent = `忽略次数: ${updateCount}/${MAX_IGNORE_COUNT}`;
    modal.style.display = 'block';
}

// 立即更新
function updateNow() {
    // 这里模拟更新操作
    // 实际项目中，应该下载并应用最新版本
    
    document.getElementById('update-modal').style.display = 'none';
    
    // 更新版本号
    document.getElementById('version').textContent = `v${LATEST_VERSION}`;
    
    // 重置忽略计数
    updateCount = 0;
    localStorage.setItem('updateIgnoreCount', '0');
    
    // 显示更新成功信息
    document.getElementById('output').textContent = '更新成功！已更新到最新版本 v1.1';
}

// 稍后更新
function updateLater() {
    // 增加忽略计数
    updateCount++;
    localStorage.setItem('updateIgnoreCount', updateCount.toString());
    
    // 关闭模态框
    document.getElementById('update-modal').style.display = 'none';
    
    // 检查是否达到最大忽略次数
    if (updateCount >= MAX_IGNORE_COUNT) {
        // 下次强制更新
        setTimeout(() => {
            forceUpdate();
        }, 1000);
    }
}

// 强制更新
function forceUpdate() {
    // 显示强制更新提示
    const modal = document.getElementById('update-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <h2>必须更新</h2>
        <p>当前版本: v${CURRENT_VERSION}</p>
        <p>最新版本: v${LATEST_VERSION}</p>
        <p>您已经忽略了${MAX_IGNORE_COUNT}次更新，必须更新才能继续使用。</p>
        <div class="modal-buttons">
            <button id="update-now">立即更新</button>
        </div>
    `;
    
    // 重新绑定事件监听器
    document.getElementById('update-now').addEventListener('click', updateNow);
    
    modal.style.display = 'block';
}

// 监听模态框外部点击
window.onclick = function(event) {
    const modal = document.getElementById('update-modal');
    if (event.target === modal) {
        // 不允许点击外部关闭模态框，必须做出选择
    }
};

// 初始化应用
window.addEventListener('DOMContentLoaded', init);