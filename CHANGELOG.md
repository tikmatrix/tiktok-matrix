# 更新通知样例

## 生成更新通知的逻辑

1. git 切换到对应项目的main分支,确保是最新代码
2. 使用git diff命令对比最后一个git tag版本和当前main分支的变更内容
3. 参考下面给出的通知样例,根据变更内容编写更新通知，通知内容面向非技术型用户, 请不要在通知内容中出现关于代码的技术性字眼,分为脚本热更新和客户端版本更新两种类型, 请直接回复我中文的通知内容

## 脚本热更新通知样例

当只需要更新tiktok-agent的项目时,只需要热更新脚本

```md
🔥 **TikMatrix & IGMatrix Script Hot Update**  

🆕 What’s new:  

⚙️ **Popup Handling Improvements**  
- Added new logic to handle **TikTok and Instagram pop-up dialogs** automatically for smoother script execution.  

📸 **IGMatrix Fixes**  
- Fixed an issue causing the **Group Warm-Up Script** to malfunction.  

💡 Just restart TikMatrix or IGMatrix to apply this update — no reinstall required!  

#TikMatrix #IGMatrix #HotUpdate #AutomationTools

```

## 客户端版本更新通知样例

当需要更新tiktok-matrix项目时,需要发布新版本通知

```md
🎵 **TikMatrix & IGMatrix v2.9.9** are live!  

🆕 What’s new:  

⭐ **Super Marketing Script — Merge Tasks for Same Username**  
→ When enabled, multiple targets for the same account will run inside a single task.  
   Even if one target fails, the remaining targets will continue running.  
→ When disabled, each target becomes an independent task — failures are reported immediately for precise monitoring.  

⭐ **Support Ticket System Enhancement**  
→ Added support for uploading **image and video attachments**, making issue reporting faster and more detailed.  

⭐ **Login Script Optimization**  
→ Improved login logic with **clone app support**, ensuring smoother authentication in multi-app environments.  

⭐ **Instagram Post Script Fixes**  
→ Optimized posting flow and **fixed known bugs** for improved stability.  

📥 Download the latest versions:  
TikMatrix: https://tikmatrix.com/Download  
IGMatrix: https://tikmatrix.com/Download-IgMatrix  

⚠️ Mac users must download and reinstall manually (auto-update not supported).  

#TikMatrix #IGMatrix #Update #SuperMarketing #SupportSystem #AutomationTools

```
