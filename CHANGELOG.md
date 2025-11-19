# 更新通知生成指南

## 生成更新通知的逻辑

1. 进入tiktok-matrix项目目录,切换到main分支: git checkout main的main分支;确保是最新代码: git pull origin main
2. 对比最后一个git tag版本和当前main分支的变更内容, 比如: git diff v2.9.9..HEAD
3. 参考下面给出的通知样例,根据变更内容编写更新通知，通知内容面向非技术型用户, 请不要在通知内容中出现关于代码的技术性字眼, 请直接回复我中文和英文的通知内容, 通知内容单独放入代码块中方便复制

## 客户端版本更新通知样例

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
