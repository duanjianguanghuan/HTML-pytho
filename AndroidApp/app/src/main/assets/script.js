// 全局变量
let pyodide;
let updateCount = 0;
const MAX_IGNORE_COUNT = 3;
const CURRENT_VERSION = '1.0';
let LATEST_VERSION = '1.0';
const REPO_OWNER = 'duanjianguanghuan';
const REPO_NAME = 'HTML-pytho';

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
    
    // 全面检测
    await comprehensiveCheck();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 全面检测
async function comprehensiveCheck() {
    console.log('开始全面检测...');
    
    // 检查网络连接
    if (!navigator.onLine) {
        console.warn('网络连接不可用，将在网络恢复后进行版本检查');
        // 监听网络恢复事件
        window.addEventListener('online', checkVersionUpdate);
    } else {
        // 检查版本更新
        await checkVersionUpdate();
    }
    
    // 检查本地存储
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('本地存储正常');
    } catch (error) {
        console.error('本地存储异常:', error);
        // 处理本地存储异常
        updateCount = 0;
    }
    
    console.log('全面检测完成');
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
async function checkVersionUpdate() {
    console.log('检查版本更新...');
    
    try {
        // 从GitHub API获取最新版本信息
        // 这里我们可以通过检查仓库的最新提交或标签来确定版本
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const commits = await response.json();
        
        if (commits && commits.length > 0) {
            // 假设最新的提交代表最新版本
            // 这里我们可以从提交信息中提取版本号，或者使用提交哈希作为版本标识
            const latestCommit = commits[0];
            const commitSha = latestCommit.sha.substring(0, 7);
            
            // 这里我们模拟版本号，实际项目中应该从提交信息或标签中提取
            // 为了演示，我们假设最新版本是1.1
            LATEST_VERSION = '1.1';
            
            console.log(`当前版本: v${CURRENT_VERSION}`);
            console.log(`最新版本: v${LATEST_VERSION}`);
            console.log(`最新提交: ${commitSha}`);
            
            if (CURRENT_VERSION !== LATEST_VERSION) {
                // 检查是否已经忽略了多次
                if (updateCount >= MAX_IGNORE_COUNT) {
                    // 强制更新
                    forceUpdate();
                } else {
                    // 显示更新提示
                    showUpdateModal();
                }
            } else {
                console.log('当前已是最新版本');
            }
        }
    } catch (error) {
        console.error('版本检查失败:', error);
        // 版本检查失败时，不阻止用户使用应用
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
async function updateNow() {
    console.log('开始更新...');
    
    const modal = document.getElementById('update-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // 显示更新进度
    modalContent.innerHTML = `
        <h2>更新中</h2>
        <p>正在下载并应用最新版本...</p>
        <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px; margin: 20px 0;">
            <div id="update-progress" style="width: 0%; height: 20px; background-color: #4CAF50; border-radius: 5px; transition: width 0.3s;"></div>
        </div>
        <p id="update-status">准备更新...</p>
    `;
    
    try {
        // 模拟更新过程
        // 实际项目中，应该下载并应用最新版本
        
        // 更新进度
        let progress = 0;
        const progressBar = document.getElementById('update-progress');
        const statusElement = document.getElementById('update-status');
        
        const updateSteps = [
            { status: '检查更新包', progress: 20 },
            { status: '下载更新包', progress: 50 },
            { status: '验证更新包', progress: 70 },
            { status: '应用更新', progress: 90 },
            { status: '完成更新', progress: 100 }
        ];
        
        for (const step of updateSteps) {
            statusElement.textContent = step.status;
            progress = step.progress;
            progressBar.style.width = `${progress}%`;
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 隐藏模态框
        modal.style.display = 'none';
        
        // 更新版本号
        document.getElementById('version').textContent = `v${LATEST_VERSION}`;
        
        // 重置忽略计数
        updateCount = 0;
        localStorage.setItem('updateIgnoreCount', '0');
        
        // 重新启用页面功能
        document.getElementById('code-editor').disabled = false;
        document.getElementById('run-btn').disabled = false;
        document.getElementById('clear-btn').disabled = false;
        
        // 显示更新成功信息
        document.getElementById('output').textContent = `更新成功！已更新到最新版本 v${LATEST_VERSION}`;
        
        console.log(`更新成功！已更新到最新版本 v${LATEST_VERSION}`);
        
        // 实际项目中，这里应该重新加载应用或刷新页面
        // window.location.reload();
    } catch (error) {
        console.error('更新失败:', error);
        
        // 显示更新失败信息
        modalContent.innerHTML = `
            <h2>更新失败</h2>
            <p>更新过程中出现错误，请稍后重试。</p>
            <p>错误信息: ${error.message}</p>
            <div class="modal-buttons">
                <button id="update-retry">重试</button>
                <button id="update-cancel">取消</button>
            </div>
        `;
        
        // 绑定重试和取消按钮事件
        document.getElementById('update-retry').addEventListener('click', updateNow);
        document.getElementById('update-cancel').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
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
    console.log('强制更新');
    
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
    
    // 禁用页面其他功能，强制用户更新
    document.getElementById('code-editor').disabled = true;
    document.getElementById('run-btn').disabled = true;
    document.getElementById('clear-btn').disabled = true;
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