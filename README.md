# 反腐倡廉 铁腕行动

一个具有政治讽刺主题的打地鼠游戏。

## 在线体验

[点击这里玩游戏](#) *(添加你的部署链接)*

## 特性

- 全平台支持（PC + 移动端）
- 触摸优化，响应迅速
- 震撼的视觉特效
- 厚重的音效反馈
- 连击系统和评分机制

## 玩法

- 点击出现的目标人物进行打击
- 打中贪官 +1分
- 误伤好人 -2分
- 连续命中3次以上触发连击奖励
- 30秒内获得尽可能高的分数

## 本地运行

本项目为纯静态网站，无需构建工具。

```bash
# 直接打开
open index.html

# 或使用本地服务器
python3 -m http.server 8000

# 然后访问
http://localhost:8000
```

## 部署

纯静态网站，可部署到任何静态托管平台：

```bash
# GitHub Pages
git push origin master

# Vercel
npx vercel

# Netlify Drop
# 访问 app.netlify.com/drop 拖拽上传
```

## 添加角色

在 `js/script.js` 中修改角色数组：

```javascript
// 坏人（打中加分）
const badGuys = [
  { id: 'xxx', img: 'img/bad_guys/xxx.png', name: '名字' },
];

// 好人（打中扣分）
const goodGuys = [
  { id: 'xxx', img: 'img/good_guys/xxx.png', name: '名字' },
];
```

然后把对应的 PNG 图片放到文件夹里即可。

## 技术栈

- HTML5
- CSS3 (响应式设计)
- Vanilla JavaScript
- Web Audio API

无任何框架依赖，文件体积 < 2MB
