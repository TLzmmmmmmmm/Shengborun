# Production Deployment SOP

本文档定义盛博润网站的生产环境信息、日常发布流程、上线后验证流程和故障回滚流程。

本 SOP 主要用于网站已经完成首次生产部署后的日常版本更新。

> 日常内容或前端版本发布不应修改 DNS、HTTPS、Nginx、SSH 或服务器防火墙配置。

---

## 1. Production Environment

### 1.1 Canonical URL

```text
https://www.shengborun.com
```

其他入口统一重定向：

```text
http://shengborun.com
        ↓ 301

http://www.shengborun.com
        ↓ 301

https://shengborun.com
        ↓ 301

https://www.shengborun.com
        ↓ 200
```

---

### 1.2 Hosting

Production environment:

```text
Cloud Provider:
Alibaba Cloud

Server:
Lightweight Application Server

Region:
China North 2 (Beijing)

Operating System:
Ubuntu 24.04 LTS

Web Server:
Nginx

Application:
Astro Static Site

TLS Certificate:
Let's Encrypt

Certificate Management:
Certbot
```

Production server public IP:

```text
123.57.255.186
```

---

### 1.3 SSH Access

日常服务器管理使用：

```text
User:
deploy

Authentication:
SSH Key

Root SSH:
Disabled

Password SSH:
Disabled
```

本机 SSH alias：

```text
shengborun-prod
```

登录：

```powershell
ssh shengborun-prod
```

不要在 Git repository 中保存：

```text
SSH private keys
Linux passwords
TLS private keys
API keys
Access tokens
Other credentials
```

---

## 2. Production Directory Structure

生产网站目录：

```text
/var/www/shengborun
```

发布使用三个目录：

```text
/var/www/shengborun
    Current production release

/var/www/shengborun-next
    Staging area for the next release

/var/www/shengborun-prev
    Previous production release for rollback
```

Nginx 始终读取：

```text
/var/www/shengborun
```

因此普通网站版本发布不需要修改 Nginx configuration。

---

## 3. Deployment Principles

每次 production release 应遵循：

```text
Local development
        ↓
Validation
        ↓
Production build
        ↓
Git commit / push
        ↓
Upload to staging
        ↓
Staging integrity check
        ↓
Promote staging to production
        ↓
Production QA
        ↓
Keep previous release for rollback
```

禁止直接把未经验证的文件覆盖到：

```text
/var/www/shengborun
```

所有新版本应先上传到：

```text
/var/www/shengborun-next
```

---

# 4. Build a New Release

## 4.1 Confirm Local Repository

在 Windows PowerShell 中进入项目根目录。

确认 Git 状态：

```powershell
git status
```

检查当前 branch：

```powershell
git branch --show-current
```

Production release 原则上应从：

```text
main
```

发布。

---

## 4.2 Run Production Build

执行：

```powershell
pnpm run build
```

Build 必须完整成功。

不要在出现：

```text
Error
Build failed
Content validation failed
Astro check failed
```

的情况下继续部署。

---

## 4.3 Check Build Output

确认：

```powershell
Get-ChildItem .\dist
```

至少应包含：

```text
index.html
_astro/
robots.txt
sitemap-index.xml
```

以及网站对应页面目录。

---

## 4.4 Record Git Revision

执行：

```powershell
git rev-parse HEAD
```

记录当前 production candidate 的 commit SHA。

推荐先完成：

```powershell
git status
git add .
git commit
git push
```

再进行 production deployment。

Production 上线版本应尽量对应一个已经存在于远程 Git repository 的 commit。

---

# 5. Prepare Production Staging

登录服务器：

```powershell
ssh shengborun-prod
```

确认身份：

```bash
whoami
```

预期：

```text
deploy
```

确认 staging 目录：

```bash
ls -ld /var/www/shengborun-next
```

预期 owner / group：

```text
deploy deploy
```

---

## 5.1 Clear Previous Staging Files

确认当前路径：

```bash
pwd
```

然后清理：

```bash
rm -rf /var/www/shengborun-next/*
```

此操作：

```text
只允许删除：
/var/www/shengborun-next/

禁止误删：
/var/www/shengborun
/var/www
/
```

`rm -rf` 属于高风险命令。

执行前必须再次确认完整路径包含：

```text
shengborun-next
```

不要使用：

```bash
sudo rm -rf /var/www/*
```

不要使用：

```bash
sudo rm -rf /
```

---

# 6. Upload the New Build

退出服务器或重新打开 Windows PowerShell。

从项目根目录执行：

```powershell
scp -r .\dist\* shengborun-prod:/var/www/shengborun-next/
```

这里：

```text
.\dist\*
```

表示上传 `dist` 内部内容，而不是把整个 `dist` 目录作为子目录上传。

正确结构：

```text
/var/www/shengborun-next/index.html
/var/www/shengborun-next/_astro/
```

不要形成：

```text
/var/www/shengborun-next/dist/index.html
```

---

# 7. Verify the Staging Release

重新登录：

```powershell
ssh shengborun-prod
```

查看文件：

```bash
ls -lah /var/www/shengborun-next
```

检查总大小：

```bash
du -sh /var/www/shengborun-next
```

确认首页存在：

```bash
test -f /var/www/shengborun-next/index.html && echo "index.html OK"
```

预期：

```text
index.html OK
```

检查 robots：

```bash
test -f /var/www/shengborun-next/robots.txt && echo "robots.txt OK"
```

检查 sitemap：

```bash
test -f /var/www/shengborun-next/sitemap-index.xml && echo "sitemap OK"
```

如果任何关键文件缺失：

```text
STOP DEPLOYMENT
```

不要进行 production switch。

---

# 8. Promote the Release to Production

只有 staging 检查通过后才执行本节。

## 8.1 Remove the Old Rollback Copy

如果已经存在上一轮的：

```text
/var/www/shengborun-prev
```

执行：

```bash
sudo rm -rf /var/www/shengborun-prev
```

这会删除：

```text
上上一个 production release
```

但当前正在运行的网站：

```text
/var/www/shengborun
```

不会受到影响。

---

## 8.2 Move Current Production to Previous

执行：

```bash
sudo mv /var/www/shengborun /var/www/shengborun-prev
```

含义：

```text
Current Production
        ↓
Previous Release
```

---

## 8.3 Promote Staging to Production

立即执行：

```bash
sudo mv /var/www/shengborun-next /var/www/shengborun
```

含义：

```text
Staging Release
        ↓
Current Production
```

Nginx 继续读取：

```text
/var/www/shengborun
```

所以不需要：

```bash
sudo systemctl reload nginx
```

也不需要：

```bash
sudo systemctl restart nginx
```

---

## 8.4 Recreate the Staging Directory

执行：

```bash
sudo install -d -m 755 -o deploy -g deploy /var/www/shengborun-next
```

确认：

```bash
ls -ld \
/var/www/shengborun \
/var/www/shengborun-prev \
/var/www/shengborun-next
```

正常结构：

```text
shengborun
    Current production

shengborun-prev
    Rollback release

shengborun-next
    Empty staging directory
```

---

# 9. Production QA

版本切换完成后必须立即验证 production。

## 9.1 Canonical URL

Windows PowerShell：

```powershell
curl.exe -I https://www.shengborun.com
```

预期：

```text
HTTP/1.1 200 OK
```

---

## 9.2 Redirects

执行：

```powershell
curl.exe -I http://shengborun.com
```

预期：

```text
301 Moved Permanently
Location: https://www.shengborun.com/
```

执行：

```powershell
curl.exe -I http://www.shengborun.com
```

预期：

```text
301 Moved Permanently
Location: https://www.shengborun.com/
```

执行：

```powershell
curl.exe -I https://shengborun.com
```

预期：

```text
301 Moved Permanently
Location: https://www.shengborun.com/
```

---

## 9.3 SEO Public Files

检查：

```powershell
curl.exe -I https://www.shengborun.com/robots.txt
```

预期：

```text
200 OK
```

检查：

```powershell
curl.exe -I https://www.shengborun.com/sitemap-index.xml
```

预期：

```text
200 OK
```

---

## 9.4 404

测试不存在页面：

```powershell
curl.exe -I https://www.shengborun.com/this-page-does-not-exist-release-test
```

预期：

```text
404 Not Found
```

不存在的页面不能返回：

```text
200 OK
```

---

## 9.5 Browser QA

使用浏览器访问：

```text
https://www.shengborun.com
```

至少检查：

```text
Homepage

Products page

Several product detail pages

Solutions page

Several solution detail pages

Support page

About page

Privacy Policy

Legal Notice

Header navigation

Footer navigation

Images

ICP备案 link

HTTPS

Mobile / responsive layout
```

所有关键页面正常后，release 才算完成。

---

# 10. Rollback

如果 production release 出现严重问题，应优先 rollback，而不是直接在线修改 production 文件。

当前目录：

```text
/var/www/shengborun
```

上一版本：

```text
/var/www/shengborun-prev
```

---

## 10.1 Move the Failed Release

执行：

```bash
sudo mv /var/www/shengborun /var/www/shengborun-bad
```

---

## 10.2 Restore Previous Production

执行：

```bash
sudo mv /var/www/shengborun-prev /var/www/shengborun
```

---

## 10.3 Verify Rollback

执行：

```bash
curl -I https://www.shengborun.com
```

预期：

```text
HTTP/1.1 200 OK
```

然后进行浏览器 QA。

---

## 10.4 Preserve the Failed Release

不要立即删除：

```text
/var/www/shengborun-bad
```

应先调查问题原因。

确认不再需要以后再删除。

在下一次部署前，应重新保证目录结构为：

```text
/var/www/shengborun
/var/www/shengborun-next
```

并根据需要保留：

```text
/var/www/shengborun-prev
```

---

# 11. Nginx

Production document root：

```text
/var/www/shengborun
```

普通 Astro release：

```text
不需要修改 Nginx
不需要 reload Nginx
不需要 restart Nginx
```

只有修改：

```text
Domains
Redirect rules
TLS
Caching
Headers
Reverse proxy
Backend API
```

等 infrastructure configuration 时，才需要修改 Nginx。

任何 Nginx 修改后必须先：

```bash
sudo nginx -t
```

只有看到：

```text
syntax is ok
test is successful
```

才能执行：

```bash
sudo systemctl reload nginx
```

---

# 12. HTTPS Certificates

Production TLS certificate：

```text
Let's Encrypt
```

Certificate management：

```text
Certbot
```

当前证书由 Certbot 自动续期。

检查：

```bash
sudo certbot certificates
```

检查定时器：

```bash
systemctl status certbot.timer --no-pager
```

测试续期：

```bash
sudo certbot renew --dry-run
```

普通网站版本发布：

```text
不要重新申请证书
不要修改 Certbot
不要修改 TLS configuration
```

---

# 13. SSH Security

Production SSH policy：

```text
PermitRootLogin no

PasswordAuthentication no

KbdInteractiveAuthentication no

PubkeyAuthentication yes
```

日常登录：

```powershell
ssh shengborun-prod
```

管理员操作：

```bash
sudo <command>
```

不要恢复：

```text
root + password SSH
```

除非明确进行故障恢复并充分了解风险。

---

# 14. Logs

Nginx access log：

```text
/var/log/nginx/access.log
```

Nginx error log：

```text
/var/log/nginx/error.log
```

查看最近访问：

```bash
sudo tail -n 50 /var/log/nginx/access.log
```

查看最近错误：

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

日志使用：

```text
logrotate
```

进行轮转。

当前日志策略：

```text
daily rotation
190 retained rotations
compression enabled
```

查看磁盘占用：

```bash
sudo du -sh /var/log/nginx
```

---

# 15. Server Health Checks

查看 RAM：

```bash
free -h
```

查看 Swap：

```bash
swapon --show
```

查看磁盘：

```bash
df -h /
```

查看网站目录大小：

```bash
du -sh /var/www/shengborun
```

查看失败服务：

```bash
systemctl --failed --no-pager
```

查看监听端口：

```bash
sudo ss -lntup
```

正常公网服务主要为：

```text
22
80
443
```

---

# 16. Infrastructure Changes

以下内容不属于普通 website release：

```text
DNS changes

Domain changes

Nginx configuration changes

TLS configuration changes

SSH configuration changes

Firewall changes

Operating system upgrades

Server migration

Database deployment

Backend API deployment

AI service deployment
```

这些操作必须作为独立 infrastructure change 处理。

不要混入普通内容更新。

---

# 17. Production Backup

服务器已经建立 production baseline snapshot。

在进行重大 infrastructure change 前，建议创建新的磁盘快照。

例如：

```text
Operating system upgrade

Major Nginx change

Backend deployment

AI service deployment

Large server migration
```

普通 Astro 静态内容更新通常不需要每次创建服务器快照，因为：

```text
Git
+
shengborun-prev
```

已经提供版本恢复能力。

---

# 18. Normal Release Checklist

每次普通网站更新按照以下顺序执行：

```text
[ ] git status

[ ] pnpm run build

[ ] Confirm build succeeded

[ ] Commit and push production revision

[ ] Clear /var/www/shengborun-next

[ ] Upload dist → shengborun-next

[ ] Verify staging files

[ ] Remove old shengborun-prev

[ ] Move shengborun → shengborun-prev

[ ] Move shengborun-next → shengborun

[ ] Recreate empty shengborun-next

[ ] Check HTTPS WWW → 200

[ ] Check redirects → 301

[ ] Check robots.txt

[ ] Check sitemap-index.xml

[ ] Check 404

[ ] Browser QA

[ ] Keep previous release for rollback
```

---

# 19. Emergency Rule

如果 deployment 中出现无法确定的问题：

```text
STOP
```

不要继续执行：

```text
rm -rf
mv
DNS modification
Nginx modification
Firewall modification
SSH modification
```

优先确认：

```text
当前 production 是否仍然正常
当前目录结构
当前 Git commit
当前 Nginx 状态
```

如果新版已经影响 production：

```text
优先 rollback
```

恢复服务以后再调查原因。

---

# 20. Production Architecture Summary

```text
Internet
    ↓
Alibaba Cloud DNS
    ↓
shengborun.com
www.shengborun.com
    ↓
Alibaba Cloud Lightweight Application Server
    ↓
Firewall
    ├── TCP 22
    ├── TCP 80
    └── TCP 443
    ↓
Nginx
    ├── HTTP → HTTPS WWW
    ├── HTTPS bare domain → HTTPS WWW
    └── HTTPS WWW
            ↓
    /var/www/shengborun
            ↓
        Astro Static Site
```

Canonical production origin:

```text
https://www.shengborun.com
```