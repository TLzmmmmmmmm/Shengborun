# Production Deployment SOP

本文档用于盛博润网站日常生产发布与回滚。

## 1. Production Environment

```text
Canonical URL:
https://www.shengborun.com

Server:
Alibaba Cloud Lightweight Application Server
Ubuntu 24.04 LTS

Web Server:
Nginx

Application:
Astro Static Site

SSH:
deploy + SSH Key

SSH Alias:
shengborun-prod
```

Production directories:

```text
/var/www/shengborun
    当前生产版本

/var/www/shengborun-next
    待发布版本

/var/www/shengborun-prev
    上一个生产版本，用于回滚
```

Nginx 始终读取：

```text
/var/www/shengborun
```

---

## 2. Normal Deployment

### 2.1 Build

```powershell
$env:Path = "C:\Users\Lenovo\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;$env:Path"
```

在本地项目根目录：

```powershell
pnpm run build
```

Build 必须成功后才能继续。

确认 Git 状态：

```powershell
git status
git rev-parse HEAD
```

建议发布已经 commit 并 push 的版本。

---

### 2.2 Prepare Staging

登录服务器：

```powershell
ssh shengborun-prod
```

清空上一轮 staging：

```bash
rm -rf /var/www/shengborun-next/*
```

> 执行 `rm -rf` 前必须确认路径是 `shengborun-next`，不要删除当前 production 目录。

---

### 2.3 Upload

在本地 Windows PowerShell：

```powershell
scp -r .\dist\* shengborun-prod:/var/www/shengborun-next/
```

上传后检查：

```bash
ls -lah /var/www/shengborun-next
du -sh /var/www/shengborun-next
test -f /var/www/shengborun-next/index.html && echo "index.html OK"
```

至少确认存在：

```text
index.html
_astro/
robots.txt
sitemap-index.xml
```

---

### 2.4 Release

删除旧 rollback：

```bash
sudo rm -rf /var/www/shengborun-prev
```

当前版本转为上一版：

```bash
sudo mv /var/www/shengborun /var/www/shengborun-prev
```

发布新版：

```bash
sudo mv /var/www/shengborun-next /var/www/shengborun
```

重新创建 staging：

```bash
sudo install -d -m 755 -o deploy -g deploy /var/www/shengborun-next
```

普通网站发布不需要 reload Nginx。

---

## 3. Post-Release QA

检查正式网站：

```powershell
curl.exe -I https://www.shengborun.com
```

预期：

```text
200 OK
```

检查 redirects：

```powershell
curl.exe -I http://shengborun.com
curl.exe -I http://www.shengborun.com
curl.exe -I https://shengborun.com
```

均应：

```text
301 → https://www.shengborun.com
```

检查 SEO 文件：

```powershell
curl.exe -I https://www.shengborun.com/robots.txt
curl.exe -I https://www.shengborun.com/sitemap-index.xml
```

均应返回：

```text
200 OK
```

最后使用浏览器检查主要页面、导航、图片和响应式布局。

---

## 4. Rollback

如果新版出现严重问题：

```bash
sudo mv /var/www/shengborun /var/www/shengborun-bad
sudo mv /var/www/shengborun-prev /var/www/shengborun
```

验证：

```bash
curl -I https://www.shengborun.com
```

恢复成功后再调查：

```text
/var/www/shengborun-bad
```

不要在故障状态下继续修改 production 文件。

---

## 5. Infrastructure Rules

普通 Astro 内容发布不要修改：

```text
DNS
Nginx configuration
TLS / Certbot
SSH configuration
Firewall
Server operating system
```

这些属于独立 infrastructure changes。

修改 Nginx 时必须先：

```bash
sudo nginx -t
```

确认成功后才能：

```bash
sudo systemctl reload nginx
```

---

## 6. Basic Server Checks

SSH：

```powershell
ssh shengborun-prod
```

Nginx：

```bash
systemctl status nginx --no-pager
```

磁盘：

```bash
df -h /
```

内存：

```bash
free -h
```

失败服务：

```bash
systemctl --failed --no-pager
```

Nginx 错误日志：

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

---

## 7. Release Checklist

```text
[ ] pnpm run build 成功
[ ] Git revision 已确认
[ ] 清空 shengborun-next
[ ] 上传 dist 到 shengborun-next
[ ] 检查 staging 文件
[ ] current → prev
[ ] next → current
[ ] 重建空 next
[ ] HTTPS WWW 返回 200
[ ] Redirects 返回 301
[ ] robots.txt / sitemap 正常
[ ] 浏览器人工 QA
```

如果任何关键步骤出现异常：

```text
STOP
```

优先保持或恢复当前 production，再调查问题。