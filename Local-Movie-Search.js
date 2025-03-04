// ==UserScript==
// @name         Local Movie Search
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  在网页上添加输入框和按钮，搜索本地电影是否存在
// @author       huangmmd
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 创建输入框和按钮
    const input = document.createElement('input');
    input.placeholder = '输入电影名字';
    input.style.padding = '8px 12px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.style.marginRight = '5px';
    input.style.fontSize = '14px';

    const button = document.createElement('button');
    button.textContent = '搜索本地电影';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#0056b3';
    });
    button.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#007BFF';
    });

    // 创建用于显示结果的元素
    const resultDiv = document.createElement('div');
    resultDiv.style.color = '#333';
    resultDiv.style.marginBottom = '10px';
    resultDiv.style.fontSize = '14px';

    // 将输入框、按钮和结果显示元素添加到页面左下角
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '20px';
    container.style.zIndex = 9999;
    container.style.backgroundColor = 'white';
    container.style.padding = '15px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    container.appendChild(resultDiv);
    container.appendChild(input);
    container.appendChild(button);
    document.body.appendChild(container);

    // 按钮点击事件处理函数
    function performSearch() {
        const movieName = input.value;
        if (movieName) {
            const searchUrl = ``http://localhost:8080/?s=${encodeURIComponent(movieName)}`;

            GM_xmlhttpRequest({
                method: 'GET',
                url: searchUrl,
                onload: function(response) {
                    const commonFormats = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv'];
                    let foundMovies = [];
                    commonFormats.forEach(format => {
                        const regex = new RegExp(`[^\\s"']+${format}`, 'g');
                        let matches = response.responseText.match(regex);
                        if (matches) {
                            foundMovies = foundMovies.concat(matches);
                        }
                    });

                    if (foundMovies.length > 0) {
                        let resultText = '本地存在以下电影：<br>';
                        foundMovies.forEach(movie => {
                            // 对电影路径进行解码
                            let decodedMovie = decodeURIComponent(movie);
                            resultText += `${decodedMovie}<br>`;
                        });
                        resultDiv.innerHTML = resultText;
                        // 5 秒后自动消失结果
                        setTimeout(() => {
                            resultDiv.textContent = '';
                            resultDiv.innerHTML = '';
                        }, 5000);
                    } else {
                        resultDiv.textContent = '本地不存在该电影';
                        // 3 秒后自动消失结果
                        setTimeout(() => {
                            resultDiv.textContent = '';
                        }, 3000);
                    }
                },
                onerror: function() {
                    resultDiv.textContent = '请求失败，请检查 Everything 服务器是否正常运行';
                    // 3 秒后自动消失结果
                    setTimeout(() => {
                        resultDiv.textContent = '';
                    }, 3000);
                }
            });
        } else {
            resultDiv.textContent = '请输入电影名字';
            // 3 秒后自动消失结果
            setTimeout(() => {
                resultDiv.textContent = '';
            }, 3000);
        }
    }

    button.addEventListener('click', performSearch);

    // 绑定快捷键 ALT + C
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 'c') {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                input.value = selectedText;
                // 模拟按钮点击事件进行搜索
                performSearch();
            }
        }
    });
})();