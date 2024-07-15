/**
 * 文档访问历史，将文档访问历史记录到 localStorage，并显示在页面上
 *
 * 公共库cdn地址：https://cdn.staticfile.net
 */

import { render } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html } from 'htm/preact';

const HISTORY_KEY = 'history';
const FAVORITE_KEY = 'favorite';

const MAX_HISTORY_LENGTH = 30;

const historyStorage = {
  /** 从 localStorage 中获取历史记录 */
  get: function() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  },

  /** 将历史记录保存到 localStorage */
  set: function(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  /** 添加历史记录 */
  add: function(path, title) {
    const history = this.get()
    const index = history.findIndex(item => item.path === path)
    const visited = history[index]?.visited || 0
    if (index >= 0) history.splice(index, 1)
    history.unshift({ path, title, time: Date.now(), visited: visited + 1 })
    if (history.length > MAX_HISTORY_LENGTH)  history.pop()
    this.set(history);
  },

  /** 删除历史记录 */
  remove: function(path) {
    const history = this.get()
    const index = history.findIndex(item => item.path === path);
    if (index >= 0) history.splice(index, 1);
    this.set(history);
  }
}


const favoriteStorage = {
  /** 获取收藏的文档 */
  get: function() {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]');
  },
  /** 将收藏的文档保存到 localStorage */
  set: function(favorite) {
    localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorite));
  },
  /** 添加收藏 */
  add: function(path, title) {
    const favorite = this.get()
    const index = favorite.findIndex(item => item.path === path);
    if (index >= 0) favorite.splice(index, 1)
    favorite.unshift({ path, title, time: Date.now()})
    this.set(favorite);
  },
  /** 取消收藏 */
  remove: function(path) {
    const favorite = this.get()
    const index = favorite.findIndex(item => item.path === path);
    if (index >= 0) favorite.splice(index, 1);
    this.set(favorite);
  }
}

function App () {
  // 弹窗是否展开
  const [expand, setExpand] = useState(false)
  // 收藏的文档
  const [favorite, setFavorite] = useState(favoriteStorage.get());
  // 从 localStorage 中获取历史记录
  const [history, setHistory] = useState(historyStorage.get());
  // top 5 most visited
  const mostVisited = useMemo(
    () => history.filter(item => item.visited > 5).sort((a, b) => b.visited - a.visited).slice(0, 4),
    [history]
  )

  // 点击其他地方关闭弹窗
  useEffect(() => {
    const handleClick = (e) => {
      const $history = document.querySelector('#docReadHistory');
      if ($history && !$history.contains(e.target)) {
        setExpand(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  },[])

  const addFavorite = (path, title) => {
    favoriteStorage.add(path, title);
    setFavorite(favoriteStorage.get());
  }

  const removeFavorite = (path) => {
    favoriteStorage.remove(path);
    setFavorite(favoriteStorage.get());
  }

  const removeHistory = (path) => {
    historyStorage.remove(path);
    setHistory(historyStorage.get());
  }

  function ListItem({title, path}, showDelBtn = true) {
    const isFavorite = favorite.some(item => item.path === path);
    return html`
      <li>
        <a href="#${path}" title=${title}>${title}</a>
        ${isFavorite ?
          html`<button class="favorite-btn" title="取消收藏" onClick=${()=> removeFavorite(path)}><svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z" fill="#42b983" stroke="#42b983" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` :
          html`<button class="favorite-btn" title="收藏" onClick=${()=> addFavorite(path, title)}><svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z" fill="none" stroke="#999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`}
        ${showDelBtn ? html`<button class="favorite-btn" title="从历史记录中删除" onClick=${()=> removeHistory(path)}><svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12L36 36M36 12L12 36" stroke="#999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : ''}
       </li>
    `
  }

  const handleTriggerClick = () => {
    setExpand(!expand)
    if(!expand) setHistory(historyStorage.get())
  }

  return html`
    <div class="history" class="${`history ${expand? 'expand': ''}`}" id="docReadHistory" onClick=${(e)=>e.stopPropagation()}>
      <button class="history-btn" onClick=${handleTriggerClick} >
        历史&收藏
        <svg width="14" height="14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M36 18L24 30L12 18" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="history-popup">

        ${favorite.length ? html`
          <div class="history-section">
            <div class="history-title">收藏</div>
            <ul>${favorite.map((item)=>ListItem(item, false))}</ul>
          </div>
        ` : ''}

        ${mostVisited.length ? html`
          <div class="history-section">
            <div class="history-title">最常访问</div>
            <ul>${mostVisited.map((item)=>ListItem(item, true))}</ul>
          </div>
        ` : ''}

        <div class="history-section">
          <div class="history-title">最近访问</div>
          <ul>${history.map((item)=>ListItem(item, true))}</ul>
        </div>

      </div>
    </div>
  `;

}

function addStyle() {
  const style = document.createElement('style');

  style.innerHTML = `
    .history {
      position: relative;
    }

    .history-btn {
      display: flex;
      align-items: center;
      gap: 2px;
      outline: 0;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      border: 1px solid #eee;
      border-radius: 3px;
    }

    .history-btn:hover,
    .history.expand .history-btn{
      color: #42b983;
      border-color: #42b98399;
    }

    .history-btn:hover svg path,
    .history.expand .history-btn svg path {
      stroke: #42b983;
    }

    .history.expand .history-btn svg {
      transform: rotate(180deg);
    }

    .history-popup {
      display: none;
      position: absolute;
      top: 130%;
      right: -120px;
      width: 300px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 3px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, .2);
      z-index: 100;
      padding-bottom: 10px;
      max-height: calc(100vh - 60px);
      overflow: auto;
    }

    .history.expand .history-popup {
      display: block;
    }

    .history .history-section {
      padding-top: 10px;
    }

    .history .history-section:not(:first-child) {
      margin-top: 10px;
      border-top: 1px solid #eee;
    }

    .history .history-title {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 6px;
      padding: 0 10px;
    }

    .history ul {
      margin: 0;
      padding: 0;
    }

    .history li {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: space-between;
      padding: 4px 10px;
      list-style: none;
    }

    .history li:hover {
      background: #f5f5f5;
      border-radius: 3px;
    }

    .history li .favorite-btn {
      display: none;
      background: none;
      border: 0;
      outline: 0;
      padding: 0;
      cursor: pointer;
    }

    .history li:hover .favorite-btn {
      display: block;
    }

    .history a {
      flex: 1;
      color: #333;
      text-decoration: none;
      font-size: 14px;
      text-overflow: ellipsis;
      overflow: hidden;
      display: block;
      white-space: nowrap;
    }

    .history a:hover {
      text-decoration: underline;
      color: #42b983;
    }
  `;

  document.head.appendChild(style);
}

function init() {
  $docsify = $docsify || {};

  $docsify.plugins = [].concat($docsify.plugins || [],
    function (hook, vm) {
      hook.doneEach(function () {
        const { path } = vm.route;
        const title = document.querySelector('.content h1')?.id

        if (path !== '/' && title) historyStorage.add(path, title);

        if(!document.querySelector("#toolContainer")?.contains(document.querySelector(".history"))) {
          const container = document.createDocumentFragment();
          render(html`<${App} />`, container);
          document.querySelector("#toolContainer")?.prepend(container);
          addStyle();
        }

      });
    }
  );
}

init();
