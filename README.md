<p align="center">
  <img src="public/icon.svg" width="128" height="128" alt="燕大终端图标" />
</p>

<h1 align="center">燕大终端</h1>

<p align="center">
  <a href="README.zh-CN.md">详细文档（中文）</a> · <a href="README.en.md">English</a>
</p>

<p align="center">
  燕山大学教务系统第三方 Android 客户端
</p>

---

> **第三方客户端，与燕山大学官方无任何关联。** 仅供个人学习交流，使用即默认了解并
> 接受相关风险，请勿用于侵犯他人权益或违反学校规定的场景。

## 这是什么

燕大终端是一个 Android 应用，让你更方便地使用燕山大学教务系统。它可以帮你：

- **登录**：CAS 统一认证，支持验证码和 MFA 多因素验证，记住登录状态
- **查成绩**：按学期筛选，查看统计、分布和排名
- **看课表**：合并理论课与实验课，按周切换，桌面和移动端双布局
- **查考试**：按学期查看考试安排
- **看绩点**：学分和绩点一目了然
- **培养方案**：查看课程完成情况和学业预警
- **评教**：一键自动填写最高分，支持批量评教

应用通过 Capacitor 打包为 Android WebView 壳应用，支持 OTA 热更新。

## 安装

从 [GitHub Releases](https://github.com/Youwenqwq/ysu-client/releases) 下载最新的 APK 安装包。

> 如果下载速度较慢，可以在应用内的设置中配置 GitHub 代理镜像。

## 兼容性

应用运行在系统 WebView 中。如遇渲染异常，请检查 WebView 版本是否过低——
**最低要求 Chromium v111**。可通过 Play Store 更新 Android System WebView。

## 技术文档

如果你对项目的技术实现感兴趣，可以查看：

- [中文详细文档](README.zh-CN.md)
- [English](README.en.md)

## 相关项目

业务逻辑参考以下项目实现：

- [ysu-sdk](https://github.com/Youwenqwq/ysu-sdk) — 教务系统 SDK
- [ysu-api](https://github.com/Youwenqwq/ysu-api) — 教务系统 API 服务

## 协议

本项目源代码按 [GPL-3.0 协议](LICENSE) 开放。
